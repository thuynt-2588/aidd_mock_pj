import type { SupabaseClient } from "@supabase/supabase-js";

import type { KudosFilters } from "./filters";
import { normalizeKudoDoc } from "./kudo-doc";
import {
  FEED_PAGE_SIZE,
  HIGHLIGHT_COUNT,
  type FilterOptions,
  type GiftRecipient,
  type KudosStats,
  type KudoView,
  type SpotlightData,
} from "./kudos-types";

// Reads for the Sun* Kudos board. Every call runs as the signed-in user, so
// RLS (authenticated read) applies; `hearted_by_me` uses auth.uid().

const FEED_COLUMNS =
  "id,title,content,image_urls,created_at,sender_id,sender_name,sender_avatar_url,sender_department,sender_distinct_senders," +
  "receiver_id,receiver_name,receiver_avatar_url,receiver_department,receiver_distinct_senders,hashtags,heart_count,hearted_by_me," +
  "content_doc,is_anonymous";

type FeedRow = {
  id: string;
  title: string;
  content: string;
  image_urls: string[];
  created_at: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_avatar_url: string | null;
  sender_department: string | null;
  sender_distinct_senders: number;
  receiver_id: string;
  receiver_name: string;
  receiver_avatar_url: string | null;
  receiver_department: string | null;
  receiver_distinct_senders: number;
  hashtags: string[];
  heart_count: number;
  hearted_by_me: boolean;
  content_doc: unknown;
  is_anonymous: boolean;
};

function toKudoView(r: FeedRow): KudoView {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    // Re-validated on read too: the column is only ever written by create_kudo,
    // but a malformed document must never reach the renderer.
    contentDoc: r.content_doc ? normalizeKudoDoc(r.content_doc) : null,
    isAnonymous: r.is_anonymous ?? false,
    imageUrls: r.image_urls ?? [],
    createdAt: r.created_at,
    sender: {
      id: r.sender_id,
      // Anonymous kudos: the alias, or "" for the UI's "Ẩn danh".
      name: r.sender_name ?? "",
      avatarUrl: r.sender_avatar_url,
      department: r.sender_department,
      distinctSenders: r.sender_distinct_senders,
    },
    receiver: {
      id: r.receiver_id,
      name: r.receiver_name,
      avatarUrl: r.receiver_avatar_url,
      department: r.receiver_department,
      distinctSenders: r.receiver_distinct_senders,
    },
    hashtags: r.hashtags ?? [],
    heartCount: r.heart_count,
    heartedByMe: r.hearted_by_me,
  };
}

// No generated DB types: rows are typed by the caller (`T`), matching the views.
function check<T>(result: { data: unknown; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Sun* Kudos: could not load ${what}: ${result.error.message}`);
  return result.data as T;
}

// Department filter = the receiver's department ("kudos received by CEVC10").
function feedQuery(supabase: SupabaseClient, filters: KudosFilters) {
  let query = supabase.from("kudos_feed").select(FEED_COLUMNS);
  if (filters.hashtag) query = query.contains("hashtags", [filters.hashtag]);
  if (filters.department) query = query.eq("receiver_department", filters.department);
  return query;
}

/** B: the 5 kudos with the most hearts (ties: newest first). */
export async function getHighlightKudos(supabase: SupabaseClient, filters: KudosFilters): Promise<KudoView[]> {
  const rows = check<FeedRow[]>(
    await feedQuery(supabase, filters)
      .order("heart_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(HIGHLIGHT_COUNT),
    "highlight kudos",
  );
  return rows.map(toKudoView);
}

/** C: newest first, one page of FEED_PAGE_SIZE from `offset`. */
export async function getKudosPage(supabase: SupabaseClient, filters: KudosFilters, offset: number): Promise<KudoView[]> {
  const rows = check<FeedRow[]>(
    await feedQuery(supabase, filters)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + FEED_PAGE_SIZE - 1),
    "kudos",
  );
  return rows.map(toKudoView);
}

export async function getKudoView(supabase: SupabaseClient, id: string): Promise<KudoView | null> {
  const rows = check<FeedRow[]>(await supabase.from("kudos_feed").select(FEED_COLUMNS).eq("id", id).limit(1), "kudos");
  return rows[0] ? toKudoView(rows[0]) : null;
}

/** B.7: receivers for the word cloud, total count, latest 5 for the live feed. */
export async function getSpotlight(supabase: SupabaseClient): Promise<SpotlightData> {
  const [people, total, recent] = await Promise.all([
    supabase
      .from("kudos_receiver_stats")
      .select("profile_id,full_name,kudos_count,last_received_at,latest_kudo_id")
      .order("kudos_count", { ascending: false })
      .limit(300),
    supabase.from("kudos").select("id", { count: "exact", head: true }),
    supabase.from("kudos_feed").select("id,receiver_name,created_at").order("created_at", { ascending: false }).limit(5),
  ]);
  if (total.error) throw new Error(`Sun* Kudos: could not count kudos: ${total.error.message}`);
  type PersonRow = { profile_id: string; full_name: string; kudos_count: number; last_received_at: string; latest_kudo_id: string };
  type RecentRow = { id: string; receiver_name: string; created_at: string };
  return {
    totalKudos: total.count ?? 0,
    people: check<PersonRow[]>(people, "spotlight").map((p) => ({
      profileId: p.profile_id,
      name: p.full_name,
      kudosCount: p.kudos_count,
      lastReceivedAt: p.last_received_at,
      latestKudoId: p.latest_kudo_id,
    })),
    recent: check<RecentRow[]>(recent, "recent kudos").map((r) => ({ id: r.id, receiverName: r.receiver_name, createdAt: r.created_at })),
  };
}

/** D.1: the signed-in user's numbers. */
export async function getMyStats(supabase: SupabaseClient): Promise<KudosStats> {
  type Row = { kudos_received: number; kudos_sent: number; hearts_received: number; boxes_opened: number; boxes_unopened: number };
  const rows = check<Row[]>(await supabase.rpc("my_kudos_stats"), "stats");
  const r = rows[0];
  return {
    kudosReceived: r?.kudos_received ?? 0,
    kudosSent: r?.kudos_sent ?? 0,
    heartsReceived: r?.hearts_received ?? 0,
    boxesOpened: r?.boxes_opened ?? 0,
    boxesUnopened: r?.boxes_unopened ?? 0,
  };
}

/** D.3: the 10 latest Sunners who opened a box with a gift. */
export async function getRecentGiftRecipients(supabase: SupabaseClient): Promise<GiftRecipient[]> {
  type Row = { id: string; profile_id: string; full_name: string; avatar_url: string | null; gift: string };
  const rows = check<Row[]>(
    await supabase
      .from("recent_gift_recipients")
      .select("id,profile_id,full_name,avatar_url,gift")
      .order("opened_at", { ascending: false })
      .limit(10),
    "gift recipients",
  );
  return rows.map((r) => ({ id: r.id, profileId: r.profile_id, name: r.full_name, avatarUrl: r.avatar_url, gift: r.gift }));
}

/**
 * D.1.4 "x2" badge: today (Vietnam date, the same date the heart trigger
 * uses) is a special day set by an admin, so each heart counts twice.
 * Returns that date (YYYY-MM-DD), or null on a normal day.
 */
export async function getSpecialDayToday(supabase: SupabaseClient): Promise<string | null> {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
  const rows = check<{ day: string }[]>(await supabase.from("special_days").select("day").eq("day", today).limit(1), "special days");
  return rows.length > 0 ? today : null;
}

/** B.1.1 / B.1.2: dropdown options. */
export async function getFilterOptions(supabase: SupabaseClient): Promise<FilterOptions> {
  const [tags, depts] = await Promise.all([
    supabase.from("hashtags").select("name").order("name"),
    supabase.from("departments").select("code").order("code"),
  ]);
  return {
    hashtags: check<{ name: string }[]>(tags, "hashtags").map((t) => t.name),
    departments: check<{ code: string }[]>(depts, "departments").map((d) => d.code),
  };
}

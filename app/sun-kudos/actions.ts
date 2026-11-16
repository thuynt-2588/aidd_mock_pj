"use server";

import { refresh } from "next/cache";

import { parseKudosFilters } from "@/lib/kudos/filters";
import { getKudosPage, getKudoView } from "@/lib/kudos/kudos-queries";
import type { KudoView } from "@/lib/kudos/kudos-types";
import { kudoImageFolderUrl, validateKudoDraft, type DraftErrors, type SunnerOption } from "@/lib/kudos/write-kudo";
import { getSupabaseEnv } from "@/lib/supabase/supabase-env";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

// Server Functions for the Sun* Kudos board. Arguments come from the client,
// so they are validated; the database (RLS + trigger) enforces the heart rules.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_OFFSET = 10_000;

async function signedInClient() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return { supabase, userId: user.id };
}

export type HeartResult = { hearted: boolean; heartCount: number };

/**
 * C.4.1: one heart per user per kudos; un-hearting takes it back. The client
 * sends the state it wants (not "toggle"), so a repeated or crossed request
 * cannot flip it twice. The sender cannot heart their own kudos (database
 * trigger). Returns the saved state.
 */
export async function setKudoHeartAction(kudoId: string, hearted: boolean): Promise<HeartResult> {
  if (typeof kudoId !== "string" || !UUID.test(kudoId)) throw new Error("Invalid kudos id");
  if (typeof hearted !== "boolean") throw new Error("Invalid heart state");
  const { supabase, userId } = await signedInClient();

  const change = hearted
    ? await supabase.from("kudo_hearts").upsert({ kudo_id: kudoId, user_id: userId }, { onConflict: "kudo_id,user_id", ignoreDuplicates: true })
    : await supabase.from("kudo_hearts").delete().eq("kudo_id", kudoId).eq("user_id", userId);
  if (change.error) throw new Error(change.error.message);

  const kudo = await getKudoView(supabase, kudoId);
  if (!kudo) throw new Error("Kudos not found");
  return { hearted: kudo.heartedByMe, heartCount: kudo.heartCount };
}

/** C: next page ("Xem thêm"). */
export async function loadMoreKudosAction(
  filters: { hashtag: string | null; department: string | null },
  offset: number,
): Promise<KudoView[]> {
  if (!Number.isInteger(offset) || offset < 0 || offset > MAX_OFFSET) throw new Error("Invalid offset");
  const safe = parseKudosFilters({ hashtag: filters?.hashtag ?? undefined, department: filters?.department ?? undefined });
  const { supabase } = await signedInClient();
  return getKudosPage(supabase, safe, offset);
}

const MAX_QUERY = 100;

/** "Viết Kudo" B.2 / "@" mentions: other Sunners whose name contains `query` (no diacritics). */
export async function searchSunnersAction(query: string): Promise<SunnerOption[]> {
  if (typeof query !== "string") throw new Error("Invalid query");
  const q = query.trim().slice(0, MAX_QUERY);
  const { supabase } = await signedInClient();
  const { data, error } = await supabase.rpc("search_sunners", { q });
  if (error) throw new Error(error.message);
  return (data as { id: string; full_name: string; avatar_url: string | null; department: string | null }[]).map((r) => ({
    id: r.id,
    name: r.full_name,
    avatarUrl: r.avatar_url,
    department: r.department,
  }));
}

export type CreateKudoResult = { ok: true; id: string } | { ok: false; errors: DraftErrors; failed?: true };

/**
 * "Viết Kudo" H.2 "Gửi". Validates the draft (images must already be in the
 * sender's own folder of the kudo-images bucket), then `create_kudo` writes the
 * kudos and its hashtags in one transaction, checking the same rules in SQL.
 */
export async function createKudoAction(draft: unknown): Promise<CreateKudoResult> {
  const { supabase, userId } = await signedInClient();
  const { data: tags, error: tagError } = await supabase.from("hashtags").select("name");
  if (tagError) throw new Error(tagError.message);

  const checked = validateKudoDraft(draft, {
    senderId: userId,
    imageUrlPrefix: kudoImageFolderUrl(getSupabaseEnv().url, userId),
    knownHashtags: (tags as { name: string }[]).map((t) => t.name),
  });
  if (!checked.ok) return { ok: false, errors: checked.errors };

  const d = checked.value;
  const { data, error } = await supabase.rpc("create_kudo", {
    p_receiver_id: d.receiverId,
    p_title: d.title,
    p_content: d.content,
    p_content_doc: d.doc,
    p_hashtags: d.hashtags,
    p_image_urls: d.imageUrls,
    p_is_anonymous: d.anonymous,
    p_anonymous_name: d.anonymousName,
  });
  if (error) {
    // The receiver may have been deleted since it was picked.
    if (error.message.includes("invalid receiver")) return { ok: false, errors: { receiver: "invalid" } };
    console.error("create_kudo failed", error.message);
    return { ok: false, errors: {}, failed: true };
  }
  // Re-render the board so the new kudos shows up (All Kudos, Spotlight, stats).
  refresh();
  return { ok: true, id: data as string };
}

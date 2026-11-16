"use server";

import { parseKudosFilters } from "@/lib/kudos/filters";
import { getKudosPage, getKudoView } from "@/lib/kudos/kudos-queries";
import type { KudoView } from "@/lib/kudos/kudos-types";
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
 * C.4.1: one heart per user per kudos; clicking again removes it. The sender
 * cannot heart their own kudos (database trigger). Returns the new state.
 */
export async function toggleKudoHeartAction(kudoId: string): Promise<HeartResult> {
  if (typeof kudoId !== "string" || !UUID.test(kudoId)) throw new Error("Invalid kudos id");
  const { supabase, userId } = await signedInClient();

  const existing = await supabase.from("kudo_hearts").select("kudo_id").eq("kudo_id", kudoId).eq("user_id", userId).maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  const change = existing.data
    ? await supabase.from("kudo_hearts").delete().eq("kudo_id", kudoId).eq("user_id", userId)
    : await supabase.from("kudo_hearts").insert({ kudo_id: kudoId });
  if (change.error) throw new Error(change.error.message);

  const kudo = await getKudoView(supabase, kudoId);
  if (!kudo) throw new Error("Kudos not found");
  return { hearted: kudo.heartedByMe, heartCount: kudo.heartCount };
}

/** C: next page for the infinite scroll. */
export async function loadMoreKudosAction(
  filters: { hashtag: string | null; department: string | null },
  offset: number,
): Promise<KudoView[]> {
  if (!Number.isInteger(offset) || offset < 0 || offset > MAX_OFFSET) throw new Error("Invalid offset");
  const safe = parseKudosFilters({ hashtag: filters?.hashtag ?? undefined, department: filters?.department ?? undefined });
  const { supabase } = await signedInClient();
  return getKudosPage(supabase, safe, offset);
}

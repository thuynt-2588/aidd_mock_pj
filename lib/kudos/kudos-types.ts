// Shapes read from the Sun* Kudos views (supabase/migrations/*_sun_kudos.sql).

export type KudoPerson = {
  id: string;
  name: string;
  avatarUrl: string | null;
  department: string | null;
  /** Different Sunners who have sent this person kudos (hero badge tier). */
  distinctSenders: number;
};

export type KudoView = {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  sender: KudoPerson;
  receiver: KudoPerson;
  hashtags: string[];
  heartCount: number;
  heartedByMe: boolean;
};

export type KudosStats = {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  boxesOpened: number;
  boxesUnopened: number;
};

export type GiftRecipient = { id: string; profileId: string; name: string; avatarUrl: string | null; gift: string };

export type SpotlightEntry = {
  profileId: string;
  name: string;
  kudosCount: number;
  lastReceivedAt: string;
  latestKudoId: string;
};

export type SpotlightData = {
  totalKudos: number;
  people: SpotlightEntry[];
  /** Latest kudos first: "08:30PM <receiver> đã nhận được một Kudos mới". */
  recent: { id: string; receiverName: string; createdAt: string }[];
};

export type FilterOptions = { hashtags: string[]; departments: string[] };

export const HIGHLIGHT_COUNT = 5;
export const FEED_PAGE_SIZE = 10;

import type { HeroBadge } from "@/lib/kudos/format";
import type { Locale } from "./locale-config";

// Copy for "Sun* Kudos - Live board" (MoMorph MaZUn5xHXZ). Figma is
// Vietnamese; English is a proposed translation. Proper names (Sun* Annual
// Awards 2025, HIGHLIGHT KUDOS, SPOTLIGHT BOARD, ALL KUDOS) stay as in Figma.
export interface KudosMessages {
  heroTitle: string;
  kudosLogoAlt: string;
  sendPlaceholder: string;
  searchProfile: string;
  caption: string;
  highlightTitle: string;
  spotlightTitle: string;
  allTitle: string;
  filterHashtag: string;
  filterDepartment: string;
  filterAll: string;
  prev: string;
  next: string;
  copyLink: string;
  viewDetail: string;
  linkCopied: string;
  heartLabel: string;
  ownKudosHeart: string;
  /** Toast when a heart could not be saved (it is undone). */
  heartFailed: string;
  specialDayHearts: string;
  /** Badge hover: title + description per tier. */
  heroHover: Record<HeroBadge, { title: string; text: string }>;
  /** Campaign hover; {from} / {to} become "00:00 <campaignDayWord> DD/MM" / "23:59 …". */
  campaignTitle: string;
  campaignText: string;
  campaignDayWord: string;
  empty: string;
  noData: string;
  loading: string;
  seeMore: string;
  attachmentAlt: string;
  spotlightKudos: string;
  spotlightSearch: string;
  spotlightPanZoom: string;
  spotlightReceived: string;
  spotlightNotFound: string;
  stats: { received: string; sent: string; hearts: string; boxesOpened: string; boxesUnopened: string };
  openGift: string;
  giftTitle: string;
  /** Shown instead of the sender of an anonymous kudos without an alias. */
  anonymousSender: string;
  /** "Viết Kudo" dialog (MoMorph ihQ26W78P2). */
  write: WriteKudoMessages;
}

export interface WriteKudoMessages {
  title: string;
  recipient: string;
  recipientPlaceholder: string;
  noSunner: string;
  searching: string;
  badge: string;
  badgePlaceholder: string;
  badgeHint: string;
  contentLabel: string;
  contentPlaceholder: string;
  mentionHint: string;
  /** Locale for the "0/1.000" counter numbers. */
  numberLocale: string;
  counterLabel: string;
  communityStandards: string;
  tools: { bold: string; italic: string; strike: string; numbered: string; link: string; quote: string };
  hashtag: string;
  hashtagMax: string;
  removeHashtag: string;
  image: string;
  imageMax: string;
  removeImage: string;
  imageRejected: string;
  anonymous: string;
  anonymousName: string;
  anonymousPlaceholder: string;
  cancel: string;
  send: string;
  sending: string;
  sent: string;
  close: string;
  link: { title: string; text: string; url: string; save: string };
  errors: {
    required: string;
    tooLong: string;
    invalid: string;
    tooMany: string;
    url: string;
    receiver: string;
    failed: string;
    upload: string;
  };
}

const vi: KudosMessages = {
  heroTitle: "Hệ thống ghi nhận và cảm ơn",
  kudosLogoAlt: "SAA 2025 KUDOS",
  sendPlaceholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
  searchProfile: "Tìm kiếm profile Sunner",
  caption: "Sun* Annual Awards 2025",
  highlightTitle: "HIGHLIGHT KUDOS",
  spotlightTitle: "SPOTLIGHT BOARD",
  allTitle: "ALL KUDOS",
  filterHashtag: "Hashtag",
  filterDepartment: "Phòng ban",
  filterAll: "Tất cả",
  prev: "Kudos trước",
  next: "Kudos tiếp theo",
  copyLink: "Copy Link",
  viewDetail: "Xem chi tiết",
  linkCopied: "Link copied — ready to share!",
  heartLabel: "Thả tim",
  ownKudosHeart: "Bạn không thể thả tim cho Kudos của chính mình",
  heartFailed: "Không thể thả tim lúc này. Vui lòng thử lại.",
  specialDayHearts: "Hôm nay là ngày đặc biệt: mỗi lượt tim được tính x2",
  heroHover: {
    "New Hero": {
      title: "Có 1–4 người gửi Kudos cho bạn",
      text: "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
    },
    "Rising Hero": {
      title: "Có 5–9 người gửi Kudos cho bạn",
      text: "Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.",
    },
    "Super Hero": {
      title: "Có 10–20 người gửi Kudos cho bạn",
      text: "Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.",
    },
    "Legend Hero": {
      title: "Có hơn 20 người gửi Kudos cho bạn",
      text: "Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.",
    },
  },
  campaignTitle: "Ngày x2 tim – lan tỏa gấp đôi yêu thương!",
  campaignText: "Từ {from} đến {to}, tất cả tim bạn nhận được đều được nhân đôi.",
  campaignDayWord: "ngày",
  empty: "Hiện tại chưa có Kudos nào.",
  noData: "Chưa có dữ liệu",
  loading: "Đang tải…",
  seeMore: "Xem thêm",
  attachmentAlt: "Ảnh đính kèm",
  spotlightKudos: "KUDOS",
  spotlightSearch: "Tìm kiếm",
  spotlightPanZoom: "Pan/Zoom",
  spotlightReceived: "đã nhận được một Kudos mới",
  spotlightNotFound: "Không tìm thấy Sunner",
  stats: {
    received: "Số Kudos bạn nhận được:",
    sent: "Số Kudos bạn đã gửi:",
    hearts: "Số tim bạn nhận được:",
    boxesOpened: "Số Secret Box bạn đã mở:",
    boxesUnopened: "Số Secret Box chưa mở:",
  },
  openGift: "Mở Secret Box",
  giftTitle: "10 SUNNER NHẬN QUÀ\nMỚI NHẤT",
  anonymousSender: "Ẩn danh",
  write: {
    title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
    recipient: "Người nhận",
    recipientPlaceholder: "Tìm kiếm",
    noSunner: "Không tìm thấy Sunner",
    searching: "Đang tìm…",
    badge: "Danh hiệu",
    badgePlaceholder: "Dành tặng một danh hiệu cho đồng đội",
    badgeHint: "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
    contentLabel: "Nội dung lời cám ơn",
    contentPlaceholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
    mentionHint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
    numberLocale: "vi-VN",
    counterLabel: "Số ký tự",
    communityStandards: "Tiêu chuẩn cộng đồng",
    tools: { bold: "In đậm", italic: "In nghiêng", strike: "Gạch ngang", numbered: "Danh sách đánh số", link: "Chèn đường dẫn", quote: "Trích dẫn" },
    hashtag: "Hashtag",
    hashtagMax: "Tối đa 5",
    removeHashtag: "Xóa",
    image: "Image",
    imageMax: "Tối đa 5",
    removeImage: "Xóa ảnh",
    imageRejected: "Chỉ nhận ảnh PNG, JPG, WEBP, GIF tối đa 5 MB.",
    anonymous: "Gửi lời cám ơn và ghi nhận ẩn danh",
    anonymousName: "Nickname ẩn danh",
    anonymousPlaceholder: "Ẩn danh",
    cancel: "Hủy",
    send: "Gửi",
    sending: "Đang gửi…",
    sent: "Đã gửi Kudos!",
    close: "Đóng",
    link: { title: "Thêm đường dẫn", text: "Nội dung", url: "URL", save: "Lưu" },
    errors: {
      required: "Vui lòng nhập trường này.",
      tooLong: "Nội dung quá dài.",
      invalid: "Giá trị không hợp lệ.",
      tooMany: "Tối đa 5.",
      url: "URL phải bắt đầu bằng http:// hoặc https://",
      receiver: "Vui lòng chọn một Sunner khác trong danh sách.",
      failed: "Không gửi được Kudos. Vui lòng thử lại.",
      upload: "Không tải được ảnh lên. Vui lòng thử lại.",
    },
  },
};

const en: KudosMessages = {
  ...vi,
  heroTitle: "Recognition & thank-you system",
  sendPlaceholder: "Who would you like to thank and recognise today?",
  searchProfile: "Search Sunner profiles",
  filterDepartment: "Department",
  filterAll: "All",
  prev: "Previous kudos",
  next: "Next kudos",
  viewDetail: "View details",
  heartLabel: "Heart",
  ownKudosHeart: "You cannot heart your own kudos",
  heartFailed: "Could not save your heart. Please try again.",
  specialDayHearts: "Special day: every heart counts x2",
  heroHover: {
    "New Hero": {
      title: "1–4 Sunners have sent you Kudos",
      text: "Your journey of spreading good things has begun – the first thanks and recognition have found their way to you.",
    },
    "Rising Hero": {
      title: "5–9 Sunners have sent you Kudos",
      text: "You are growing in your teammates’ hearts through your kindness and dedication.",
    },
    "Super Hero": {
      title: "10–20 Sunners have sent you Kudos",
      text: "You have become a trusted and beloved figure, always ready to help and remembered by many teammates.",
    },
    "Legend Hero": {
      title: "More than 20 Sunners have sent you Kudos",
      text: "You have become a legend – leaving an unforgettable mark on the team with your heart and actions.",
    },
  },
  campaignTitle: "Double-heart day – spread twice the love!",
  campaignText: "From {from} to {to}, every heart you receive counts double.",
  campaignDayWord: "on",
  empty: "There are no kudos yet.",
  noData: "No data yet",
  loading: "Loading…",
  seeMore: "See more",
  attachmentAlt: "Attached image",
  spotlightSearch: "Search",
  spotlightReceived: "received a new kudos",
  spotlightNotFound: "No Sunner found",
  stats: {
    received: "Number of Kudos you received:",
    sent: "Number of Kudos you sent:",
    hearts: "Number of hearts you received:",
    boxesOpened: "Secret Boxes you opened:",
    boxesUnopened: "Secret Boxes not opened yet:",
  },
  openGift: "Open Secret Box",
  giftTitle: "10 LATEST SUNNERS\nRECEIVING GIFTS",
  anonymousSender: "Anonymous",
  write: {
    title: "Send thanks and recognition to a teammate",
    recipient: "Recipient",
    recipientPlaceholder: "Search",
    noSunner: "No Sunner found",
    searching: "Searching…",
    badge: "Title",
    badgePlaceholder: "Give your teammate a title",
    badgeHint: "Example: The one who keeps me motivated.\nThe title is shown as the heading of your Kudos.",
    contentLabel: "Thank-you message",
    contentPlaceholder: "Write your thanks and recognition for your teammate here!",
    mentionHint: "Type “@ + name” to mention another teammate",
    numberLocale: "en-US",
    counterLabel: "Characters",
    communityStandards: "Community standards",
    tools: { bold: "Bold", italic: "Italic", strike: "Strikethrough", numbered: "Numbered list", link: "Insert link", quote: "Quote" },
    hashtag: "Hashtag",
    hashtagMax: "Up to 5",
    removeHashtag: "Remove",
    image: "Image",
    imageMax: "Up to 5",
    removeImage: "Remove image",
    imageRejected: "Only PNG, JPG, WEBP or GIF images up to 5 MB.",
    anonymous: "Send thanks and recognition anonymously",
    anonymousName: "Anonymous nickname",
    anonymousPlaceholder: "Anonymous",
    cancel: "Cancel",
    send: "Send",
    sending: "Sending…",
    sent: "Kudos sent!",
    close: "Close",
    link: { title: "Add link", text: "Text", url: "URL", save: "Save" },
    errors: {
      required: "Please fill in this field.",
      tooLong: "This is too long.",
      invalid: "This value is not valid.",
      tooMany: "Up to 5.",
      url: "The URL must start with http:// or https://",
      receiver: "Please choose another Sunner from the list.",
      failed: "Could not send the Kudos. Please try again.",
      upload: "Could not upload the images. Please try again.",
    },
  },
};

const messages: Record<Locale, KudosMessages> = { vi, en };

export function getKudosMessages(locale: Locale): KudosMessages {
  return messages[locale];
}

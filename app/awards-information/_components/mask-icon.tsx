// 24x24 Figma media icon (MM_MEDIA_Target / Diamond / License) painted with
// currentColor through a CSS mask, so it follows the text colour (white or
// gold) of the menu item / label it sits in.
export function MaskIcon({ src }: { src: string }) {
  const mask = `url(${src}) center / contain no-repeat`;
  return <span aria-hidden className="inline-block size-6 shrink-0 bg-current" style={{ mask, WebkitMask: mask }} />;
}

export const ICON_TARGET = "/awards/icon-target.svg";
export const ICON_DIAMOND = "/awards/icon-diamond.svg";
export const ICON_LICENSE = "/awards/icon-license.svg";

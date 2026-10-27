/** Whether a nav item is the current section: its own page or a page under it. ("/news" is
 *  current on "/news/a-story" but not on "/newsletter/confirm".) */
export function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

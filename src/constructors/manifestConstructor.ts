export function maniChapter(id: string, href: string) {
  return `<item id="${id}" href="${href}" media-type="application/xhtml+xml" />`;
}
export function maniNav() {
  return `<item properties="nav" id="toc" href="toc.html" media-type="application/xhtml+xml" />`;
}
export function maniToc() {
  return `<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>`;
}

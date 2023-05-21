export function maniChapter(id: string, href: string) {
  return `<item id="${id}" href="${href}" media-type="application/xhtml+xml" />`;
}
export function maniNav() {
  return `<item properties="nav" id="toc" href="toc.html" media-type="application/xhtml+xml" />`;
}
export function maniToc() {
  return `<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>`;
}

export function maniStyle() {
  return `<item href="styles.css" id="css1" media-type="text/css"/>`;
}
export function maniCover() {
  return `<item id="cover" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image" />`;
}

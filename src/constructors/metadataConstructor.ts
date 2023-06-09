import { EpubSettings } from "../../types";

export function createMetadata(epubSettings: EpubSettings) {
  return `
    <dc:title>${epubSettings.title ?? "Unnamed"}</dc:title>
    <dc:creator >${epubSettings.author ?? "Unnamed"}</dc:creator>
    <dc:description>${epubSettings.description ?? "None"}</dc:description>
    <dc:language>${epubSettings.language ?? "en"}</dc:language>
    <dc:identifier id="BookId">${epubSettings.bookId}</dc:identifier>
    <dc:rights id="rights">${epubSettings.rights ?? "None"}</dc:rights>
    <dc:source id="source">${epubSettings.source ?? "None"}</dc:source>
    <dc:date>${new Date().toISOString()}</dc:date>
    <meta property="dcterms:modified">${
      new Date().toISOString().split(".")[0] + "Z"
    }</meta>
    <meta name="cover" content="cover"/>`;
}


import { EpubChapter } from "../../types";
import { createFile } from "./helper";

export function createChapter(chapter: EpubChapter) {
  return createFile(
    `EPUB/${chapter.fileName}`,
    `
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <head>
            <link rel="stylesheet" type="text/css" href="../styles.css"/>
            <title>${chapter.title}</title>
            <script src="../script.js"></script>
        </head>
        <body onload="fnEpub()">
            ${chapter.htmlBody}
        </body>
    </html>
      `
  );
}

import { EpubChapter } from "../../types";
import { createFile } from "./helper";

export function createChapter(chapter: EpubChapter) {
  var param = "";
  if (chapter.parameter && chapter.parameter.length > 0)
    param = chapter.parameter
      .map(
        (a) => `<param name="${a.name}" value="${a.value}">${a.value}</param>`
      )
      .join("\n");

  return createFile(
    `EPUB/${chapter.fileName}`,
    `
    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <head>
            <link rel="stylesheet" type="text/css" href="styles.css"/>
            <title>${chapter.title}</title>
            <parameter>
                ${param}
            </parameter>
        </head>
        <body>
            ${chapter.htmlBody}
        </body>
    </html>
      `
  );
}

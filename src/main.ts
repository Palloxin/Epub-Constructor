import { parse } from "node-html-parser";
import * as p from "node-html-parser";
import { Parameter, EpubChapter, File, EpubSettings } from "../types";
import {
  createFile,
  getValidName,
  isValid,
  parseJSon,
  sleep,
} from "./methods/helper";
import { createStyle } from "./methods/createStyle";
import {
  metaAuthor,
  metaDate,
  metaDesc,
  metaId,
  metaLang,
  metaSource,
  metaStyle,
  metaTitle,
} from "./constructors/metadataConstructor";
import { createChapter } from "./methods/createChapter";
import { maniChapter, maniNav, maniToc } from "./constructors/manifestConstructor";

export type { Parameter, EpubChapter, File, EpubSettings };

export const EpubSettingsLoader = async (
  file: File[],
  localOnProgress?: (progress: number) => void
) => {
  try {
    var jsonSettingsFile = file.find((x) => x.path.endsWith(".json"));
    if (jsonSettingsFile) {
      return parseJSon(jsonSettingsFile.content) as EpubSettings;
    }
    var dProgress = 0.01;
    localOnProgress?.(dProgress);
    var epubSettings = { chapters: [] as EpubChapter[] } as EpubSettings;
    if (!isValid(file, ["toc.ncx", "toc.html", ".opf", "styles.css"])) {
      throw "This is not a valid Epub file created by this library(epub-constructor)";
    }

    var pageContent =
      file.find((x) => x.path.indexOf(".opf") != -1)?.content ?? "";
    var style =
      file.find((x) => x.path.indexOf("styles.css") != -1)?.content ?? "";
    var chapters = [] as string[] | p.HTMLElement[];

    epubSettings.stylesheet = style;
    var page = undefined as undefined | p.HTMLElement;
    page = parse(pageContent);
    epubSettings.parameter = page.querySelectorAll("param").map((a) => {
      return {
        name: a.getAttribute("name"),
        value: a.getAttribute("value"),
      } as Parameter;
    });
    epubSettings.title = page.querySelector(".title").innerText;
    epubSettings.author = page.querySelector(".rights").innerText;
    epubSettings.description = page.querySelector(".description").innerText;
    epubSettings.language = page.querySelector(".language").innerText;
    epubSettings.bookId = page.querySelector(".identifier").innerHTML;
    epubSettings.source = page.querySelector(".source").innerText;
    chapters = page.querySelectorAll("itemref");

    const len = chapters.length + 1;
    var index = 0;
    for (let x of chapters) {
      try {
        var content = "";
        var chItem = "" as string;
        var chId = x.getAttribute("idref");
        chItem =
          page
            ?.querySelector("item[id='" + chId + "']")
            ?.getAttribute("href") ?? "";
        content = file.find((x) => x.path.indexOf(chItem) != -1)?.content ?? "";
        var chapter = parse(content);
        epubSettings.chapters.push({
          parameter: chapter.querySelectorAll("param").map((a: any) => {
            return {
              name: a.getAttribute("name"),
              value: a.getAttribute("value"),
            } as Parameter;
          }),
          title: chapter.querySelector("title")?.innerText ?? "",
          htmlBody: chapter.querySelector("body").innerHTML,
        });
        dProgress = (index / parseFloat(len.toString())) * 100;
        localOnProgress?.(dProgress);
        index++;
        await sleep(0);
      } catch (error) {
        console.error(error);
      }
    }
    dProgress = (len / parseFloat(len.toString())) * 100;
    localOnProgress?.(dProgress);
    return epubSettings;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = epubSettings;
  }

  async constructEpub(localOnProgress?: (progress: number) => Promise<void>) {
    var files = [] as File[];
    files.push(createFile("mimetype", "application/epub+zip"));
    var metadata = [""];
    var manifest = [""];
    var spine = [""];
    var dProgress = 0;
    const len = this.epubSettings.chapters.length;

    this.epubSettings.bookId =
      this.epubSettings.bookId ?? new Date().getUTCMilliseconds().toString();
    this.epubSettings.fileName =
      this.epubSettings.fileName ?? this.epubSettings.title;
    if (
      this.epubSettings.fileName.endsWith(".epub") ||
      this.epubSettings.fileName.endsWith(".opf")
    ) {
      this.epubSettings.fileName = this.epubSettings.fileName
        .replace(".opf", "")
        .replace(".epub", "");
    }
    files.push(
      createFile(
        "META-INF/container.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
      <rootfile full-path="OEBPS/${this.epubSettings.fileName}.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
      </container>`
      )
    );
    files.push(
      createFile("OEBPS/styles.css", createStyle(this.epubSettings.stylesheet))
    );

    var epub = `<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">{#metadata}</metadata>
    <manifest>{#manifest}</manifest>
    <spine toc="ncx">{#spine}</spine>
    </package>`;
    var ncxToc = `<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en" dir="ltr">
	<head>
		<meta name="dtb:uid" content="http://digitalpublishingtoolkit.org/ExampleEPUB.html" />
		<meta name="dtb:depth" content="${this.epubSettings.chapters.length}" />
		<meta name="dtb:totalPageCount" content="${this.epubSettings.chapters.length}" />
		<meta name="dtb:maxPageNumber" content="0" />
	</head>
	<docTitle>
		<text>${this.epubSettings.title} EPUB</text>
	</docTitle>

	<docAuthor>
		<text>${this.epubSettings.author}</text>
	</docAuthor>

	<navMap>
  {#navMap}
	</navMap>
</ncx>
`;

    var htmlToc = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <title>${this.epubSettings.title} - TOC</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
        {#ol}
      </ol>
    </nav>
  </body>
</html>`;
    metadata.push(metaTitle(this.epubSettings.title));
    metadata.push(metaLang(this.epubSettings.language));
    metadata.push(metaId(this.epubSettings.bookId));
    metadata.push(metaDesc(this.epubSettings.description));
    metadata.push(metaDate());
    metadata.push(metaAuthor(this.epubSettings.author));
    metadata.push(metaSource(this.epubSettings.source));
    metadata.push(metaStyle());

    var index = 1;
    var navMap = [""];
    var ol = [""];

    for (var chapter of this.epubSettings.chapters) {
      dProgress = ((index - 1) / parseFloat(len.toString())) * 100;

      chapter.fileName = chapter.fileName ?? getValidName(chapter);
      if (!chapter.fileName.endsWith(".html")) chapter.fileName += ".html";

      manifest.push(
        maniChapter(chapter.title + index.toString(), chapter.fileName)
      );
      spine.push(`<itemref idref="${chapter.title + index}" ></itemref>`);
      files.push(createChapter(chapter));

      ol.push(`<li><a href="${chapter.fileName}">${chapter.title}</a></li>`);
      navMap.push(
        `<navPoint id="${
          chapter.title + index
        }" playOrder="${index}"> <navLabel> <text>${
          chapter.title
        }</text> </navLabel> <content src="${chapter.fileName}" /></navPoint>`
      );

      index++;

      if (localOnProgress) await localOnProgress?.(dProgress);
      if (index % 300 === 0 && localOnProgress) await sleep(0);
    }

    manifest.push(maniNav());
    manifest.push(maniToc());

    epub = epub.replace("#manifest", manifest.join("\n"));
    epub = epub.replace("#spine", spine.join("\n"));
    epub = epub.replace("#metadata", metadata.join("\n"));
    ncxToc = ncxToc.replace("#navmap", navMap.join("\n"));
    htmlToc = htmlToc.replace("#ol", ol.join("\n"));

    files.push(
      createFile(
        `OEBPS/${this.epubSettings.fileName}.json`,
        JSON.stringify(this.epubSettings)
      )
    );
    files.push(
      createFile(
        `OEBPS/${this.epubSettings.fileName}.opf`,
        `<?xml version="1.0" encoding="utf-8"?>\n` + epub
      )
    );
    files.push(
      createFile(
        "OEBPS/toc.html",
        `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n` + htmlToc
      )
    );
    files.push(createFile("OEBPS/toc.ncx", ncxToc));
    
    if (localOnProgress)
      await localOnProgress?.((len / parseFloat(len.toString())) * 100);
    return files;
  }

  // extract EpubSettings from epub file.
  static async load(file: File[]) {
    return await EpubSettingsLoader(file);
  }
}

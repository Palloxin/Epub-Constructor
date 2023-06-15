import { parse } from "node-html-parser";
import * as p from "node-html-parser";
import {
  Parameter,
  EpubChapter,
  File,
  EpubSettings,
  InternalEpubChapter,
} from "../types";
import {
  createFile,
  isValid,
  parseJSon,
  sleep,
  getImageType,
  clearFileNameType,
  setChapterFileNames,
} from "./methods/helper";
import { createStyle } from "./methods/createStyle";
import { createMetadata } from "./constructors/metadataConstructor";
import { createChapter } from "./methods/createChapter";
import {
  maniChapter,
  maniCover,
  maniImage,
  maniNav,
  maniStyle,
  maniToc,
} from "./constructors/manifestConstructor";
import {
  defaultContainer,
  defaultEpub,
  defaultHtmlToc,
  defaultNcxToc,
} from "./constructors/defaultsConstructor";

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
    if (!isValid(file, ["toc.ncx", "toc.xhtml", ".opf", "styles.css"])) {
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
    epubSettings.author = page.querySelector(".author").innerText;
    epubSettings.rights = page.querySelector(".rights").innerText;
    epubSettings.description = page.querySelector(".description").innerText;
    epubSettings.language = page.querySelector(".language").innerText;
    epubSettings.bookId = page.querySelector(".identifier").innerHTML;
    epubSettings.source = page.querySelector(".source").innerText;
    chapters = page.querySelectorAll("itemref");

    if (!epubSettings.chapters) {
      epubSettings.chapters = [] as EpubChapter[];
    }

    const len = chapters.length + 1;
    var index = 0;
    for (let x of chapters) {
      try {
        var content = "";
        var chItem = "";
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
        throw error;
      }
    }
    dProgress = (len / parseFloat(len.toString())) * 100;
    localOnProgress?.(dProgress);
    return epubSettings;
  } catch (error) {
    throw error;
  }
};

export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = epubSettings;
  }

  public async constructEpub(
    localOnProgress?: (progress: number) => Promise<void>
  ) {
    var files = [] as File[];
    files.push(createFile("mimetype", "application/epub+zip"));
    var metadata = "";
    var manifest = [""];
    var spine = [""];
    var dProgress = 0;

    if (!this.epubSettings.chapters) {
      throw new Error("Epub file needs at least one chapter");
    }

    const len = this.epubSettings.chapters.length;

    this.epubSettings.bookId =
      this.epubSettings.bookId ?? new Date().getUTCMilliseconds().toString();
    this.epubSettings.fileName = clearFileNameType(
      (this.epubSettings.fileName ?? this.epubSettings.title).replace(/\s/g, "_")
    );

    if (this.epubSettings.cover) {
      const fileType = getImageType(this.epubSettings.cover);
      files.push(
        createFile(
          "EPUB/images/cover." + fileType,
          this.epubSettings.cover,
          true
        )
      );
      manifest.push(maniCover());
    }
    files.push(
      createFile(
        "META-INF/container.xml",
        defaultContainer(this.epubSettings.fileName)
      )
    );
    files.push(
      createFile("EPUB/styles.css", createStyle(this.epubSettings.stylesheet))
    );
    var epub = defaultEpub();
    var ncxToc = defaultNcxToc(
      this.epubSettings.chapters.length,
      this.epubSettings.title,
      this.epubSettings.bookId,
      this.epubSettings.author
    );

    var htmlToc = defaultHtmlToc(this.epubSettings.title);
    metadata = createMetadata(this.epubSettings);
    var navMap = [""];
    var ol = [""];

    this.epubSettings.chapters = setChapterFileNames(
      this.epubSettings.chapters
    );
    var index = 1;
    for (var chapter of this.epubSettings.chapters as InternalEpubChapter[]) {
      dProgress = ((index - 1) / parseFloat(len.toString())) * 100;

      let idRef = chapter.title.replace(/\s/g, "_") + "_" + index.toString();

      var i = 0;

      chapter.htmlBody = chapter.htmlBody.replace(
        /(?<=<img[^>]+src=(?:\"|')).+?(?=\"|')/gi,
        (uri: string) => {
          i++;
          const fileType = getImageType(uri);
          const path = `images/${idRef + i}.` + fileType;
          files.push(createFile(`EPUB/${path}`, uri, true));
          manifest.push(maniImage(path))
          return `../${path}`;
        }
      ).replace(/<br>/g,'').replace(/\&nbsp/g,'');

      manifest.push(maniChapter(idRef, chapter.fileName));
      files.push(createChapter(chapter));

      spine.push(`<itemref idref="${idRef}" ></itemref>`);
      ol.push(`<li><a href="${chapter.fileName}">${chapter.title}</a></li>`);
      navMap.push(
        `<navPoint id="${idRef}" playOrder="${index}"> 
          <navLabel> 
            <text>${chapter.title}</text>
          </navLabel> <content src="${chapter.fileName}" />
        </navPoint>`
      );

      index++;

      if (localOnProgress) await localOnProgress?.(dProgress);
      if (index % 300 === 0 && localOnProgress) await sleep(0);
    }

    manifest.push(maniNav());
    manifest.push(maniStyle());
    manifest.push(maniToc());

    epub = epub.replace("#manifest", manifest.join("\n"));
    epub = epub.replace("#spine", spine.join("\n"));
    epub = epub.replace("#metadata", metadata);
    ncxToc = ncxToc.replace("#navMap", navMap.join("\n"));
    htmlToc = htmlToc.replace("#ol", ol.join("\n"));

    files.push(createFile(`EPUB/${this.epubSettings.fileName}.opf`, epub));
    files.push(
      createFile(
        "EPUB/toc.xhtml",
        `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n` + htmlToc
      )
    );
    files.push(createFile("EPUB/toc.ncx", ncxToc));

    if (localOnProgress)
      await localOnProgress?.((len / parseFloat(len.toString())) * 100);
    return files;
  }

  // extract EpubSettings from epub file.
  static async load(file: File[]) {
    return await EpubSettingsLoader(file);
  }
}


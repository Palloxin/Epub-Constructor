import { File, EpubSettings, InternalEpubChapter } from "../types";
import {
  createFile,
  sleep,
  getImageType,
  removeFileExtension,
  setChapterFileNames,
} from "./methods/helper";
import { createStyle } from "./methods/createStyle";
import { createMetadata } from "./constructors/metadataConstructor";
import { createChapter } from "./methods/createChapter";
import {
  manifestChapter,
  manifestCover,
  manifestImage,
  manifestNav,
  manifestStyle,
  manifestToc,
} from "./constructors/manifestConstructor";
import {
  defaultContainer,
  defaultEpub,
  defaultHtmlToc,
  defaultNcxToc,
} from "./constructors/defaultsConstructor";
import { EpubSettingsLoader } from "./loader/EpubSettingsLoader";

export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = epubSettings;
  }

  /**
   * Constructs the EPUB file based on the provided settings.
   * @param localOnProgress Optional callback function to track the progress of EPUB construction.
   * @returns An array of File objects representing the files in the EPUB.
   * @throws Error if the EPUB file needs at least one chapter.
   */
  public async constructEpub(
    localOnProgress?: (progress: number) => Promise<void>
  ): Promise<File[]> {
    const files: File[] = [];
    const manifest: string[] = [];
    const spine: string[] = [];
    let dProgress = 0;

    if (
      !this.epubSettings.chapters ||
      this.epubSettings.chapters.length === 0
    ) {
      throw new Error("Epub file needs at least one chapter");
    }
    if (!this.epubSettings.title || this.epubSettings.title.trim() === "") {
      throw new Error("Epub file needs a title");
    }

    const len = this.epubSettings.chapters.length;

    this.epubSettings.bookId ??= new Date().getUTCMilliseconds().toString();
    this.epubSettings.fileName = removeFileExtension(
      (this.epubSettings.fileName ?? this.epubSettings.title).replace(
        /\s/g,
        "_"
      )
    );

    if (this.epubSettings.cover) {
      const fileType = getImageType(this.epubSettings.cover);
      const coverFilePath = `EPUB/images/cover.${fileType}`;
      files.push(createFile(coverFilePath, this.epubSettings.cover, true));
      manifest.push(manifestCover());
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
    files.push(
      createFile(
        "EPUB/script.js",
        `function fnEpub(){${this.epubSettings.js ?? ""}}`
      )
    );

    let epub = defaultEpub();
    let ncxToc = defaultNcxToc(
      this.epubSettings.chapters.length,
      this.epubSettings.title,
      this.epubSettings.bookId,
      this.epubSettings.author
    );
    let htmlToc = defaultHtmlToc(this.epubSettings.title);
    let metadata = createMetadata(this.epubSettings);
    const navMap: string[] = [];
    const ol: string[] = [];

    this.epubSettings.chapters = setChapterFileNames(
      this.epubSettings.chapters
    );
    console.log(this.epubSettings.chapters);

    for (let index = 0; index < len; index++) {
      const chapter = this.epubSettings.chapters[index] as InternalEpubChapter;
      dProgress = (index / len) * 100;

      const idRef = `${chapter.title.replace(/\s/g, "_")}_image_`;

      let imageIndex = 0;
      chapter.htmlBody = chapter.htmlBody
        .replace(/(?<=<img[^>]+src=(?:\"|')).+?(?=\"|')/gi, (uri: string) => {
          imageIndex++;
          const fileType = getImageType(uri);
          const path = `images/${idRef + imageIndex}.${fileType}`;
          files.push(createFile(`EPUB/${path}`, uri, true));
          manifest.push(manifestImage(path));
          return `../${path}`;
        })
        .replace(/\&nbsp/g, "")
        .replace(/(<img[^>]+>)(?!\s*<\/img>)/g, "$1</img>")
        .replace(/<\/?(?:html|head|body|input|br)[^>]*>/g, "");

      manifest.push(manifestChapter(idRef, chapter.fileName));
      files.push(createChapter(chapter));

      spine.push(`<itemref idref="${idRef}" ></itemref>`);
      ol.push(`<li><a href="${chapter.fileName}">${chapter.title}</a></li>`);
      navMap.push(
        `<navPoint id="${idRef}" playOrder="${index + 1}"> 
          <navLabel> 
            <text>${chapter.title}</text>
          </navLabel> <content src="${chapter.fileName}" />
        </navPoint>`
      );

      if (localOnProgress && index % 300 === 0) {
        await sleep(0);
      }
      if (localOnProgress) {
        await localOnProgress(dProgress);
      }
    }

    manifest.push(manifestNav());
    manifest.push(manifestStyle());
    manifest.push(manifestToc());

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

    if (localOnProgress) {
      await localOnProgress(len);
    }

    return files;
  }

  /**
   * Extracts EPUB settings from an existing EPUB file.
   * @param file An array of File objects representing the files in the EPUB.
   * @returns The extracted EPUB settings.
   */
  static async load(file: File[]): Promise<EpubSettings> {
    return await EpubSettingsLoader(file);
  }
}


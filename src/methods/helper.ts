import { EpubChapter, File, InternalEpubChapter } from "../../types";

export function createFile(path: string, content: string, isImage?: boolean) {
  return {
    path,
    content,
    isImage,
  } as File;
}

export function isValid(file: File[], content: string[]) {
  for (var i = 0; i < content.length; i++) {
    var item = file.find((x) => x.path.indexOf(content[i]) != -1);
    if (!item) return false;
  }
  return true;
}

export function sleep(time: number, args?: any) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(args);
    }, time);
  }) as Promise<any>;
}

export function single(array: any) {
  if (array && array.length != undefined && array.length > 0) return array[0];

  return undefined;
}

export function parseJSon(json: string) {
  if (json === null || !json || json.length <= 4) return undefined;
  try {
    return JSON.parse(json);
  } catch (e) {
    throw e;
  }
}

export function jsonExtractor(content: string) {
  const jsonReg = new RegExp(/<JSON>(.|\n)*?<\/JSON>/, "mgi");
  return (single(jsonReg.exec(content)) ?? "")
    .replace(/<JSON>/gim, "")
    .replace(/<\/JSON>/gim, "");
}

export function bodyExtrator(content: string) {
  const jsonReg = new RegExp(/<body>(.|\n)*?<\/body>/, "mgi");
  return (single(jsonReg.exec(content)) ?? "")
    .replace(/<body>/gim, "")
    .replace(/<\/body>/gim, "");
}

export function getImageType(path: string) {
  return path.trim().match(/(?<=\.)[a-z]{1,4}(?=\?|$)/) ?? 'jpg';
}

export function clearFileNameType(name: string) {
  if (name.endsWith(".epub") || name.endsWith(".opf")) {
    return name.replace(".opf", "").replace(".epub", "");
  }
  return name;
}

function validateName(fileName: string, chapters: EpubChapter[]) {
  var i = 0;
  while (chapters.find((a) => a.fileName == fileName)) {
    i++;
    fileName += i;
  }

  return fileName;
}

export function setChapterFileNames(chapters: EpubChapter[]) {
  chapters.map((chapter: EpubChapter, i: number) => {
    if (chapter.fileName) {
      chapter.fileName = chapter.fileName.replace(".xhtml", "");
    } else {
      chapter.fileName = chapter.title;
    }
    chapter.fileName =
      "content/" +
      validateName(chapter.fileName, chapters).replace(" ", "_") +
      ".xhtml";
  });
  return chapters as InternalEpubChapter[];
}


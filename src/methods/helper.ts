import { EpubChapter, File } from "../../types";

export function createFile(path: string, content: string, format?: string) {
  return {
    path,
    content,
    format
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
    console.log(e);
    return undefined;
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

export function getValidName(chapter: EpubChapter, chapters: EpubChapter[]) {
  var fileName = `${chapter.title}.html`;
  var i = 1;
  while (chapters.find((a) => a.fileName == fileName)) {
    fileName = `${chapter.title + i}.html`;
    i++;
  }

  return fileName;
}

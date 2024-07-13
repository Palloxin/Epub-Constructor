import {EpubChapter} from '../../types';
import {createFile} from './helper';

/**
 * Creates an EPUB chapter file with the provided chapter information.
 *
 * @param chapter - The chapter object containing the chapter details.
 * @returns The created File object representing the chapter file.
 */
export function createChapter(chapter: EpubChapter) {
  console.log(chapter.fileName.toLocaleLowerCase().replaceAll(' ', ''));
  console.log('create', chapter.fileName);

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
      `,
  );
}

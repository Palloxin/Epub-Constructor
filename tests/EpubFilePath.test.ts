import { expect, describe, test } from 'bun:test';
import { EpubSettings } from '../types';
import EpubFile from '../src/main';

describe('EpubFile Path names', () => {
  // Tests if chapter with correct filename is created
  test("should construct file with 'EPUB/content/BackInthefuture.xhtml' as path", async () => {
    const epubFile = new EpubFile({
      title: 'Test Book',
      chapters: [
        {
          title: 'Chapter 1',
          htmlBody: '<p></p>',
          fileName: 'BackInthefuture',
        },
      ],
    });
    const files = await epubFile.constructEpub();
    expect(files[3].path).toBe('EPUB/content/BackInthefuture.xhtml');
  });

  // Tests if chapters with correct filenames are created, if there are multiple with the same filename
  test("should construct file with 'EPUB/content/BackInthefuture1.xhtml' as path", async () => {
    const epubFile = new EpubFile({
      title: 'Test Book',
      chapters: [
        {
          title: 'Chapter 1',
          htmlBody: '<p></p>',
          fileName: 'BackInthefuture',
        },
        {
          title: 'Chapter 2',
          htmlBody: '<p></p>',
          fileName: 'BackInthefuture',
        },
      ],
    });
    const files = await epubFile.constructEpub();
    expect(files[3].path).toBe('EPUB/content/BackInthefuture.xhtml');
    expect(files[4].path).toBe('EPUB/content/BackInthefuture1.xhtml');
  });

  // Tests that an EPUB file with multiple images in a chapter is constructed correctly
  test('should construct EPUB file with multiple images in a chapter', async () => {
    const epubSettings: EpubSettings = {
      title: 'Test Book',
      chapters: [
        {
          title: 'Chapter 1',
          htmlBody: '<img src="image1.jpg">',
        },
      ],
    };
    const epubFile = new EpubFile(epubSettings);
    const files = await epubFile.constructEpub();
    expect(files[3].path).toBe('OEBPS/images/Chapter_1_image_1.jpg');
  });

  // Tests that an EPUB file with multiple images in a chapter is constructed correctly
  test('should construct EPUB file with multiple images in a chapter', async () => {
    const epubSettings: EpubSettings = {
      title: 'Test Book',
      chapters: [
        {
          title: 'Chapter 1',
          htmlBody: '<img src="image1.jpg"><img src="image2.png">',
        },
      ],
      cover: 'cover.jpg',
    };
    const epubFile = new EpubFile(epubSettings);
    const files = await epubFile.constructEpub();
    expect(files[4].path).toBe('OEBPS/images/Chapter_1_image_1.jpg');
    expect(files[5].path).toBe('OEBPS/images/Chapter_1_image_2.png');
  });

  // Tests that all default EPUB filenames and paths are set correctly
  test('should construct EPUB file with correct filenames and paths', async () => {
    const epubSettings: EpubSettings = {
      title: 'Test Book',
      chapters: [
        {
          title: 'Chapter 1',
          htmlBody: '',
        },
      ],
    };
    const epubFile = new EpubFile(epubSettings);
    const files = await epubFile.constructEpub();
    expect(files.length).toBe(8);
    expect(files[0].path).toBe('META-INF/container.xml');
    expect(files[1].path).toBe('EPUB/styles.css');
    expect(files[2].path).toBe('EPUB/script.js');
    expect(files[3].path).toBe('EPUB/content/Chapter_1.xhtml');
    expect(files[4].path).toBe('EPUB/Test_Book.opf');
    expect(files[5].path).toBe('EPUB/toc.xhtml');
    expect(files[6].path).toBe('EPUB/toc.ncx');
    expect(files[7].path).toBe('mimetype');
  });
});

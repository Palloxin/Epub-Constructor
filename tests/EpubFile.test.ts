import { expect, describe, test } from "bun:test";
import { EpubSettings } from "../types";
import EpubFile from "../src/main";

describe("EpubFile", () => {
  // Tests that an error is thrown when the EPUB file has no chapters
  test("should throw an error when EPUB file has no chapters", async () => {
    const epubSettings: EpubSettings = {
      title: "Test Book",
      chapters: [],
    };
    const epubFile = new EpubFile(epubSettings);
    await expect(epubFile.constructEpub()).rejects.toThrow(
      "Epub file needs at least one chapter"
    );
  });

  // Tests that an error is thrown when the EPUB file has no title
  test("should throw an error when the EPUB file has no title", async () => {
    const epubSettings: EpubSettings = {
      title: "",
      chapters: [
        {
          fileName: "chapter1.xhtml",
          title: "Chapter 1",
          htmlBody: "<p>Chapter 1 content</p>",
        },
      ],
    };
    const epubFile = new EpubFile(epubSettings);
    await expect(epubFile.constructEpub()).rejects.toThrow(
      "Epub file needs a title"
    );
  });

  // Tests that an EPUB file with no author is handled correctly
  test("should throw an error when no author is provided", async () => {
    const epubSettings: EpubSettings = {
      title: "Test Book",
      chapters: [
        {
          title: "Chapter 1",
          htmlBody: "<p>Chapter 1</p>",
        },
      ],
    };
    const epubFile = new EpubFile(epubSettings);
    const files = await epubFile.constructEpub();
    expect(files[4].content).toContain("<dc:creator>Unnamed</dc:creator>");
  });
});

import { expect, describe, test } from "bun:test";
import { EpubSettings } from "../types";
import EpubFile from "../src/main";


describe("EpubFile contents", () => {
    // Tests that the constructEpub method sets a book ID if none is provided in the EpubSettings object
    test("should set a book ID if none is provided", async () => {
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
      const opfFile = files.find((file) => file.path.endsWith(".opf"));
      const opfContent = opfFile?.content;
      expect(opfContent).toMatch(/.*id=\"BookId\">\d+<.*/);
    });
  
    // Tests that the EPUB file is constructed correctly when the js parameter is empty
    test("should construct EPUB file with empty js", async () => {
      const epubSettings: EpubSettings = {
        title: "Test Book",
        chapters: [
          {
            title: "Chapter 1",
            htmlBody: "<h1>Chapter 1</h1>",
          },
        ],
        js: "",
      };
      const epubFile = new EpubFile(epubSettings);
      const files = await epubFile.constructEpub();
      expect(files.length).toBe(8);
      expect(files[2].content).toBe("function fnEpub(){}");
      expect(files[2].path).toBe("EPUB/script.js");
    });
  
    // Tests that the EPUB file is constructed correctly when the css parameter is empty
    test("should construct EPUB file with default css", async () => {
      const epubSettings: EpubSettings = {
        title: "Test Book",
        chapters: [
          {
            title: "Chapter 1",
            htmlBody: "<h1>Chapter 1</h1>",
          },
        ],
      };
      const epubFile = new EpubFile(epubSettings);
      const files = await epubFile.constructEpub();
  
      expect(files.length).toBe(8);
      expect(files[1].content).toBe(
        "body {\n" +
          ' font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;\n' +
          " font-size: 1.125em;\n" +
          " line-height: 1.6em;\n" +
          " color: #000;\n" +
          "}\n" +
          "h1, h2, h3, h4, h5, h6 {\n" +
          " line-height: 1em;\n" +
          "}\n" +
          "h1 {\n" +
          " font-size: 3em;\n" +
          "}\n" +
          "h2 {\n" +
          " font-size: 2.5em;\n" +
          "}\n"
      );
      expect(files[1].path).toBe("EPUB/styles.css");
    });
  
    // Tests that the EPUB file is constructed correctly when own css parameter is provided as string
    test("should construct EPUB file with own css as string", async () => {
      const epubSettings: EpubSettings = {
        title: "Test Book",
        chapters: [
          {
            title: "Chapter 1",
            htmlBody: "<h1>Chapter 1</h1>",
          },
        ],
        stylesheet: "body {\n" + " background-color: black;\n" + "}\n",
      };
      const epubFile = new EpubFile(epubSettings);
      const files = await epubFile.constructEpub();
  
      expect(files.length).toBe(8);
      expect(files[1].content).toBe(
        "body {\n" + " background-color: black;\n" + "}\n"
      );
      expect(files[1].path).toBe("EPUB/styles.css");
    });
    // Tests that the EPUB file is constructed correctly when own css parameter is provided as object
    test("should construct EPUB file with own css as object", async () => {
      const epubSettings: EpubSettings = {
        title: "Test Book",
        chapters: [
          {
            title: "Chapter 1",
            htmlBody: "<h1>Chapter 1</h1>",
          },
        ],
        stylesheet: { body: { "background-color": "black" } },
      };
      const epubFile = new EpubFile(epubSettings);
      const files = await epubFile.constructEpub();
  
      expect(files.length).toBe(8);
      expect(files[1].content).toBe(
        "body {\n" + " background-color: black;\n" + "}\n"
      );
      expect(files[1].path).toBe("EPUB/styles.css");
    });
  });
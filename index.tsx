import { parse } from 'node-html-parser';
import * as p from 'node-html-parser';
export interface Parameter {
  name: string;
  value: string;
}

export interface EpubChapter {
  title: string;
  htmlBody: string;
  parameter?: Parameter[];
}

export interface File {
  path: string;
  content: string;
}

export interface EpubSettings {
  title: string;
  language?: string; // Default en
  bookId?: string;
  description?: string;
  source?: string;
  author?: string;
  chapters: EpubChapter[];
  stylesheet?: any;
  parameter?: Parameter[];
}

const createStyle = (style: any) => {
  if (!style) style = {};
  if (typeof style == "string")
    return style;
  const defaultStyle = {
    body: {
      'font-family': `"Helvetica Neue", "Helvetica", "Arial", sans-serif`,
      'font-size': '1.125em',
      'line-height': '1.6em',
      color: '#000',
    },

    'h1, h2, h3, h4, h5, h6': {
      'line-height': '1em',
    },

    h1: {
      'font-size': '3em',
    },

    h2: {
      'font-size': '2.5em',
    },
  } as any;

  Object.keys(style).forEach((x) => {
    var current = style[x];
    var next = defaultStyle[x];
    if (next === undefined) defaultStyle[x] = current;
    else Object.assign(defaultStyle[x], next);
  });
  var result = '';
  Object.keys(defaultStyle).forEach((x) => {
    var item = x + ' {';
    Object.keys(defaultStyle[x]).forEach((a) => {
      item += `\n ${a}: ${defaultStyle[x][a]};`;
    });
    item += '\n}\n';
    result += item;
  });
  return result;
};

const createChild = (content: string) => {
  return parse(`${content}`) as p.HTMLElement;
};

const createFile = (path: string, content: string) => {
  return {
    path,
    content,
  } as File;
};

const isValid = (file: File[], content: string[]) => {
  for (var i = 0; i < content.length; i++) {
    var item = file.find((x) => x.path.indexOf(content[i]) != -1);
    if (!item) return false;
  }
  return true;
};
export default class EpubFile {
  epubSettings: EpubSettings;

  constructor(epubSettings: EpubSettings) {
    this.epubSettings = epubSettings;
  }

  constructEpub() {
    var files = [] as File[];
    files.push(createFile('mimetype', 'application/epub+zip'));
    files.push(
      createFile(
        'META-INF/container.xml',
        `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
      <rootfiles>
      <rootfile full-path="OEBPS/${this.epubSettings.title}.opf" media-type="application/oebps-package+xml"/>
      </rootfiles>
      </container>`
      )
    );
    files.push(
      createFile('OEBPS/styles.css', createStyle(this.epubSettings.stylesheet))
    );

    var epub = parse(`<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></metadata>
    <manifest></manifest>
    <spine toc="ncx"></spine>
     <parameter>${this.epubSettings.parameter?.map(a => `<param name="${a.name}" value="${a.value}">${a.value}</param>`).join("\n") ?? ""}</parameter>
    </package>`);
    var ncxToc = parse(`<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en" dir="ltr">
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
	</navMap>
</ncx>
`);

    var htmlToc = parse(`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css" />
    <title>${this.epubSettings.title} - TOC</title>
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
      </ol>
    </nav>
  </body>
</html>`);
    epub.querySelector("metadata").appendChild(createChild(`<dc:title class="title">${this.epubSettings.title ?? ''}</dc:title>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:language class="language">${this.epubSettings.language ?? 'en'}</dc:language>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:identifier class="identifier" id="BookId">${this.epubSettings.bookId ?? new Date().getUTCMilliseconds().toString()}</dc:identifier>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:description class="description">${this.epubSettings.description ?? ''}</dc:description>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:date>${new Date()}</dc:date>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:rights class="rights">${this.epubSettings.author ?? ''}</dc:rights>`));
    epub.querySelector("metadata").appendChild(createChild(`<dc:source class="source">${this.epubSettings.source ?? ''}</dc:source>`));
    epub.querySelector("manifest").appendChild(createChild(`<item href="styles.css" id="css1" media-type="text/css"/>`));
    this.epubSettings.chapters.forEach((x, indexx) => {
      var index = indexx + 1;
      epub.querySelector("manifest").appendChild(
        createChild(
          `<item id="${x.title + index}" href="${x.title
          }.html" media-type="application/xhtml+xml" />`
        )
      );
      epub.querySelector("spine").appendChild(createChild(`<itemref idref="${x.title + index}" ></itemref>`));
      var param = "";
      if (x.parameter && x.parameter.length > 0)
        param = x.parameter.map(a => `<param name="${a.name}" value="${a.value}">${a.value}</param>`).join("\n");
      files.push(
        createFile(
          `OEBPS/${x.title}.html`,
          `
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <link rel="stylesheet" type="text/css" href="styles.css"/>
    <title>${x.title}</title>
    <parameter>
        ${param}
    </parameter>
  </head>
  <body>
      ${x.htmlBody}
  </body>
</html>
      `
        )
      );
      htmlToc.querySelector('ol').appendChild(createChild(`<li><a href="${x.title}.html">${x.title}</a></li>`));
      ncxToc.querySelector('navmap').appendChild(createChild(`<navPoint id="${x.title + index}" playOrder="${index}"> <navLabel> <text>${x.title}</text> </navLabel> <content src="${x.title}.html" /></navPoint>`));
    });
    epub.querySelector("manifest").appendChild(createChild(`<item properties="nav" id="toc" href="toc.html" media-type="application/xhtml+xml" />`));
    epub.querySelector("manifest").appendChild(createChild(` <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>`));

    files.push(createFile(`OEBPS/${this.epubSettings.title}.opf`, `<?xml version="1.0" encoding="utf-8"?>\n` + epub.outerHTML));
    files.push(createFile('OEBPS/toc.html', `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n` + htmlToc.outerHTML));

    files.push(createFile('OEBPS/toc.ncx', ncxToc.outerHTML));
    return files;
  }

  // extract EpubSettings from epub file.
  static load(file: File[]) {
    var epubSettings = { chapters: [] as EpubChapter[] } as EpubSettings;
    if (!isValid(file, ['toc.ncx', 'toc.html', '.opf', 'styles.css']))
      throw 'This is not a valid Epub file created by this library(epub-constructor)';
    var page = parse(file.find((x) => x.path.indexOf('.opf') != -1)?.content ?? '');
    var style = file.find((x) => x.path.indexOf('styles.css') != -1)?.content ?? '';
    
    epubSettings.parameter = page.querySelectorAll("param").map(a => { return { name: a.getAttribute("name"), value: a.getAttribute("value") } as Parameter });
    epubSettings.title = page.querySelector('.title').innerText;
    epubSettings.author = page.querySelector('.rights').innerText;
    epubSettings.description = page.querySelector('.description').innerText;
    epubSettings.language = page.querySelector('.language').innerText;
    epubSettings.bookId = page.querySelector('.identifier').innerHTML;
    epubSettings.source = page.querySelector('.source').innerText;
    epubSettings.stylesheet = style;
    var chapters = page.querySelectorAll("itemref");
    chapters.forEach(x => {
      var chId = x.getAttribute("idref");
      var chItem = page.querySelector("item[id='" + chId + "']").getAttribute("href");
      var chapter = parse(file.find(x => x.path.indexOf(chItem ?? "") != -1)?.content ?? "");

      epubSettings.chapters.push(
        {
          parameter: chapter.querySelectorAll("param").map(a => { return { name: a.getAttribute("name"), value: a.getAttribute("value") } as Parameter }),
          title: chapter.querySelector("title")?.innerText ?? "",
          htmlBody: chapter.querySelector("body").innerHTML
        }
      )
    });
    return epubSettings;
  }
}

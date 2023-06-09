export function defaultContainer(fileName: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
    <rootfile full-path="EPUB/${fileName}.opf" media-type="application/epub-package+xml"/>
    </rootfiles>
    </container>`;
}
export function defaultEpub() {
  return `<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">#metadata</metadata>
    <manifest>#manifest</manifest>
    <spine toc="ncx">#spine</spine>
    </package>`;
}
export function defaultNcxToc(
  chapterLength: number,
  title: string,
  author?: string
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <ncx xmlns:ncx="http://www.daisy.org/z3986/2005/ncx/" xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en" dir="ltr">
	<head>
		<meta name="dtb:uid" content="http://digitalpublishingtoolkit.org/ExampleEPUB.xhtml" />
		<meta name="dtb:depth" content="${chapterLength}" />
		<meta name="dtb:totalPageCount" content="${chapterLength}" />
		<meta name="dtb:maxPageNumber" content="0" />
	</head>
	<docTitle>
		<text>${title} EPUB</text>
	</docTitle>

	<docAuthor>
		<text>${author ?? ""}</text>
	</docAuthor>

	<navMap>
  #navMap
	</navMap>
</ncx>
`;
}
export function defaultHtmlToc(title: string) {
  return `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
      <head>
        <link rel="stylesheet" type="text/css" href="styles.css" />
        <title>${title} - TOC</title>
      </head>
      <body>
        <nav epub:type="toc" id="toc">
          <h1>Table of Contents</h1>
          <ol>
            #ol
          </ol>
        </nav>
      </body>
    </html>`;
}

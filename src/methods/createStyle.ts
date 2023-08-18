/**
 * Generates a CSS string based on the provided style object.
 * If the style object is a string, it is returned as is.
 * The style object is merged with a default style object.
 *
 * @param style - The style object to generate CSS from.
 * @returns The CSS string representing the merged style object.
 */
export function createStyle(style?: string) {
  if (typeof style == "string") return style;
  const defaultStyle =
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
    "}\n";
  return defaultStyle;
}


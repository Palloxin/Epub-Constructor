/**
 * Generates a CSS string based on the provided style object.
 * If the style object is a string, it is returned as is.
 * The style object is merged with a default style object.
 *
 * @param style - The style object to generate CSS from.
 * @returns The CSS string representing the merged style object.
 */
export function createStyle(style: any) {
  if (!style) style = {};
  if (typeof style == "string") return style;
  const defaultStyle = {
    body: {
      "font-family": `"Helvetica Neue", "Helvetica", "Arial", sans-serif`,
      "font-size": "1.125em",
      "line-height": "1.6em",
      color: "#000",
    },
    "h1, h2, h3, h4, h5, h6": {
      "line-height": "1em",
    },
    h1: {
      "font-size": "3em",
    },

    h2: {
      "font-size": "2.5em",
    },
  } as any;

  Object.keys(style).forEach((x) => {
    var current = style[x];
    var next = defaultStyle[x];
    if (next === undefined) defaultStyle[x] = current;
    else Object.assign(defaultStyle[x], current);
  });
  var result = "";
  Object.keys(defaultStyle).forEach((x) => {
    var item = x + " {";
    Object.keys(defaultStyle[x]).forEach((a) => {
      item += `\n ${a}: ${defaultStyle[x][a]};`;
    });
    item += "\n}\n";
    result += item;
  });
  return result;
}


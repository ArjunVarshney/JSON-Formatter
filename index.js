const defaultStyles = {
   fontSize: "16px",
   font: "Palatino, monospace",
   line_height: "1.5",
   space: "24px",
   space_from_left: "50px",
   links: true,
   colors: {
      background: "#0b0e17",
      keys: "#d54e50",
      values: {
         number: "#FF8811",
         string: "#b9ba1f",
         boolean: "#EDA2F2",
         function: "#FFC43D",
         undefined: "#06D6A0",
         null: "#B3B7EE",
         other: "#FFC43D",
         curly_brace: "#FFFFFF",
         square_brace: "#FFFFFF",
         comma_colon_quotes: "#FFFFFF",
      },
   },
   comments: {
      show: true,
      color: "#808080",
      space_from_left: "35px",
   },
   retractors: {
      show: true,
      color: "#8c8c8c",
      space_from_left: "37px",
   },
   line_numbers: {
      show: true,
      color: "#5c749c",
      space_from_left: "30px",
   },
   bracket_pair_lines: {
      show: true,
      color: "#3c3c3c",
      space_from_left: "6px",
      type: "solid",
   },
};

let num = 0;
const tags = {
   div: (data, style) =>
      `<div ${style ? `style="${style}"` : ""}>${data}</div>`,
   span: (data, style) =>
      `<span ${style ? `style="${style}"` : ""}>${data}</span>`,
   comment: (data, styles) =>
      styles.comments.show
         ? `<i style="
    color:${styles.comments.color};
    position:absolute;
    margin-left:${styles.comments.space_from_left};
    width:${data.length}ch;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    ">${data}</i>`
         : "",
   br: () => `<br>`,
   code: (data, styles, style) => `<pre style="
    margin: 0 0 0 0;
    display:inline;
    color:${styles.colors.values.function};
    "><code style="
    font-family:${styles.font};
    ${style || ""}
    ">${data}</code></pre>`,
   number: (styles, style) =>
      styles.line_numbers.show
         ? `<span style="
    position:absolute;
    left:${styles.line_numbers.space_from_left};
    color:${styles.line_numbers.color};
    background:${styles.colors.background};
    font-size:calc(${styles.fontSize} - 1px);
    translate: -100% 1px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
      ${style || ""}"
      >${++num}</span>`
         : "",
   curlyBrace: (data, styles) => `<span style="
    color:${styles.colors.values.curly_brace}
    ">${data}</span>`,
   squareBrace: (data, styles) => `<span style="
    color:${styles.colors.values.square_brace}
    ">${data}</span>`,
   comma_colon_quotes: (data, styles) => `<span style="
    color:${styles.colors.values.comma_colon_quotes};
    ${data === ":" && "margin-right:3px;"}
    ">${data}</span>`,
   closeButton: (styles) =>
      styles.retractors.show
         ? `<button style="
        color:${styles.retractors.color};
        position:absolute;
        left:${styles.retractors.space_from_left};
        translate:0 calc(${styles.fontSize} * ${styles.line_height} * -1 + 2px);
        background: ${styles.colors.background};
	      border: none;
	      padding: 0;
	      outline: inherit;
        overflow: hidden;
        font-size: ${styles.fontSize};
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        "
        onclick="(function(e){
          const entries = e.target.parentElement.querySelector('div');
          if(entries.style.display === 'block' || entries.style.display === ''){
            entries.style.display = 'none';
            e.target.parentElement.style.display = 'inline-block'
            e.target.innerText = '▾';
            e.target.style.translate = '0 -${styles.fontSize}';
          }else {
            entries.style.display = 'block';
            e.target.parentElement.style.display = 'block'
            e.target.innerText = '▴';
            e.target.style.translate = '0 calc(${styles.fontSize} * ${styles.line_height} * -1 + 2px)';
          }
        return false;
        })(arguments[0]);return false;">▴</button>`
         : "",
};
const parseOperations = {
   object: (data, styles) => {
      if (Object.entries(data).length === 0)
         return tags.number(styles) + tags.curlyBrace("{}", styles);
      const html = tags.number(styles) + tags.curlyBrace("{", styles);
      let values = "";
      const keys = Object.keys(data);

      for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         const value = data[key];

         const isLastItem = i === keys.length - 1;

         values +=
            (!(value instanceof Object) || value instanceof Array
               ? tags.number(styles)
               : "") +
            tags.div(
               tags.comma_colon_quotes('"', styles) +
                  tags.span(key, `color:${styles.colors.keys};`) +
                  tags.comma_colon_quotes('"', styles) +
                  tags.comma_colon_quotes(":", styles) +
                  parseJson(value, styles) +
                  (isLastItem ? "" : tags.comma_colon_quotes(",", styles)),
               `padding-left:${styles.space}`
            );
      }
      return (
         html +
         tags.div(
            tags.closeButton(styles) + tags.div(values),
            `${
               styles.bracket_pair_lines.show
                  ? `margin-left:${styles.bracket_pair_lines.space_from_left};
            border-left:1px ${styles.bracket_pair_lines.type} ${styles.bracket_pair_lines.color};`
                  : ""
            }`
         ) +
         tags.number(styles) +
         tags.curlyBrace("}", styles) +
         tags.comment(` // ${Object.entries(data).length} entries`, styles)
      );
   },
   array: (data, styles) => {
      if (data.length === 0) {
         return tags.squareBrace("[]", styles);
      }
      let html = "";
      const values = Object.values(data);
      const totalValues = values.length;

      for (let i = 0; i < totalValues; i++) {
         const value = values[i];
         const isLastValue = i === totalValues - 1;

         html += tags.div(
            parseJson(value, styles, true) +
               (isLastValue ? "" : tags.comma_colon_quotes(",", styles)),
            `padding-left:${styles.space};`
         );
      }
      return (
         tags.squareBrace("[", styles) +
         tags.div(
            tags.closeButton(styles) + tags.div(html),
            `${
               styles.bracket_pair_lines.show
                  ? `margin-left:${styles.bracket_pair_lines.space_from_left};
            border-left:1px ${styles.bracket_pair_lines.type} ${styles.bracket_pair_lines.color};`
                  : ""
            }`
         ) +
         tags.number(styles) +
         tags.squareBrace("]", styles) +
         tags.comment(` // ${data.length} elements`, styles)
      );
   },
   string: (data, styles) => {
      return tags.span(`"${data}"`, `color:${styles.colors.values.string};`);
   },
   number: (data, styles) => {
      return tags.span(`${data}`, `color:${styles.colors.values.number};`);
   },
   boolean: (data, styles) => {
      return tags.span(`${data}`, `color:${styles.colors.values.boolean};`);
   },
   undefined: (styles) => {
      return tags.span("undefined", `color:${styles.colors.values.undefined};`);
   },
   function: (data, styles) => {
      return tags.code(data, styles);
   },
   null: (styles) => {
      return tags.span("null", `color:${styles.colors.values.null};`);
   },
   other: (data, styles) => {
      return tags.div(
         JSON.stringify(data),
         `color:${styles.colors.values.function}`
      );
   },
};
const parseJson = (data, styles, addNumber) => {
   if (
      typeof data === "object" &&
      data instanceof Object &&
      !(data instanceof Array)
   )
      return parseOperations.object(data, styles);
   else if (typeof data === "object" && data instanceof Array) {
      const html =
         `${num === 0 || addNumber ? tags.number(styles) : ""}` +
         parseOperations.array(data, styles);
      return html;
   } else if (typeof data === "string") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.string(data, styles);
      return html;
   } else if (typeof data === "object" && JSON.stringify(data) === "null") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.null(styles);
      return html;
   } else if (typeof data === "number") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.number(data, styles);
      return html;
   } else if (typeof data === "boolean") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.boolean(data, styles);
      return html;
   } else if (typeof data === "undefined") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.undefined(styles);
      return html;
   } else if (typeof data === "function") {
      const html =
         `${num === 0 ? tags.number(styles) : ""}` +
         parseOperations.function(data, styles);
      return html;
   }
   return parseOperations.other(data, styles);
};
function jsontohtml(data, options) {
   num = 0;
   const styles = Object.assign(
      Object.assign(Object.assign({}, defaultStyles), options),
      {
         colors: Object.assign(
            Object.assign({}, defaultStyles.colors),
            options === null || options === void 0 ? void 0 : options.colors
         ),
         comments: Object.assign(
            Object.assign({}, defaultStyles.comments),
            options === null || options === void 0 ? void 0 : options.comments
         ),
         line_numbers: Object.assign(
            Object.assign({}, defaultStyles.line_numbers),
            options === null || options === void 0
               ? void 0
               : options.line_numbers
         ),
         retractors: Object.assign(
            Object.assign({}, defaultStyles.retractors),
            options === null || options === void 0 ? void 0 : options.retractors
         ),
         bracket_pair_lines: Object.assign(
            Object.assign({}, defaultStyles.bracket_pair_lines),
            options === null || options === void 0
               ? void 0
               : options.bracket_pair_lines
         ),
      }
   );
   styles.retractors.space_from_left = styles.retractors.show
      ? styles.retractors.space_from_left
      : "0px";
   styles.line_numbers.space_from_left = styles.line_numbers.show
      ? styles.line_numbers.space_from_left
      : "0px";
   styles.bracket_pair_lines.space_from_left = styles.bracket_pair_lines.show
      ? styles.bracket_pair_lines.space_from_left
      : "0px";
   return `
  <div style="
  position:relative;
  min-width:max-content;
  line-height:${styles.line_height || "calc(${styles.fontSize} + 2px)"};
  padding-left:${styles.space_from_left};
  background:${styles.colors.background};
  font-size:${styles.fontSize} !important;
  ${styles.font ? `font-family:${styles.font}` : ""}
  ">
  ${parseJson(data, styles)}
  </div>
  `.replace(
      /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/g,
      `${
         styles.links
            ? `<a target="_blank" style='color:#3891ff; text-decoration:"underline";' href="$1">$1</a>`
            : "$1"
      }`
   );
}

const themes = {
   light: [
      {
         name: "Default Light",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#d54e50",
               values: {
                  number: "#FF8811",
                  string: "#b9ba1f",
                  boolean: "#EDA2F2",
                  function: "#FFC43D",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#808080" },
            retractors: { color: "#8c8c8c" },
            line_numbers: { color: "#5c749c" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Github Light",
         settings: {
            colors: {
               background: "#fffefe",
               keys: "#005cc5",
               values: {
                  number: "#005cc5",
                  string: "#b9ba1f",
                  boolean: "#005cc5",
                  function: "#b31d28",
                  undefined: "#b31d28",
                  null: "#005cc5",
                  other: "#b31d28",
                  curly_brace: "#e36209",
                  square_brace: "#e36209",
                  comma_colon_quotes: "#24292e",
               },
            },
            comments: { color: "#6a737d" },
            retractors: { color: "#424242" },
            line_numbers: { color: "#24292e" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "VS Code Light",
         settings: {
            colors: {
               background: "#fffefe",
               keys: "#0451a5",
               values: {
                  number: "#098658",
                  string: "#a31515",
                  boolean: "#0000ff",
                  function: "#cd3131",
                  undefined: "#cd3131",
                  null: "#0000ff",
                  other: "#cd3131",
                  curly_brace: "#319331",
                  square_brace: "#319331",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#008000" },
            retractors: { color: "#424242" },
            line_numbers: { color: "#237893" },
            bracket_pair_lines: { color: "#616161" },
         },
      },
      {
         name: "3024 Day",
         settings: {
            colors: {
               background: "#f7f7f7",
               keys: "#01a252",
               values: {
                  number: "#a16a94",
                  string: "#fded02",
                  boolean: "#a16a94",
                  function: "#3a3432",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#3a3432",
                  square_brace: "#3a3432",
                  comma_colon_quotes: "#3a3432",
               },
            },
            comments: { color: "#3a3432" },
            retractors: { color: "#db2d20" },
            line_numbers: { color: "#3a3432" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Base16 Light",
         settings: {
            colors: {
               background: "#f5f5f5",
               keys: "#90a959",
               values: {
                  number: "#aa759f",
                  string: "#f4bf75",
                  boolean: "#aa759f",
                  function: "#202020",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#202020",
                  square_brace: "#202020",
                  comma_colon_quotes: "#202020",
               },
            },
            comments: { color: "#202020" },
            retractors: { color: "#ac4142" },
            line_numbers: { color: "#202020" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Duotone Light",
         settings: {
            colors: {
               background: "#faf8f5",
               keys: "#b29762",
               values: {
                  number: "#063289",
                  string: "#1659df",
                  boolean: "#063289",
                  function: "#b29762",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#b29762",
                  square_brace: "#b29762",
                  comma_colon_quotes: "#b29762",
               },
            },
            comments: { color: "#1659df" },
            retractors: { color: "#063289" },
            line_numbers: { color: "#1659df" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Eclipse",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#116644",
                  string: "#2a00ff",
                  boolean: "#221199",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#7f0055" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Elegant",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#776622",
                  string: "#776622",
                  boolean: "#776622",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#773300" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Idea",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#0000ff",
                  string: "#008000",
                  boolean: "#000080",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#000080" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Juejin",
         settings: {
            colors: {
               background: "#f8f9fa",
               keys: "#000000",
               values: {
                  number: "#000000",
                  string: "#000000",
                  boolean: "#d3869b",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#bb51b8" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Mdn Like",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#990055",
               values: {
                  number: "#ca7841",
                  string: "#0077aa",
                  boolean: "#ff9900",
                  function: "#999999",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#999999",
                  square_brace: "#999999",
                  comma_colon_quotes: "#999999",
               },
            },
            comments: { color: "#cda869" },
            retractors: { color: "#6262ff" },
            line_numbers: { color: "#cda869" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Neat",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#33aa33",
                  string: "#aa2222",
                  boolean: "#33aa33",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#0000ff" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Neo",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#1d75b3",
               values: {
                  number: "#75438a",
                  string: "#b35e14",
                  boolean: "#75438a",
                  function: "#2e383c",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#2e383c",
                  square_brace: "#2e383c",
                  comma_colon_quotes: "#2e383c",
               },
            },
            comments: { color: "#2e383c" },
            retractors: { color: "#1d75b3" },
            line_numbers: { color: "#2e383c" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Paraiso Light",
         settings: {
            colors: {
               background: "#e7e9db",
               keys: "#48b685",
               values: {
                  number: "#815ba4",
                  string: "#fec418",
                  boolean: "#815ba4",
                  function: "#41323f",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#41323f",
                  square_brace: "#41323f",
                  comma_colon_quotes: "#41323f",
               },
            },
            comments: { color: "#41323f" },
            retractors: { color: "#ef6155" },
            line_numbers: { color: "#41323f" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Solarized",
         settings: {
            colors: {
               background: "#fdf6e3",
               keys: "#2aa198",
               values: {
                  number: "#d33682",
                  string: "#859900",
                  boolean: "#d33682",
                  function: "#657b83",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#657b83",
                  square_brace: "#657b83",
                  comma_colon_quotes: "#657b83",
               },
            },
            comments: { color: "#6c71c4" },
            retractors: { color: "#cb4b16" },
            line_numbers: { color: "#6c71c4" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Ttcn",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#000000",
                  string: "#006400",
                  boolean: "#221199",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#000000" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Xq Light",
         settings: {
            colors: {
               background: "#ffffff",
               keys: "#000000",
               values: {
                  number: "#116644",
                  string: "#ff0000",
                  boolean: "#6c8cd5",
                  function: "#000000",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#000000",
                  square_brace: "#000000",
                  comma_colon_quotes: "#000000",
               },
            },
            comments: { color: "#000000" },
            retractors: { color: "#5a5cad" },
            line_numbers: { color: "#000000" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
      {
         name: "Yeti",
         settings: {
            colors: {
               background: "#eceae8",
               keys: "#a074c4",
               values: {
                  number: "#a074c4",
                  string: "#96c0d8",
                  boolean: "#a074c4",
                  function: "#d1c9c0",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d1c9c0",
                  square_brace: "#d1c9c0",
                  comma_colon_quotes: "#d1c9c0",
               },
            },
            comments: { color: "#9fb96e" },
            retractors: { color: "#9fb96e" },
            line_numbers: { color: "#9fb96e" },
            bracket_pair_lines: { color: "#e1e4e8" },
         },
      },
   ],
   dark: [
      {
         name: "Default Dark",
         settings: defaultStyles,
      },
      {
         name: "Github Dark",
         settings: {
            colors: {
               background: "#0c1116",
               keys: "#7ee787",
               values: {
                  number: "#79c0ff",
                  string: "#a5d6ff",
                  boolean: "#79c0ff",
                  function: "#ffa198",
                  undefined: "#ffa198",
                  null: "#79c0ff",
                  other: "#ffa198",
                  curly_brace: "#56d364",
                  square_brace: "#56d364",
                  comma_colon_quotes: "#e6edf3",
               },
            },
            comments: { color: "#8b949e" },
            retractors: { color: "#7d8590" },
            line_numbers: { color: "#6e7681" },
            bracket_pair_lines: { color: "#30363d" },
         },
      },
      {
         name: "VS Code Dark",
         settings: {
            colors: {
               background: "#1f1f1e",
               keys: "#9cdcfe",
               values: {
                  number: "#b5cea8",
                  string: "#ce9178",
                  boolean: "#569cd6",
                  function: "#f44747",
                  undefined: "#f44747",
                  null: "#569cd6",
                  other: "#f44747",
                  curly_brace: "#da70d6",
                  square_brace: "#da70d6",
                  comma_colon_quotes: "#d4d4d4",
               },
            },
            comments: { color: "#6a9955" },
            retractors: { color: "#c5c5c5" },
            line_numbers: { color: "#858585" },
            bracket_pair_lines: { color: "#444444" },
         },
      },
      {
         name: "Purple Mountains",
         settings: {
            colors: {
               background: "#241028",
               keys: "#aa99ff",
               values: {
                  number: "#0cbb9e",
                  string: "#bd7800",
                  boolean: "#c7ad29",
                  function: "#D4D4D4",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#D4D4D4",
                  square_brace: "#D4D4D4",
                  comma_colon_quotes: "#D4D4D4",
               },
            },
            comments: { color: "#bea4e5" },
            retractors: { color: "#cbb8ff" },
            line_numbers: { color: "#bea4e5" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "3024 Night",
         settings: {
            colors: {
               background: "#090300",
               keys: "#01a252",
               values: {
                  number: "#a16a94",
                  string: "#fded02",
                  boolean: "#a16a94",
                  function: "#d6d5d4",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d6d5d4",
                  square_brace: "#d6d5d4",
                  comma_colon_quotes: "#d6d5d4",
               },
            },
            comments: { color: "#d6d5d4" },
            retractors: { color: "#db2d20" },
            line_numbers: { color: "#d6d5d4" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Abbott",
         settings: {
            colors: {
               background: "#231c14",
               keys: "#3f91f1",
               values: {
                  number: "#f63f05",
                  string: "#e6a2f3",
                  boolean: "#fef3b4",
                  function: "#d8ff84",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d8ff84",
                  square_brace: "#d8ff84",
                  comma_colon_quotes: "#d8ff84",
               },
            },
            comments: { color: "#d8ff84" },
            retractors: { color: "#d80450" },
            line_numbers: { color: "#d8ff84" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Abcdef",
         settings: {
            colors: {
               background: "#0f0f0f",
               keys: "#fedcba",
               values: {
                  number: "#ee82ee",
                  string: "#22bb44",
                  boolean: "#7777ff",
                  function: "#defdef",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#defdef",
                  square_brace: "#defdef",
                  comma_colon_quotes: "#defdef",
               },
            },
            comments: { color: "#ffff00" },
            retractors: { color: "#b8860b" },
            line_numbers: { color: "#ffff00" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Ambiance",
         settings: {
            colors: {
               background: "#202020",
               keys: "#eed1b3",
               values: {
                  number: "#78cf8a",
                  string: "#8f9d6a",
                  boolean: "#cf7ea9",
                  function: "#e6e1dc",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#e6e1dc",
                  square_brace: "#e6e1dc",
                  comma_colon_quotes: "#e6e1dc",
               },
            },
            comments: { color: "#fa8d6a" },
            retractors: { color: "#cda869" },
            line_numbers: { color: "#fa8d6a" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Ayu Dark",
         settings: {
            colors: {
               background: "#0a0e14",
               keys: "#ffb454",
               values: {
                  number: "#e6b450",
                  string: "#c2d94c",
                  boolean: "#ae81ff",
                  function: "#b3b1ad",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#b3b1ad",
                  square_brace: "#b3b1ad",
                  comma_colon_quotes: "#b3b1ad",
               },
            },
            comments: { color: "#b3b1ad" },
            retractors: { color: "#ff8f40" },
            line_numbers: { color: "#b3b1ad" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Ayu Mirage",
         settings: {
            colors: {
               background: "#1f2430",
               keys: "#f29e74",
               values: {
                  number: "#ffcc66",
                  string: "#bae67e",
                  boolean: "#ae81ff",
                  function: "#cbccc6",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#cbccc6",
                  square_brace: "#cbccc6",
                  comma_colon_quotes: "#cbccc6",
               },
            },
            comments: { color: "#cbccc6" },
            retractors: { color: "#ffa759" },
            line_numbers: { color: "#cbccc6" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Base16 Dark",
         settings: {
            colors: {
               background: "#151515",
               keys: "#90a959",
               values: {
                  number: "#aa759f",
                  string: "#f4bf75",
                  boolean: "#aa759f",
                  function: "#e0e0e0",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#e0e0e0",
                  square_brace: "#e0e0e0",
                  comma_colon_quotes: "#e0e0e0",
               },
            },
            comments: { color: "#e0e0e0" },
            retractors: { color: "#ac4142" },
            line_numbers: { color: "#e0e0e0" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Bespin",
         settings: {
            colors: {
               background: "#28211c",
               keys: "#54be0d",
               values: {
                  number: "#9b859d",
                  string: "#f9ee98",
                  boolean: "#9b859d",
                  function: "#9d9b97",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#9d9b97",
                  square_brace: "#9d9b97",
                  comma_colon_quotes: "#9d9b97",
               },
            },
            comments: { color: "#9d9b97" },
            retractors: { color: "#cf6a4c" },
            line_numbers: { color: "#9d9b97" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Blackboard",
         settings: {
            colors: {
               background: "#0c1021",
               keys: "#f8f8f8",
               values: {
                  number: "#d8fa3c",
                  string: "#61ce3c",
                  boolean: "#d8fa3c",
                  function: "#f8f8f8",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f8",
                  square_brace: "#f8f8f8",
                  comma_colon_quotes: "#f8f8f8",
               },
            },
            comments: { color: "#fbde2d" },
            retractors: { color: "#fbde2d" },
            line_numbers: { color: "#fbde2d" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Cobalt",
         settings: {
            colors: {
               background: "#002240",
               keys: "#ffffff",
               values: {
                  number: "#ff80e1",
                  string: "#3ad900",
                  boolean: "#845dc4",
                  function: "#ffffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffff",
                  square_brace: "#ffffff",
                  comma_colon_quotes: "#ffffff",
               },
            },
            comments: { color: "#ffffff" },
            retractors: { color: "#ffee80" },
            line_numbers: { color: "#ffffff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Colorforth",
         settings: {
            colors: {
               background: "#000000",
               keys: "#f8f8f8",
               values: {
                  number: "#00c4ff",
                  string: "#007bff",
                  boolean: "#606060",
                  function: "#f8f8f8",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f8",
                  square_brace: "#f8f8f8",
                  comma_colon_quotes: "#f8f8f8",
               },
            },
            comments: { color: "#f8f8f8" },
            retractors: { color: "#ffd900" },
            line_numbers: { color: "#f8f8f8" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Darcula",
         settings: {
            colors: {
               background: "#2b2b2b",
               keys: "#ffc66d",
               values: {
                  number: "#6897bb",
                  string: "#6a8759",
                  boolean: "#cc7832",
                  function: "#a9b7c6",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#a9b7c6",
                  square_brace: "#a9b7c6",
                  comma_colon_quotes: "#a9b7c6",
               },
            },
            comments: { color: "#a9b7c6" },
            retractors: { color: "#cc7832" },
            line_numbers: { color: "#a9b7c6" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Dracula",
         settings: {
            colors: {
               background: "#282a36",
               keys: "#66d9ef",
               values: {
                  number: "#bd93f9",
                  string: "#f1fa8c",
                  boolean: "#bd93f9",
                  function: "#f8f8f2",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f2",
                  square_brace: "#f8f8f2",
                  comma_colon_quotes: "#f8f8f2",
               },
            },
            comments: { color: "#ff79c6" },
            retractors: { color: "#ff79c6" },
            line_numbers: { color: "#ff79c6" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Duotone Dark",
         settings: {
            colors: {
               background: "#2a2734",
               keys: "#9a86fd",
               values: {
                  number: "#ffcc99",
                  string: "#ffb870",
                  boolean: "#ffcc99",
                  function: "#6c6783",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#6c6783",
                  square_brace: "#6c6783",
                  comma_colon_quotes: "#6c6783",
               },
            },
            comments: { color: "#ffad5c" },
            retractors: { color: "#ffcc99" },
            line_numbers: { color: "#ffad5c" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Erlang Dark",
         settings: {
            colors: {
               background: "#002240",
               keys: "#cccccc",
               values: {
                  number: "#ffd0d0",
                  string: "#3ad900",
                  boolean: "#f133f1",
                  function: "#ffffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffff",
                  square_brace: "#ffffff",
                  comma_colon_quotes: "#ffffff",
               },
            },
            comments: { color: "#dd5555" },
            retractors: { color: "#ffee80" },
            line_numbers: { color: "#dd5555" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Gruvbox Dark",
         settings: {
            colors: {
               background: "#282828",
               keys: "#ebdbb2",
               values: {
                  number: "#d3869b",
                  string: "#b8bb26",
                  boolean: "#d3869b",
                  function: "#bdae93",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#bdae93",
                  square_brace: "#bdae93",
                  comma_colon_quotes: "#bdae93",
               },
            },
            comments: { color: "#ebdbb2" },
            retractors: { color: "#f84934" },
            line_numbers: { color: "#ebdbb2" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Hopscotch",
         settings: {
            colors: {
               background: "#322931",
               keys: "#8fc13e",
               values: {
                  number: "#c85e7c",
                  string: "#fdcc59",
                  boolean: "#c85e7c",
                  function: "#d5d3d5",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d5d3d5",
                  square_brace: "#d5d3d5",
                  comma_colon_quotes: "#d5d3d5",
               },
            },
            comments: { color: "#d5d3d5" },
            retractors: { color: "#dd464c" },
            line_numbers: { color: "#d5d3d5" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Icecoder",
         settings: {
            colors: {
               background: "#1d1d1b",
               keys: "#eeeeee",
               values: {
                  number: "#6cb5d9",
                  string: "#b9ca4a",
                  boolean: "#e1c76e",
                  function: "#666666",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#666666",
                  square_brace: "#666666",
                  comma_colon_quotes: "#666666",
               },
            },
            comments: { color: "#9179bb" },
            retractors: { color: "#eeeeee" },
            line_numbers: { color: "#9179bb" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Isotope",
         settings: {
            colors: {
               background: "#000000",
               keys: "#33ff00",
               values: {
                  number: "#cc00ff",
                  string: "#ff0099",
                  boolean: "#cc00ff",
                  function: "#e0e0e0",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#e0e0e0",
                  square_brace: "#e0e0e0",
                  comma_colon_quotes: "#e0e0e0",
               },
            },
            comments: { color: "#e0e0e0" },
            retractors: { color: "#ff0000" },
            line_numbers: { color: "#e0e0e0" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Lesser Dark",
         settings: {
            colors: {
               background: "#262626",
               keys: "#92a75c",
               values: {
                  number: "#b35e4d",
                  string: "#bcd279",
                  boolean: "#c2b470",
                  function: "#ebefe7",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ebefe7",
                  square_brace: "#ebefe7",
                  comma_colon_quotes: "#ebefe7",
               },
            },
            comments: { color: "#92a75c" },
            retractors: { color: "#599eff" },
            line_numbers: { color: "#92a75c" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Liquibyte",
         settings: {
            colors: {
               background: "#000000",
               keys: "#999999",
               values: {
                  number: "#00ff00",
                  string: "#ff8000",
                  boolean: "#bf3030",
                  function: "#ffffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffff",
                  square_brace: "#ffffff",
                  comma_colon_quotes: "#ffffff",
               },
            },
            comments: { color: "#ffffff" },
            retractors: { color: "#c080ff" },
            line_numbers: { color: "#ffffff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Lucario",
         settings: {
            colors: {
               background: "#2b3e50",
               keys: "#f8f8f2",
               values: {
                  number: "#ca94ff",
                  string: "#e6db74",
                  boolean: "#bd93f9",
                  function: "#f8f8f2",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f2",
                  square_brace: "#f8f8f2",
                  comma_colon_quotes: "#f8f8f2",
               },
            },
            comments: { color: "#66d9ef" },
            retractors: { color: "#ff6541" },
            line_numbers: { color: "#66d9ef" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Material",
         settings: {
            colors: {
               background: "#263238",
               keys: "#c792ea",
               values: {
                  number: "#ff5370",
                  string: "#c3e88d",
                  boolean: "#f78c6c",
                  function: "#eeffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#eeffff",
                  square_brace: "#eeffff",
                  comma_colon_quotes: "#eeffff",
               },
            },
            comments: { color: "#89ddff" },
            retractors: { color: "#c792ea" },
            line_numbers: { color: "#89ddff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Material Darker",
         settings: {
            colors: {
               background: "#212121",
               keys: "#c792ea",
               values: {
                  number: "#ff5370",
                  string: "#c3e88d",
                  boolean: "#f78c6c",
                  function: "#eeffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#eeffff",
                  square_brace: "#eeffff",
                  comma_colon_quotes: "#eeffff",
               },
            },
            comments: { color: "#89ddff" },
            retractors: { color: "#c792ea" },
            line_numbers: { color: "#89ddff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Material Palenight",
         settings: {
            colors: {
               background: "#292d3e",
               keys: "#c792ea",
               values: {
                  number: "#ff5370",
                  string: "#c3e88d",
                  boolean: "#f78c6c",
                  function: "#a6accd",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#a6accd",
                  square_brace: "#a6accd",
                  comma_colon_quotes: "#a6accd",
               },
            },
            comments: { color: "#89ddff" },
            retractors: { color: "#c792ea" },
            line_numbers: { color: "#89ddff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Material Ocean",
         settings: {
            colors: {
               background: "#0f111a",
               keys: "#c792ea",
               values: {
                  number: "#ff5370",
                  string: "#c3e88d",
                  boolean: "#f78c6c",
                  function: "#8f93a2",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#8f93a2",
                  square_brace: "#8f93a2",
                  comma_colon_quotes: "#8f93a2",
               },
            },
            comments: { color: "#89ddff" },
            retractors: { color: "#c792ea" },
            line_numbers: { color: "#89ddff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Mbo",
         settings: {
            colors: {
               background: "#2c2c2c",
               keys: "#9ddfe9",
               values: {
                  number: "#00a8c6",
                  string: "#ffcf6c",
                  boolean: "#00a8c6",
                  function: "#ffffec",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffec",
                  square_brace: "#ffffec",
                  comma_colon_quotes: "#ffffec",
               },
            },
            comments: { color: "#ffffec" },
            retractors: { color: "#ffb928" },
            line_numbers: { color: "#ffffec" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Midnight",
         settings: {
            colors: {
               background: "#0f192a",
               keys: "#a6e22e",
               values: {
                  number: "#d1edff",
                  string: "#1dc116",
                  boolean: "#ae81ff",
                  function: "#d1edff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d1edff",
                  square_brace: "#d1edff",
                  comma_colon_quotes: "#d1edff",
               },
            },
            comments: { color: "#d1edff" },
            retractors: { color: "#e83737" },
            line_numbers: { color: "#d1edff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Monokai",
         settings: {
            colors: {
               background: "#272822",
               keys: "#a6e22e",
               values: {
                  number: "#ae81ff",
                  string: "#e6db74",
                  boolean: "#ae81ff",
                  function: "#f8f8f2",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f2",
                  square_brace: "#f8f8f2",
                  comma_colon_quotes: "#f8f8f2",
               },
            },
            comments: { color: "#f8f8f2" },
            retractors: { color: "#f92672" },
            line_numbers: { color: "#f8f8f2" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Moxer",
         settings: {
            colors: {
               background: "#090a0f",
               keys: "#81c5da",
               values: {
                  number: "#7ca4c0",
                  string: "#b2e4ae",
                  boolean: "#a99be2",
                  function: "#8e95b4",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#8e95b4",
                  square_brace: "#8e95b4",
                  comma_colon_quotes: "#8e95b4",
               },
            },
            comments: { color: "#d46c6c" },
            retractors: { color: "#d46c6c" },
            line_numbers: { color: "#d46c6c" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Night",
         settings: {
            colors: {
               background: "#0a001f",
               keys: "#f8f8f8",
               values: {
                  number: "#ffd500",
                  string: "#37f14a",
                  boolean: "#845dc4",
                  function: "#f8f8f8",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f8",
                  square_brace: "#f8f8f8",
                  comma_colon_quotes: "#f8f8f8",
               },
            },
            comments: { color: "#f8f8f8" },
            retractors: { color: "#599eff" },
            line_numbers: { color: "#f8f8f8" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Nord",
         settings: {
            colors: {
               background: "#2e3440",
               keys: "#8fbcbb",
               values: {
                  number: "#b48ead",
                  string: "#a3be8c",
                  boolean: "#b48ead",
                  function: "#d8dee9",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d8dee9",
                  square_brace: "#d8dee9",
                  comma_colon_quotes: "#d8dee9",
               },
            },
            comments: { color: "#d8dee9" },
            retractors: { color: "#81a1c1" },
            line_numbers: { color: "#d8dee9" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Oceanic Next",
         settings: {
            colors: {
               background: "#304148",
               keys: "#99c794",
               values: {
                  number: "#f99157",
                  string: "#99c794",
                  boolean: "#c594c5",
                  function: "#f8f8f2",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f2",
                  square_brace: "#f8f8f2",
                  comma_colon_quotes: "#f8f8f2",
               },
            },
            comments: { color: "#f8f8f2" },
            retractors: { color: "#c594c5" },
            line_numbers: { color: "#f8f8f2" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Panda Syntax",
         settings: {
            colors: {
               background: "#292a2b",
               keys: "#f3f3f3",
               values: {
                  number: "#ffb86c",
                  string: "#19f9d8",
                  boolean: "#ff2c6d",
                  function: "#e6e6e6",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#e6e6e6",
                  square_brace: "#e6e6e6",
                  comma_colon_quotes: "#e6e6e6",
               },
            },
            comments: { color: "#f3f3f3" },
            retractors: { color: "#ff75b5" },
            line_numbers: { color: "#f3f3f3" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Paraiso Dark",
         settings: {
            colors: {
               background: "#2f1e2e",
               keys: "#48b685",
               values: {
                  number: "#815ba4",
                  string: "#fec418",
                  boolean: "#815ba4",
                  function: "#b9b6b0",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#b9b6b0",
                  square_brace: "#b9b6b0",
                  comma_colon_quotes: "#b9b6b0",
               },
            },
            comments: { color: "#b9b6b0" },
            retractors: { color: "#ef6155" },
            line_numbers: { color: "#b9b6b0" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Pastel On Dark",
         settings: {
            colors: {
               background: "#2c2827",
               keys: "#8f938f",
               values: {
                  number: "#cccccc",
                  string: "#66a968",
                  boolean: "#de8e30",
                  function: "#8f938f",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#8f938f",
                  square_brace: "#8f938f",
                  comma_colon_quotes: "#8f938f",
               },
            },
            comments: { color: "#8f938f" },
            retractors: { color: "#aeb2f8" },
            line_numbers: { color: "#8f938f" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Railscasts",
         settings: {
            colors: {
               background: "#2b2b2b",
               keys: "#a5c261",
               values: {
                  number: "#b6b3eb",
                  string: "#ffc66d",
                  boolean: "#b6b3eb",
                  function: "#f4f1ed",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f4f1ed",
                  square_brace: "#f4f1ed",
                  comma_colon_quotes: "#f4f1ed",
               },
            },
            comments: { color: "#f4f1ed" },
            retractors: { color: "#da4939" },
            line_numbers: { color: "#f4f1ed" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Rubyblue",
         settings: {
            colors: {
               background: "#112435",
               keys: "#ffffff",
               values: {
                  number: "#82c6e0",
                  string: "#f08047",
                  boolean: "#f4c20b",
                  function: "#ffffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffff",
                  square_brace: "#ffffff",
                  comma_colon_quotes: "#ffffff",
               },
            },
            comments: { color: "#ffffff" },
            retractors: { color: "#ff00ff" },
            line_numbers: { color: "#ffffff" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Seti",
         settings: {
            colors: {
               background: "#151718",
               keys: "#a074c4",
               values: {
                  number: "#cd3f45",
                  string: "#55b5db",
                  boolean: "#cd3f45",
                  function: "#cfd2d1",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#cfd2d1",
                  square_brace: "#cfd2d1",
                  comma_colon_quotes: "#cfd2d1",
               },
            },
            comments: { color: "#9fca56" },
            retractors: { color: "#e6cd69" },
            line_numbers: { color: "#9fca56" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Shadowfox",
         settings: {
            colors: {
               background: "#2a2a2e",
               keys: "#86de74",
               values: {
                  number: "#6b89ff",
                  string: "#6b89ff",
                  boolean: "#ff7de9",
                  function: "#b1b1b3",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#b1b1b3",
                  square_brace: "#b1b1b3",
                  comma_colon_quotes: "#b1b1b3",
               },
            },
            comments: { color: "#b1b1b3" },
            retractors: { color: "#ff7de9" },
            line_numbers: { color: "#b1b1b3" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Solarized",
         settings: {
            colors: {
               background: "#002b36",
               keys: "#2aa198",
               values: {
                  number: "#d33682",
                  string: "#859900",
                  boolean: "#d33682",
                  function: "#839496",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#839496",
                  square_brace: "#839496",
                  comma_colon_quotes: "#839496",
               },
            },
            comments: { color: "#6c71c4" },
            retractors: { color: "#cb4b16" },
            line_numbers: { color: "#6c71c4" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "The Matrix",
         settings: {
            colors: {
               background: "#000000",
               keys: "#62ffa0",
               values: {
                  number: "#ffb94f",
                  string: "#3399cc",
                  boolean: "#33ffff",
                  function: "#00ff00",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#00ff00",
                  square_brace: "#00ff00",
                  comma_colon_quotes: "#00ff00",
               },
            },
            comments: { color: "#999999" },
            retractors: { color: "#008803" },
            line_numbers: { color: "#999999" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Tomorrow Night Bright",
         settings: {
            colors: {
               background: "#000000",
               keys: "#99cc99",
               values: {
                  number: "#a16a94",
                  string: "#e7c547",
                  boolean: "#a16a94",
                  function: "#eaeaea",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#eaeaea",
                  square_brace: "#eaeaea",
                  comma_colon_quotes: "#eaeaea",
               },
            },
            comments: { color: "#eaeaea" },
            retractors: { color: "#d54e53" },
            line_numbers: { color: "#eaeaea" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Tomorrow Night Eighties",
         settings: {
            colors: {
               background: "#000000",
               keys: "#99cc99",
               values: {
                  number: "#a16a94",
                  string: "#ffcc66",
                  boolean: "#a16a94",
                  function: "#cccccc",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#cccccc",
                  square_brace: "#cccccc",
                  comma_colon_quotes: "#cccccc",
               },
            },
            comments: { color: "#cccccc" },
            retractors: { color: "#f2777a" },
            line_numbers: { color: "#cccccc" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Twilight",
         settings: {
            colors: {
               background: "#141414",
               keys: "#f7f7f7",
               values: {
                  number: "#ca7841",
                  string: "#8f9d6a",
                  boolean: "#ffcc00",
                  function: "#f7f7f7",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f7f7f7",
                  square_brace: "#f7f7f7",
                  comma_colon_quotes: "#f7f7f7",
               },
            },
            comments: { color: "#cda869" },
            retractors: { color: "#f9ee98" },
            line_numbers: { color: "#cda869" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Vibrant Ink",
         settings: {
            colors: {
               background: "#000000",
               keys: "#ffffff",
               values: {
                  number: "#ffee98",
                  string: "#a5c25c",
                  boolean: "#ffcc00",
                  function: "#ffffff",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#ffffff",
                  square_brace: "#ffffff",
                  comma_colon_quotes: "#ffffff",
               },
            },
            comments: { color: "#888888" },
            retractors: { color: "#cc7832" },
            line_numbers: { color: "#888888" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Xq Dark",
         settings: {
            colors: {
               background: "#0a001f",
               keys: "#f8f8f8",
               values: {
                  number: "#116644",
                  string: "#9fee00",
                  boolean: "#6c8cd5",
                  function: "#f8f8f8",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#f8f8f8",
                  square_brace: "#f8f8f8",
                  comma_colon_quotes: "#f8f8f8",
               },
            },
            comments: { color: "#f8f8f8" },
            retractors: { color: "#ffbd40" },
            line_numbers: { color: "#f8f8f8" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Yonce",
         settings: {
            colors: {
               background: "#1c1c1c",
               keys: "#d4d4d4",
               values: {
                  number: "#a06fca",
                  string: "#e6db74",
                  boolean: "#f39b35",
                  function: "#d4d4d4",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#d4d4d4",
                  square_brace: "#d4d4d4",
                  comma_colon_quotes: "#d4d4d4",
               },
            },
            comments: { color: "#fc4384" },
            retractors: { color: "#00a7aa" },
            line_numbers: { color: "#fc4384" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
      {
         name: "Zenburn",
         settings: {
            colors: {
               background: "#3f3f3f",
               keys: "#dfaf8f",
               values: {
                  number: "#dcdccc",
                  string: "#cc9393",
                  boolean: "#bfebbf",
                  function: "#dcdceb",
                  undefined: "#06D6A0",
                  null: "#B3B7EE",
                  other: "#FFC43D",
                  curly_brace: "#dcdceb",
                  square_brace: "#dcdceb",
                  comma_colon_quotes: "#dcdceb",
               },
            },
            comments: { color: "#f0efd0" },
            retractors: { color: "#f0dfaf" },
            line_numbers: { color: "#f0efd0" },
            bracket_pair_lines: { color: "#3c3c3c" },
         },
      },
   ],
};

const initialize = () => {
   const originalPreElement = (() => {
      const bodyChildren = document.body.children;
      const length = bodyChildren.length;
      for (let i = 0; i < length; i++) {
         const child = bodyChildren[i];
         if (child.tagName === "PRE") return child;
      }
      return null;
   })();

   if (originalPreElement === null)
      return { formatted: false, note: "No body>pre found", rawLength: null };
   const rawPreContent = originalPreElement.textContent;

   if (!rawPreContent)
      return { formatted: false, note: "No content in body>pre", rawLength: 0 };

   const rawLength = rawPreContent.length;

   if (!/^\s*[\{\[]/.test(rawPreContent))
      return {
         formatted: false,
         note: `Does not start with { or ]`,
         rawLength,
      };

   // Detach the pre
   originalPreElement.remove();

   // Add inner containers
   document.write(`
<style>
      body{
         margin:0;
      }
   .absolute {
      position: absolute;
   }
   .top-5 {
      top: 1rem;
   }
   .right-0 {
      right: 0;
   }
   .shadow {
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
         0 1px 2px -1px rgb(0 0 0 / 0.1);
   }
   .btn-group {
      padding-top: 2px;
      padding-bottom: 2px;
      padding-left: 15px;
      padding-right: 15px;
      background: white;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-top-left-radius: 50px;
      border-bottom-left-radius: 50px;
      z-index: 5;
   }

   .btn {
      background: transparent;
      border: none;
      outline: none;
      opacity: 0.3;
   }

   input:disabled,
   label:has(+ input:disabled) {
      opacity: 0.2;
   }

   .btn:hover {
      opacity: 0.8;
   }

   .flex {
      display: flex;
   }

   .items-center {
      align-items: center;
   }

   .justify-center {
      justify-content: center;
   }

   .relative {
      position: relative;
   }

   /* The switch - the box around the slider */
   .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
   }

   /* Hide default HTML checkbox */
   .switch input {
      opacity: 0;
      width: 0;
      height: 0;
   }

   /* The slider */
   .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #000;
      opacity: 0.5;
      -webkit-transition: 0.4s;
      transition: 0.4s;
   }

   .dark .slider {
      background-color: #eaeaea;
   }

   .slider:hover {
      opacity: 0.9;
   }

   .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: 0.4s;
      transition: 0.4s;
   }
   .dark .slider:before {
      background-color: #1a1a1a;
   }

   input:checked+.slider {
      background-color: #2196f3;
   }

   input:focus+.slider {
      box-shadow: 0 0 1px #2196f3;
   }

   input:checked+.slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
   }

   /* Rounded sliders */
   .slider.round {
      border-radius: 34px;
   }

   .slider.round:before {
      border-radius: 50%;
   }

   .w3-sidebar {
      height: 100%;
      width: 400px;
      background-color: #fff;
      position: fixed !important;
      z-index: 10;
      overflow: auto;
   }

   .w3-card {
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
         0 2px 10px 0 rgba(0, 0, 0, 0.12);
   }

   .w3-animate-right {
      position: relative;
      animation: animateright 0.4s;
   }

   @keyframes animateright {
      from {
         right: -300px;
         opacity: 0;
      }

      to {
         right: 0;
         opacity: 1;
      }
   }

   .close {
      padding-right: 15px;
   }

   #rightMenu .content {
      padding-top: 50px;
      padding-left: 20px;
      padding-right: 20px;
   }

   #settingsForm {
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding-bottom: 50px;
      color:black;
   }

   #settingsForm>div {
      gap: 3px;
   }

   .input-text,
   .input-select {
      display: flex;
      flex-direction: column;
   }

   .input-checkbox,
   .input-range,
   .input-color {
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
   }

   .input-range>label{
      max-width:250px;
   }

   input[type="color"] {
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      width: 24px;
      height: 26px;
      background-color: transparent;
      border: none;
      cursor: pointer;
   }

   input[type="color"]::-webkit-color-swatch {
      border-radius: 2px;
      border: 1px solid black;
   }

   input[type="color"]::-moz-color-swatch {
      border-radius: 2px;
      border: 1px solid black;
   }

   input[type="checkbox"] {
      height: 18px;
      width: 18px;
      border-radius: 20px;
   }

   input[type="number"] {
      width: 60px;
   }

   select {
      padding-top: 5px;
      padding-bottom: 5px;
      padding-left: 2px;
      padding-right: 2px;
      border-radius: 4px;
   }

   button[type="submit"] {
      padding: 5px;
      border-radius: 5px;
      position: fixed;
      bottom: 0;
      right: 20px;
      left: calc(100vw - 380px);
      margin-bottom: 10px;
   }

   h2 {
      margin-bottom: 0px;
   }

   #parsedContent > div {
      padding-top:10px;
      padding-bottom:10px;
      min-width: 100vw;
      min-height:100vh;
   }

   .dark .shadow, .dark.shadow{
      border: 1px solid rgb(255 255 255 / 0.1);
      border-right: none;
   }
   .dark #settingsForm, .dark #rightMenu, .dark #menu-btn{
      background: #1a1a1a;
      color: #eaeaea !important;
   }
   .dark path, .dark circle{
      stroke: white;
   }
   .dark #close-btn path{
      fill:white;
   }
   .dark button{
      opacity: 0.5;
   }
   .dark #reset-btn{
      opacity: 1;
   }
</style>
   <div class="shadow w3-sidebar w3-bar-block w3-card w3-animate-right relative" style="display: none; right: 0; top: 0"
      id="rightMenu">
      <button class="close btn top-5 right-0 absolute" id="close-btn">
         <?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30px" height="30px">
            <path
               d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z" />
         </svg>
      </button>
      <div class="content">
         <form id="settingsForm">
            <div class="input-select">
               <label for="theme">Theme</label>
               <select name="theme" id="theme">
                  <option value="Custom">Custom</option>
                  <optgroup label="Dark">
                     <option value="Default Dark">Default Dark</option>
                     <option value="Github Dark">Github Dark</option>
                     <option value="VS Code Dark">VS Code Dark</option>
                     <option value="Purple Mountains">Purple Mountains</option>
                     <option value="3024 Night">3024 Night</option>
                     <option value="Abbott">Abbott</option>
                     <option value="Abcdef">Abcdef</option>
                     <option value="Ambiance">Ambiance</option>
                     <option value="Ayu Dark">Ayu Dark</option>
                     <option value="Ayu Mirage">Ayu Mirage</option>
                     <option value="Base16 Dark">Base16 Dark</option>
                     <option value="Bespin">Bespin</option>
                     <option value="Blackboard">Blackboard</option>
                     <option value="Cobalt">Cobalt</option>
                     <option value="Colorforth">Colorforth</option>
                     <option value="Darcula">Darcula</option>
                     <option value="Dracula">Dracula</option>
                     <option value="Duotone Dark">Duotone Dark</option>
                     <option value="Erlang Dark">Erlang Dark</option>
                     <option value="Gruvbox Dark">Gruvbox Dark</option>
                     <option value="Hopscotch">Hopscotch</option>
                     <option value="Icecoder">Icecoder</option>
                     <option value="Isotope">Isotope</option>
                     <option value="Lesser Dark">Lesser Dark</option>
                     <option value="Liquibyte">Liquibyte</option>
                     <option value="Lucario">Lucario</option>
                     <option value="Material">Material</option>
                     <option value="Material Darker">Material Darker</option>
                     <option value="Material Palenight">Material Palenight</option>
                     <option value="Material Ocean">Material Ocean</option>
                     <option value="Mbo">Mbo</option>
                     <option value="Midnight">Midnight</option>
                     <option value="Monokai">Monokai</option>
                     <option value="Moxer">Moxer</option>
                     <option value="Night">Night</option>
                     <option value="Nord">Nord</option>
                     <option value="Oceanic Next">Oceanic Next</option>
                     <option value="Panda Syntax">Panda Syntax</option>
                     <option value="Paraiso Dark">Paraiso Dark</option>
                     <option value="Pastel On Dark">Pastel On Dark</option>
                     <option value="Railscasts">Railscasts</option>
                     <option value="Rubyblue">Rubyblue</option>
                     <option value="Seti">Seti</option>
                     <option value="Shadowfox">Shadowfox</option>
                     <option value="Solarized">Solarized</option>
                     <option value="The Matrix">The Matrix</option>
                     <option value="Tomorrow Night Bright">Tomorrow Night Bright</option>
                     <option value="Tomorrow Night Eighties">Tomorrow Night Eighties</option>
                     <option value="Twilight">Twilight</option>
                     <option value="Vibrant Ink">Vibrant Ink</option>
                     <option value="Xq Dark">Xq Dark</option>
                     <option value="Yonce">Yonce</option>
                     <option value="Zenburn">Zenburn</option>
                  </optgroup>
                  <optgroup label="Light">
                     <option value="Default Light">Default Light</option>
                     <option value="Github Light">Github Light</option>
                     <option value="VS Code Light">VS Code Light</option>
                     <option value="3024 Day">3024 Day</option>
                     <option value="Base16 Light">Base16 Light</option>
                     <option value="Duotone Light">Duotone Light</option>
                     <option value="Eclipse">Eclipse</option>
                     <option value="Elegant">Elegant</option>
                     <option value="Idea">Idea</option>
                     <option value="Juejin">Juejin</option>
                     <option value="Mdn Like">Mdn Like</option>
                     <option value="Neat">Neat</option>
                     <option value="Neo">Neo</option>
                     <option value="Paraiso Light">Paraiso Light</option>
                     <option value="Solarized">Solarized</option>
                     <option value="Ttcn">Ttcn</option>
                     <option value="Xq Light">Xq Light</option>
                     <option value="Yeti">Yeti</option>
                  </optgroup>
               </select>
            </div>

            <div class="input-range">
               <label for="fontSize">Font Size:</label>
               <input type="number" id="fontSize" name="fontSize" min="0" max="100" placeholder="Enter font size..." />
            </div>

            <div class="input-select">
               <label for="font">Font:</label><select id="font" name="font">
                  <option value="Helvetica">Helvetica</option>
                  <option value="Lucida Console">Lucidas Console</option>
                  <option value="Arial">Arial</option>
                  <option value="Arial Black">Arial Black</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Impact">Impact</option>
                  <option value="Gill Sans">Gill Sans</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Palatino">Palatino</option>
                  <option value="Baskerville">Baskerville</option>
                  <option value="Andalé Mono">Andalé Mono</option>
                  <option value="Courier">Courier</option>
                  <option value="Lucida">Lucida</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Bradley Hand">Bradley Hand</option>
                  <option value="Brush Script MT">Brush Script MT</option>
                  <option value="Luminari">Luminari</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
               </select>
            </div>

            <div class="input-range">
               <label for="line_height">Line height:</label>
               <input type="number" id="line_height" name="line_height" min="0.5" max="3.5" step="0.01" placeholder="Enter line height..."/>
            </div>

            <div class="input-range">
               <label for="space">Indentation:</label>
               <input type="number" id="space" name="space" placeholder="Enter space..." />
            </div>

            <div class="input-range">
               <label for="space_from_left">Space From Left:</label>
               <input type="number" id="space_from_left" name="space_from_left" placeholder="Enter space from left..." />
            </div>

            <div class="input-checkbox">
               <label for="links">Links:</label>
               <input type="checkbox" id="links" name="links" />
            </div>

            <h2>Colors:</h2>
            <div class="input-color">
               <label for="background">Background Color:</label>
               <input type="color" id="background" name="background" placeholder="Enter background color..." />
            </div>

            <div class="input-color">
               <label for="keys">Keys Color:</label>
               <input type="color" id="keys" name="keys" placeholder="Enter keys color..." />
            </div>

            <div class="input-color">
               <label for="number">Number Color:</label>
               <input type="color" id="number" name="number" placeholder="Enter number color..." />
            </div>

            <div class="input-color">
               <label for="string">String Color:</label>
               <input type="color" id="string" name="string" placeholder="Enter string color..." />
            </div>

            <div class="input-color">
               <label for="boolean">Boolean Color:</label>
               <input type="color" id="boolean" name="boolean" placeholder="Enter boolean color..." />
            </div>

            <div class="input-color">
               <label for="function">Function Color:</label>
               <input type="color" id="function" name="function" placeholder="Enter function color..." />
            </div>

            <div class="input-color">
               <label for="undefined">Undefined Color:</label>
               <input type="color" id="undefined" name="undefined" placeholder="Enter undefined color..." />
            </div>

            <div class="input-color">
               <label for="null">Null Color:</label>
               <input type="color" id="null" name="null" placeholder="Enter null color..." />
            </div>

            <div class="input-color">
               <label for="other">Other Color:</label>
               <input type="color" id="other" name="other" placeholder="Enter other color..." />
            </div>

            <div class="input-color">
               <label for="curly_brace">Curly Brace Color:</label>
               <input type="color" id="curly_brace" name="curly_brace" placeholder="Enter curly brace color..." />
            </div>

            <div class="input-color">
               <label for="square_brace">Square Brace Color:</label>
               <input type="color" id="square_brace" name="square_brace" placeholder="Enter square brace color..." />
            </div>

            <div class="input-color">
               <label for="comma_colon_quotes">Comma, Colon, Quotes Color:</label>
               <input type="color" id="comma_colon_quotes" name="comma_colon_quotes"
                  placeholder="Enter comma, colon, quotes color..." />
            </div>

            <h2>Comments:</h2>
            <div class="input-checkbox">
               <label for="comments_show">Show Comments:</label>
               <input type="checkbox" id="comments_show" name="comments_show" />
            </div>

            <div class="input-color">
               <label for="comments_color">Comments Color:</label>
               <input type="color" id="comments_color" name="comments_color" placeholder="Enter comments color..." />
            </div>

            <div class="input-range">
               <label for="comments_space_from_left">Space From Left:</label>
               <input type="number" id="comments_space_from_left" name="comments_space_from_left"
                  placeholder="Enter comments space from left..." />
            </div>

            <h2>Line Numbers:</h2>
            <div class="input-checkbox">
               <label for="line_numbers_show">Show Line Numbers:</label>
               <input type="checkbox" id="line_numbers_show" name="line_numbers_show" />
            </div>

            <div class="input-color">
               <label for="line_numbers_color">Line Numbers Color:</label>
               <input type="color" id="line_numbers_color" name="line_numbers_color"
                  placeholder="Enter line numbers color..." />
            </div>

            <div class="input-range">
               <label for="line_numbers_space_from_left">Space From Left:</label>
               <input type="number" id="line_numbers_space_from_left" name="line_numbers_space_from_left"
                  placeholder="Enter line numbers space from left..." />
            </div>

            <h2>Collapsibles:</h2>
            <div class="input-checkbox">
               <label for="retractors_show">Show Collapsibles:</label>
               <input type="checkbox" id="retractors_show" name="retractors_show" />
            </div>

            <div class="input-color">
               <label for="retractors_color">Collapsible Color:</label>
               <input type="color" id="retractors_color" name="retractors_color"
                  placeholder="Enter retractors color..." />
            </div>

            <div class="input-range">
               <label for="retractors_space_from_left">Space From Left:</label>
               <input type="number" id="retractors_space_from_left" name="retractors_space_from_left"
                  placeholder="Enter retractors space from left..." />
            </div>

            <h2>Bracket Pair Lines:</h2>
            <div class="input-checkbox">
               <label for="bracket_pair_lines_show">Show Bracket Pair Lines:</label>
               <input type="checkbox" id="bracket_pair_lines_show" name="bracket_pair_lines_show" />
            </div>

            <div class="input-color">
               <label for="bracket_pair_lines_color">Bracket Pair Lines Color:</label>
               <input type="color" id="bracket_pair_lines_color" name="bracket_pair_lines_color"
                  placeholder="Enter bracket pair lines color..." />
            </div>

            <div class="input-range">
               <label for="bracket_pair_lines_space_from_left">Space From Left:</label>
               <input type="number" id="bracket_pair_lines_space_from_left" name="bracket_pair_lines_space_from_left"
                  placeholder="Enter bracket pair lines space from left..." />
            </div>

            <div class="input-select">
               <label for="bracket_pair_lines_type">Bracket Pair Lines Type:</label>
               <select id="bracket_pair_lines_type" name="bracket_pair_lines_type">
                  <option value="dotted">Dotted</option>
                  <option value="dashed">Dashed</option>
                  <option value="solid">Solid</option>
                  <option value="none">None</option>
               </select>
            </div>

            <button id="reset-btn">Reset To Default</button>
         </form>
      </div>
   </div>
   <div class="absolute top-5 right-0 btn-group flex gap-2 items-center shadow" id="menu-btn">
      <label class="switch">
         <input type="checkbox" id="mode-toggle" checked />
         <span class="slider round"></span>
      </label>
      <button class="btn" id="open-btn">
         <?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
         <svg width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
               d="M10.5213 3.62368C11.3147 2.75255 12.6853 2.75255 13.4787 3.62368L14.2142 4.43128C14.6151 4.87154 15.1914 5.11025 15.7862 5.08245L16.8774 5.03146C18.0543 4.97645 19.0236 5.94568 18.9685 7.12264L18.9176 8.21377C18.8898 8.80859 19.1285 9.38487 19.5687 9.78582L20.3763 10.5213C21.2475 11.3147 21.2475 12.6853 20.3763 13.4787L19.5687 14.2142C19.1285 14.6151 18.8898 15.1914 18.9176 15.7862L18.9685 16.8774C19.0236 18.0543 18.0543 19.0236 16.8774 18.9685L15.7862 18.9176C15.1914 18.8898 14.6151 19.1285 14.2142 19.5687L13.4787 20.3763C12.6853 21.2475 11.3147 21.2475 10.5213 20.3763L9.78582 19.5687C9.38487 19.1285 8.80859 18.8898 8.21376 18.9176L7.12264 18.9685C5.94568 19.0236 4.97645 18.0543 5.03146 16.8774L5.08245 15.7862C5.11025 15.1914 4.87154 14.6151 4.43128 14.2142L3.62368 13.4787C2.75255 12.6853 2.75255 11.3147 3.62368 10.5213L4.43128 9.78582C4.87154 9.38487 5.11025 8.80859 5.08245 8.21376L5.03146 7.12264C4.97645 5.94568 5.94568 4.97645 7.12264 5.03146L8.21376 5.08245C8.80859 5.11025 9.38487 4.87154 9.78583 4.43128L10.5213 3.62368Z"
               stroke="#000000" stroke-width="2" />
            <circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2" />
         </svg>
      </button>
   </div>
   <div id="rawContent"></div>
   <div id="parsedContent"></div>
   `);

   chrome.storage.sync.get("settings", function (data) {
      var settings, theme;
      if (data.settings) {
         var settings = data.settings.configs;
         var theme = data.settings.theme;
      }
      if (!settings) {
         const defaultSettings = {
            theme: "Default Dark",
            configs: defaultStyles,
         };
         chrome.storage.sync.set(
            {
               settings: defaultSettings,
            },
            () => {}
         );
         settings = defaultSettings.configs;
         theme = defaultSettings.theme;
      }

      if (theme !== "Custom") toggleColorConfigs(false);
      else toggleColorConfigs(true);

      document.getElementById("parsedContent").innerHTML = jsontohtml(
         JSON.parse(rawPreContent),
         settings
      );
      document.getElementById("rawContent").innerText = rawPreContent;

      function setValueOnScreen(theme, settings) {
         document.getElementById("theme").value = theme;
         document.getElementById("fontSize").value =
            settings.fontSize.match(/(\d+)/)[0];
         document.getElementById("font").value = settings.font;
         document.getElementById("line_height").value = settings.line_height;
         document.getElementById("space").value =
            settings.space.match(/(\d+)/)[0];
         document.getElementById("space_from_left").value =
            settings.space_from_left.match(/(\d+)/)[0];
         document.getElementById("links").checked = settings.links;

         document.getElementById("background").value =
            settings.colors.background;
         document.getElementById("keys").value = settings.colors.keys;
         document.getElementById("number").value =
            settings.colors.values.number;
         document.getElementById("string").value =
            settings.colors.values.string;
         document.getElementById("boolean").value =
            settings.colors.values.boolean;
         document.getElementById("function").value =
            settings.colors.values.function;
         document.getElementById("undefined").value =
            settings.colors.values.undefined;
         document.getElementById("null").value = settings.colors.values.null;
         document.getElementById("other").value = settings.colors.values.other;
         document.getElementById("curly_brace").value =
            settings.colors.values.curly_brace;
         document.getElementById("square_brace").value =
            settings.colors.values.square_brace;
         document.getElementById("comma_colon_quotes").value =
            settings.colors.values.comma_colon_quotes;

         document.getElementById("comments_show").checked =
            settings.comments.show;
         document.getElementById("comments_color").value =
            settings.comments.color;
         document.getElementById("comments_space_from_left").value =
            settings.comments.space_from_left.match(/(\d+)/)[0];

         document.getElementById("line_numbers_show").checked =
            settings.line_numbers.show;
         document.getElementById("line_numbers_color").value =
            settings.line_numbers.color;
         document.getElementById("line_numbers_space_from_left").value =
            settings.line_numbers.space_from_left.match(/(\d+)/)[0];

         document.getElementById("retractors_show").checked =
            settings.retractors.show;
         document.getElementById("retractors_color").value =
            settings.retractors.color;
         document.getElementById("retractors_space_from_left").value =
            settings.retractors.space_from_left.match(/(\d+)/)[0];

         document.getElementById("bracket_pair_lines_show").checked =
            settings.bracket_pair_lines.show;
         document.getElementById("bracket_pair_lines_color").value =
            settings.bracket_pair_lines.color;
         document.getElementById("bracket_pair_lines_space_from_left").value =
            settings.bracket_pair_lines.space_from_left.match(/(\d+)/)[0];
         document.getElementById("bracket_pair_lines_type").value =
            settings.bracket_pair_lines.type;
      }
      setValueOnScreen(theme, settings);

      function toggleColorConfigs(enable) {
         const disabled = !enable;
         document.getElementById("background").disabled = disabled;
         document.getElementById("keys").disabled = disabled;
         document.getElementById("number").disabled = disabled;
         document.getElementById("string").disabled = disabled;
         document.getElementById("boolean").disabled = disabled;
         document.getElementById("function").disabled = disabled;
         document.getElementById("undefined").disabled = disabled;
         document.getElementById("null").disabled = disabled;
         document.getElementById("other").disabled = disabled;
         document.getElementById("curly_brace").disabled = disabled;
         document.getElementById("square_brace").disabled = disabled;
         document.getElementById("comma_colon_quotes").disabled = disabled;
         document.getElementById("comments_color").disabled = disabled;
         document.getElementById("line_numbers_color").disabled = disabled;
         document.getElementById("retractors_color").disabled = disabled;
         document.getElementById("bracket_pair_lines_color").disabled =
            disabled;
      }

      function handleReset(event) {
         event.preventDefault();
         setValueOnScreen("Default Dark", defaultStyles);
         toggleColorConfigs(false);

         document.getElementById("parsedContent").innerHTML = jsontohtml(
            JSON.parse(rawPreContent),
            defaultStyles
         );

         chrome.storage.sync.set(
            {
               settings: {
                  theme: "Default Dark",
                  configs: defaultStyles,
               },
            },
            () => {}
         );
      }

      function handleSubmit(event) {
         event.preventDefault();

         const changedTheme = document.getElementById("theme").value || theme;
         let changedSettings = {};
         if (changedTheme === "Custom") {
            changedSettings = {
               fontSize:
                  (document.getElementById("fontSize").value ||
                     settings.fontSize) + "px",
               font: document.getElementById("font").value || settings.font,
               line_height:
                  document.getElementById("line_height").value ||
                  settings.line_height,
               space:
                  (document.getElementById("space").value || settings.space) +
                  "px",
               space_from_left:
                  (document.getElementById("space_from_left").value ||
                     settings.space_from_left) + "px",
               links: document.getElementById("links").checked,
               colors: {
                  background:
                     document.getElementById("background").value ||
                     settings.colors.background,
                  keys:
                     document.getElementById("keys").value ||
                     settings.colors.keys,
                  values: {
                     number:
                        document.getElementById("number").value ||
                        settings.colors.values.number,
                     string:
                        document.getElementById("string").value ||
                        settings.colors.values.string,
                     boolean:
                        document.getElementById("boolean").value ||
                        settings.colors.values.boolean,
                     function:
                        document.getElementById("function").value ||
                        settings.colors.values.function,
                     undefined:
                        document.getElementById("undefined").value ||
                        settings.colors.values.undefined,
                     null:
                        document.getElementById("null").value ||
                        settings.colors.values.null,
                     other:
                        document.getElementById("other").value ||
                        settings.colors.values.other,
                     curly_brace:
                        document.getElementById("curly_brace").value ||
                        settings.colors.values.curly_brace,
                     square_brace:
                        document.getElementById("square_brace").value ||
                        settings.colors.values.square_brace,
                     comma_colon_quotes:
                        document.getElementById("comma_colon_quotes").value ||
                        settings.colors.values.comma_colon_quotes,
                  },
               },
               comments: {
                  show: document.getElementById("comments_show").checked,
                  color:
                     document.getElementById("comments_color").value ||
                     settings.comments.color,
                  space_from_left:
                     (document.getElementById("comments_space_from_left")
                        .value || settings.comments.space_from_left) + "px",
               },
               line_numbers: {
                  show: document.getElementById("line_numbers_show").checked,
                  color:
                     document.getElementById("line_numbers_color").value ||
                     settings.line_numbers.color,
                  space_from_left:
                     (document.getElementById("line_numbers_space_from_left")
                        .value || settings.line_numbers.space_from_left) + "px",
               },
               retractors: {
                  show: document.getElementById("retractors_show").checked,
                  color:
                     document.getElementById("retractors_color").value ||
                     settings.retractors.color,
                  space_from_left:
                     (document.getElementById("retractors_space_from_left")
                        .value || settings.retractors.space_from_left) + "px",
               },
               bracket_pair_lines: {
                  show: document.getElementById("bracket_pair_lines_show")
                     .checked,
                  color:
                     document.getElementById("bracket_pair_lines_color")
                        .value || settings.bracket_pair_lines.color,
                  space_from_left:
                     (document.getElementById(
                        "bracket_pair_lines_space_from_left"
                     ).value || settings.bracket_pair_lines.space_from_left) +
                     "px",
                  type:
                     document.getElementById("bracket_pair_lines_type").value ||
                     settings.bracket_pair_lines.type,
               },
            };
            toggleColorConfigs(true);
         } else {
            const themeSettings = [...themes.light, ...themes.dark].filter(
               (a) => a.name === changedTheme
            )[0].settings;

            changedSettings = {
               fontSize:
                  (document.getElementById("fontSize").value ||
                     settings.fontSize) + "px",
               font: document.getElementById("font").value || settings.font,
               line_height:
                  document.getElementById("line_height").value ||
                  settings.line_height,
               space:
                  (document.getElementById("space").value || settings.space) +
                  "px",
               space_from_left:
                  (document.getElementById("space_from_left").value ||
                     settings.space_from_left) + "px",
               links: document.getElementById("links").checked,
               colors: themeSettings.colors,
               comments: {
                  show: document.getElementById("comments_show").checked,
                  color: themeSettings.comments.color,
                  space_from_left:
                     (document.getElementById("comments_space_from_left")
                        .value || settings.comments.space_from_left) + "px",
               },
               line_numbers: {
                  show: document.getElementById("line_numbers_show").checked,
                  color: themeSettings.line_numbers.color,
                  space_from_left:
                     (document.getElementById("line_numbers_space_from_left")
                        .value || settings.line_numbers.space_from_left) + "px",
               },
               retractors: {
                  show: document.getElementById("retractors_show").checked,
                  color: themeSettings.retractors.color,
                  space_from_left:
                     (document.getElementById("retractors_space_from_left")
                        .value || settings.retractors.space_from_left) + "px",
               },
               bracket_pair_lines: {
                  show: document.getElementById("bracket_pair_lines_show")
                     .checked,
                  color: themeSettings.bracket_pair_lines.color,
                  space_from_left:
                     (document.getElementById(
                        "bracket_pair_lines_space_from_left"
                     ).value || settings.bracket_pair_lines.space_from_left) +
                     "px",
                  type:
                     document.getElementById("bracket_pair_lines_type").value ||
                     settings.bracket_pair_lines.type,
               },
            };
            toggleColorConfigs(false);
         }

         const changed = {
            theme: changedTheme,
            configs: changedSettings,
         };

         document.getElementById("parsedContent").innerHTML = jsontohtml(
            JSON.parse(rawPreContent),
            changedSettings
         );

         chrome.storage.sync.set(
            {
               settings: changed,
            },
            () => {}
         );
      }

      document
         .getElementById("settingsForm")
         .addEventListener("change", handleSubmit);
      document
         .getElementById("reset-btn")
         .addEventListener("click", handleReset);

      function openRightMenu() {
         document.getElementById("rightMenu").style.display = "block";
      }

      function closeRightMenu() {
         document.getElementById("rightMenu").style.display = "none";
      }

      document
         .getElementById("close-btn")
         .addEventListener("click", closeRightMenu);
      document
         .getElementById("open-btn")
         .addEventListener("click", openRightMenu);

      function toggleParsed(element) {
         if (element.target.checked) {
            document.getElementById("rawContent").hidden = true;
            document.getElementById("parsedContent").hidden = false;
         } else {
            document.getElementById("rawContent").hidden = false;
            document.getElementById("parsedContent").hidden = true;
         }
      }
      toggleParsed({ target: { checked: true } });
      document
         .getElementById("mode-toggle")
         .addEventListener("click", toggleParsed);
   });
};

window.onload = () => {
   initialize();
};

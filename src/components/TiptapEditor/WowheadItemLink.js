import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * Custom Tiptap extension for creating Wowhead item links.
 * This mark creates an `<a>` tag with the necessary `data-wowhead` attributes
 * that Wowhead's tooltip script uses to generate the iconic tooltips on hover.
 */
export const WowheadItemLink = Mark.create({
  name: "wowheadItemLink",

  // Make this mark inclusive, so it can be applied to selected text.
  inclusive: true,

  // Define the attributes for this mark.
  addAttributes() {
    return {
      href: {
        default: null,
      },
      "data-wowhead": {
        default: null,
      },
      // You can add other attributes here if needed, like item quality for color.
    };
  },

  // Define how to parse this mark from existing HTML.
  parseHTML() {
    return [
      {
        // Matches any `<a>` tag that has a `data-wowhead` attribute.
        tag: "a[data-wowhead]",
      },
    ];
  },

  // Define how to render this mark back into HTML.
  renderHTML({ HTMLAttributes }) {
    // The `0` means the content of the node should be rendered inside this tag.
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  // Add commands that can be used to apply, toggle, or remove the mark.
  addCommands() {
    return {
      setWowheadItemLink:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.type, attributes);
        },
      toggleWowheadItemLink:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.type, attributes);
        },
      unsetWowheadItemLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.type);
        },
    };
  },
});

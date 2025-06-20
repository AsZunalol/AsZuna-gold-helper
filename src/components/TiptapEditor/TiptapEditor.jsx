"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useCallback, useState, useEffect } from "react";
import {
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Sword, // New icon for WoW items
} from "lucide-react";
import ImageURLModal from "../ImageURLModal/ImageURLModal";
import WowItemModal from "../WowItemModal/WowItemModal"; // Import the new WoW item modal
import { WowheadItemLink } from "./WowheadItemLink"; // Import the custom extension

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isWowItemModalOpen, setIsWowItemModalOpen] = useState(false);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleAddImage = (url) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setIsImageModalOpen(false);
  };

  const handleAddWowItem = ({ text, ...attrs }) => {
    setIsWowItemModalOpen(false);
    if (text) {
      const { from, to } = editor.state.selection;
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, text)
        .setTextSelection({ from, to: from + text.length })
        .setMark("wowheadItemLink", attrs)
        .run();
    }
  };

  return (
    <>
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          <Heading2 size={18} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          <Heading3 size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <Bold size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <Italic size={18} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <List size={18} />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? "is-active" : ""}
        >
          <LinkIcon size={18} />
        </button>
        <button type="button" onClick={() => setIsImageModalOpen(true)}>
          <ImageIcon size={18} />
        </button>
        {/* New button to open the WoW Item modal */}
        <button type="button" onClick={() => setIsWowItemModalOpen(true)}>
          <Sword size={18} />
        </button>
      </div>
      {isImageModalOpen && (
        <ImageURLModal
          onSave={handleAddImage}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
      {isWowItemModalOpen && (
        <WowItemModal
          onSave={handleAddWowItem}
          onClose={() => setIsWowItemModalOpen(false)}
        />
      )}
    </>
  );
};

const Tiptap = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      WowheadItemLink, // Add the custom WoW item extension
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-mirror-editor" },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  return (
    <div className="rich-text-editor-container">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;

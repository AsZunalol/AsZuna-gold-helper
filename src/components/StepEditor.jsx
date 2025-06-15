"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect } from "react";
import { Link as LinkIcon, Bold, Italic, List } from "lucide-react";

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

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

  return (
    <div className="step-editor-toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`editor-toolbar-button ${
          editor.isActive("bold") ? "is-active" : ""
        }`}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`editor-toolbar-button ${
          editor.isActive("italic") ? "is-active" : ""
        }`}
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`editor-toolbar-button ${
          editor.isActive("bulletList") ? "is-active" : ""
        }`}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`editor-toolbar-button ${
          editor.isActive("link") ? "is-active" : ""
        }`}
      >
        <LinkIcon size={16} />
      </button>
    </div>
  );
};

export default function StepEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bold: {},
        italic: {},
        bulletList: {},
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "step-prose-mirror-editor",
      },
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
    <div className="step-editor-wrapper">
      <EditorContent editor={editor} />
      <EditorToolbar editor={editor} />
    </div>
  );
}

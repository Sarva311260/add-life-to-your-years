import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState, useRef } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Unlink, Tag, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const SYSTEM_TAGS = [
  { tag: "{{first_name}}", desc: "Prospect's first name" },
  { tag: "{{full_name}}", desc: "Prospect's full name" },
  { tag: "{{affiliate_name}}", desc: "Your name" },
  { tag: "{{affiliate_phone}}", desc: "Your phone number" },
  { tag: "{{affiliate_email}}", desc: "Your email address" },
  { tag: "{{pemf_link}}", desc: "Your PEMF page URL" },
  { tag: "{{redox_link}}", desc: "Your Redox Signalling page URL" },
  { tag: "{{olylife_link}}", desc: "Your OlyLife page URL" },
  { tag: "{{book_link}}", desc: "Your personalised book link" },
  { tag: "{{assessment_link}}", desc: "Your personalised self-assessment link" },
  { tag: "{{unsubscribe_link}}", desc: "Unsubscribe link (auto-added)" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /** When provided, shows the Insert Tag button in the toolbar */
  token?: string;
  /** For admin editors: pass adminPassword to load global tags */
  adminPassword?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message here...",
  minHeight = 200,
  className = "",
  token,
  adminPassword,
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tagTab, setTagTab] = useState<"system" | "global" | "mine" | "assets">("system");
  const tagPickerRef = useRef<HTMLDivElement>(null);

  // Load all tags when picker is opened (affiliate token path)
  const { data: allTagsData } = trpc.mergeTags.getAllTags.useQuery(
    { token: token || "" },
    { enabled: !!(token && showTagPicker) }
  );

  // Load all tags when picker is opened (admin password path)
  const { data: adminTagsData } = trpc.mergeTags.adminGetAllTags.useQuery(
    { adminPassword: adminPassword || "" },
    { enabled: !!(adminPassword && showTagPicker) }
  );

  // Merge: admin path takes priority over token path
  const resolvedTagsData = adminPassword ? adminTagsData : allTagsData;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-emerald-600 underline cursor-pointer" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. when editing an existing email)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Close tag picker when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    };
    if (showTagPicker) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTagPicker]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertTag = useCallback((tag: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(tag).run();
    setShowTagPicker(false);
  }, [editor]);

  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );

  const globalTags = (resolvedTagsData as any)?.globalTags ?? [];
  const customLinks = (resolvedTagsData as any)?.customLinks ?? [];
  const assets = (resolvedTagsData as any)?.assets ?? [];

  return (
    <div className={`border border-input rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-input bg-white dark:bg-white/10">
        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Text style */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarBtn>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        {/* Link */}
        <ToolbarBtn
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput((v) => !v);
            }
          }}
          active={editor.isActive("link")}
          title={editor.isActive("link") ? "Remove Link" : "Add Link"}
        >
          {editor.isActive("link") ? <Unlink className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
        </ToolbarBtn>

        {/* Tag Picker — shown when token or adminPassword is provided */}
        {(token || adminPassword) && (
          <>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <div className="relative" ref={tagPickerRef}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowTagPicker(v => !v); }}
                title="Insert Tag or Link"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                <Tag className="w-3 h-3" />
                Insert
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTagPicker && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    {(["system", "global", "mine", "assets"] as const).map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setTagTab(tab); }}
                        className={`flex-1 py-2 text-xs font-medium transition-colors ${
                          tagTab === tab
                            ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab === "system" ? "System" : tab === "global" ? "Global" : tab === "mine" ? "My Tags" : "Assets"}
                      </button>
                    ))}
                  </div>

                  {/* Tag list */}
                  <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
                    {tagTab === "system" && SYSTEM_TAGS.map(({ tag, desc }) => (
                      <button
                        key={tag}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); insertTag(tag); }}
                        className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-left transition-colors group"
                      >
                        <code className="text-emerald-600 text-xs font-mono flex-shrink-0 mt-0.5">{tag}</code>
                        <span className="text-gray-500 text-xs">{desc}</span>
                      </button>
                    ))}

                    {tagTab === "global" && (
                      globalTags.length === 0
                        ? <p className="text-center text-gray-400 text-xs py-4">No global tags defined yet</p>
                        : (globalTags as any[]).map((t: any) => (
                          <button
                            key={t.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertTag("{{" + t.tagKey + "}}"); }}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                          >
                            <code className="text-emerald-600 text-xs font-mono flex-shrink-0 mt-0.5">{"{{" + t.tagKey + "}}"}</code>
                            <div>
                              <p className="text-gray-700 text-xs font-medium">{t.label}</p>
                              {t.description && <p className="text-gray-400 text-xs">{t.description}</p>}
                            </div>
                          </button>
                        ))
                    )}

                    {tagTab === "mine" && (
                      customLinks.length === 0
                        ? <p className="text-center text-gray-400 text-xs py-4">No custom tags yet — add them in My Email Tags &amp; Links</p>
                        : (customLinks as any[]).map((t: any) => (
                          <button
                            key={t.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertTag("{{" + t.tagKey + "}}"); }}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                          >
                            <code className="text-emerald-600 text-xs font-mono flex-shrink-0 mt-0.5">{"{{" + t.tagKey + "}}"}</code>
                            <div>
                              <p className="text-gray-700 text-xs font-medium">{t.label}</p>
                              <p className="text-gray-400 text-xs truncate">{t.value}</p>
                            </div>
                          </button>
                        ))
                    )}

                    {tagTab === "assets" && (
                      assets.length === 0
                        ? <p className="text-center text-gray-400 text-xs py-4">No assets in library yet</p>
                        : (assets as any[]).map((a: any) => (
                          <button
                            key={a.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); insertTag("{{asset_" + a.assetKey + "}}"); }}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 text-left transition-colors"
                          >
                            <code className="text-emerald-600 text-xs font-mono flex-shrink-0 mt-0.5">{"{{asset_" + a.assetKey + "}}"}</code>
                            <div>
                              <p className="text-gray-700 text-xs font-medium">{a.label}</p>
                              <p className="text-gray-400 text-xs">{a.assetType}</p>
                            </div>
                          </button>
                        ))
                    )}
                  </div>

                  <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                    <p className="text-gray-400 text-xs">Click a tag to insert it at cursor position</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-input bg-white dark:bg-white/10">
          <Input
            autoFocus
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setLink(); } if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); } }}
            className="h-7 text-sm"
          />
          <Button size="sm" className="h-7 text-xs px-3" onClick={setLink}>Apply</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}>Cancel</Button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 focus-within:outline-none bg-white text-gray-900"
        style={{ minHeight }}
      />

      <style>{`
        .ProseMirror { outline: none; min-height: ${minHeight}px; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
        .ProseMirror a { color: #059669; text-decoration: underline; }
      `}</style>
    </div>
  );
}

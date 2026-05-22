/**
 * BlockEmailBuilder — block-based email composer
 * Blocks: Text · Image · Button · Divider · Spacer · 2 Columns
 * Toolbar: + Insert (merge tags) · Live Preview
 * Outputs HTML string via onChange (compatible with existing RichTextEditor API)
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Type, Image as ImageIcon, Square, Minus, AlignJustify, Columns2,
  ChevronDown, Eye, EyeOff, Trash2, GripVertical, Plus, Bold, Italic,
  Link as LinkIcon, Video, FileText, Link2, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
type Align = "left" | "center" | "right";

interface TextBlock {
  id: string; type: "text";
  content: string; // raw text with merge tags
  size: number; colour: string; align: Align; bold: boolean;
}
interface ImageBlock {
  id: string; type: "image";
  url: string; alt: string; align: Align;
}
interface ButtonBlock {
  id: string; type: "button";
  label: string; url: string; colour: string; align: Align;
}
interface DividerBlock {
  id: string; type: "divider";
  colour: string;
}
interface SpacerBlock {
  id: string; type: "spacer";
  height: number;
}
interface ColumnsBlock {
  id: string; type: "columns";
  left: string; right: string;
}
type Block = TextBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock | ColumnsBlock;

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case "text": {
        const style = `font-size:${b.size}px;color:${b.colour};text-align:${b.align};${b.bold ? "font-weight:bold;" : ""}`;
        const escaped = b.content.replace(/\n/g, "<br/>");
        return `<p style="${style}">${escaped}</p>`;
      }
      case "image":
        return `<div style="text-align:${b.align}"><img src="${b.url}" alt="${b.alt}" style="max-width:100%;height:auto;"/></div>`;
      case "button":
        return `<div style="text-align:${b.align};margin:12px 0"><a href="${b.url}" style="background:${b.colour};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">${b.label}</a></div>`;
      case "divider":
        return `<hr style="border:none;border-top:1px solid ${b.colour};margin:16px 0"/>`;
      case "spacer":
        return `<div style="height:${b.height}px"></div>`;
      case "columns":
        return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td width="50%" style="padding-right:8px;vertical-align:top">${b.left.replace(/\n/g, "<br/>")}</td><td width="50%" style="padding-left:8px;vertical-align:top">${b.right.replace(/\n/g, "<br/>")}</td></tr></table>`;
    }
  }).join("\n");
}

function htmlToBlocks(html: string): Block[] {
  // Simple fallback: treat existing HTML as a single text block
  if (!html || html.trim() === "") return [];
  // If it looks like our own block output, we can't easily reverse-parse it,
  // so we just put it in a text block for editing
  return [{ id: uid(), type: "text", content: html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""), size: 16, colour: "#1a1a1a", align: "left", bold: false }];
}

// ─── Block editors ────────────────────────────────────────────────────────────
function TextBlockEditor({ block, onChange, onInsert }: { block: TextBlock; onChange: (b: TextBlock) => void; onInsert: (tag: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertAtCursor = (tag: string) => {
    const el = textareaRef.current;
    if (!el) { onChange({ ...block, content: block.content + tag }); return; }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newContent = block.content.slice(0, start) + tag + block.content.slice(end);
    onChange({ ...block, content: newContent });
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + tag.length; el.focus(); }, 0);
  };
  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={e => onChange({ ...block, content: e.target.value })}
        placeholder="Your text here..."
        rows={3}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-white/60 text-xs">Size</label>
        <input type="number" value={block.size} onChange={e => onChange({ ...block, size: Number(e.target.value) })}
          className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs" min={10} max={72} />
        <label className="text-white/60 text-xs">Colour</label>
        <input type="color" value={block.colour} onChange={e => onChange({ ...block, colour: e.target.value })}
          className="w-8 h-7 rounded cursor-pointer border border-white/20 bg-transparent" />
        <label className="text-white/60 text-xs">Align</label>
        <select value={block.align} onChange={e => onChange({ ...block, align: e.target.value as Align })}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
        <button type="button" onClick={() => onChange({ ...block, bold: !block.bold })}
          className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${block.bold ? "bg-emerald-600 border-emerald-500 text-white" : "bg-white/10 border-white/20 text-white/70 hover:bg-white/20"}`}>
          B
        </button>
      </div>
    </div>
  );
}

function ImageBlockEditor({ block, onChange }: { block: ImageBlock; onChange: (b: ImageBlock) => void }) {
  return (
    <div className="space-y-2">
      <Input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })}
        placeholder="Image URL (https://...)" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
      <Input value={block.alt} onChange={e => onChange({ ...block, alt: e.target.value })}
        placeholder="Alt text" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
      <div className="flex items-center gap-2">
        <label className="text-white/60 text-xs">Align</label>
        <select value={block.align} onChange={e => onChange({ ...block, align: e.target.value as Align })}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      {block.url && <img src={block.url} alt={block.alt} className="max-h-32 rounded border border-white/20 object-contain" onError={e => (e.currentTarget.style.display = "none")} />}
    </div>
  );
}

function ButtonBlockEditor({ block, onChange }: { block: ButtonBlock; onChange: (b: ButtonBlock) => void }) {
  return (
    <div className="space-y-2">
      <Input value={block.label} onChange={e => onChange({ ...block, label: e.target.value })}
        placeholder="Button label" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
      <Input value={block.url} onChange={e => onChange({ ...block, url: e.target.value })}
        placeholder="Button URL (https://... or {{pemf_link}})" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm" />
      <div className="flex items-center gap-2">
        <label className="text-white/60 text-xs">Colour</label>
        <input type="color" value={block.colour} onChange={e => onChange({ ...block, colour: e.target.value })}
          className="w-8 h-7 rounded cursor-pointer border border-white/20 bg-transparent" />
        <label className="text-white/60 text-xs">Align</label>
        <select value={block.align} onChange={e => onChange({ ...block, align: e.target.value as Align })}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs">
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}

function DividerBlockEditor({ block, onChange }: { block: DividerBlock; onChange: (b: DividerBlock) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-white/60 text-xs">Line colour</label>
      <input type="color" value={block.colour} onChange={e => onChange({ ...block, colour: e.target.value })}
        className="w-8 h-7 rounded cursor-pointer border border-white/20 bg-transparent" />
      <hr className="flex-1 border-t" style={{ borderColor: block.colour }} />
    </div>
  );
}

function SpacerBlockEditor({ block, onChange }: { block: SpacerBlock; onChange: (b: SpacerBlock) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-white/60 text-xs">Height (px)</label>
      <input type="number" value={block.height} onChange={e => onChange({ ...block, height: Number(e.target.value) })}
        className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs" min={4} max={200} />
      <div className="flex-1 border-t border-dashed border-white/20" style={{ height: `${Math.min(block.height, 40)}px` }} />
    </div>
  );
}

function ColumnsBlockEditor({ block, onChange }: { block: ColumnsBlock; onChange: (b: ColumnsBlock) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-white/50 text-xs mb-1">Left column</p>
        <textarea value={block.left} onChange={e => onChange({ ...block, left: e.target.value })} rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>
      <div>
        <p className="text-white/50 text-xs mb-1">Right column</p>
        <textarea value={block.right} onChange={e => onChange({ ...block, right: e.target.value })} rows={3}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500" />
      </div>
    </div>
  );
}

// ─── Insert Tag Picker ────────────────────────────────────────────────────────
function InsertPicker({
  onInsert, token, adminPassword, onClose,
}: { onInsert: (tag: string) => void; token?: string; adminPassword?: string; onClose: () => void }) {
  const [tab, setTab] = useState<"system" | "global" | "mine" | "assets">("system");
  const ref = useRef<HTMLDivElement>(null);

  const { data: allTagsData } = trpc.mergeTags.getAllTags.useQuery(
    { token: token || "" }, { enabled: !!token }
  );
  const { data: adminTagsData } = trpc.mergeTags.adminGetAllTags.useQuery(
    { adminPassword: adminPassword || "" }, { enabled: !!adminPassword }
  );
  const resolved = adminPassword ? adminTagsData : allTagsData;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const globalTags = resolved?.globalTags || [];
  const myTags = resolved?.myTags || [];
  const assets = resolved?.assets || [];

  return (
    <div ref={ref} className="absolute z-50 top-full right-0 mt-1 w-80 bg-[#1a2e1f] border border-emerald-800/40 rounded-xl shadow-2xl overflow-hidden">
      <div className="flex border-b border-white/10">
        {(["system", "global", "mine", "assets"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${tab === t ? "bg-emerald-700/40 text-emerald-300" : "text-white/50 hover:text-white/80"}`}>
            {t === "system" ? "Tags" : t === "global" ? "Global" : t === "mine" ? "Mine" : "Assets"}
          </button>
        ))}
      </div>
      <div className="max-h-56 overflow-y-auto p-2 space-y-0.5">
        {tab === "system" && SYSTEM_TAGS.map(({ tag, desc }) => (
          <button key={tag} type="button" onMouseDown={e => { e.preventDefault(); onInsert(tag); onClose(); }}
            className="w-full flex flex-col items-start px-3 py-2 rounded-lg hover:bg-emerald-800/40 text-left transition-colors">
            <code className="text-emerald-400 text-xs font-mono">{tag}</code>
            <span className="text-white/50 text-xs">{desc}</span>
          </button>
        ))}
        {tab === "global" && (globalTags.length === 0
          ? <p className="text-white/40 text-xs px-3 py-4 text-center">No global tags yet</p>
          : globalTags.map((t: { tagKey: string; label: string }) => (
            <button key={t.tagKey} type="button" onMouseDown={e => { e.preventDefault(); onInsert(`{{${t.tagKey}}}`); onClose(); }}
              className="w-full flex flex-col items-start px-3 py-2 rounded-lg hover:bg-emerald-800/40 text-left transition-colors">
              <code className="text-emerald-400 text-xs font-mono">{`{{${t.tagKey}}}`}</code>
              <span className="text-white/50 text-xs">{t.label}</span>
            </button>
          ))
        )}
        {tab === "mine" && (myTags.length === 0
          ? <p className="text-white/40 text-xs px-3 py-4 text-center">No personal tags yet</p>
          : myTags.map((t: { tagKey: string; label: string }) => (
            <button key={t.tagKey} type="button" onMouseDown={e => { e.preventDefault(); onInsert(`{{${t.tagKey}}}`); onClose(); }}
              className="w-full flex flex-col items-start px-3 py-2 rounded-lg hover:bg-emerald-800/40 text-left transition-colors">
              <code className="text-emerald-400 text-xs font-mono">{`{{${t.tagKey}}}`}</code>
              <span className="text-white/50 text-xs">{t.label}</span>
            </button>
          ))
        )}
        {tab === "assets" && (assets.length === 0
          ? <p className="text-white/40 text-xs px-3 py-4 text-center">No assets yet</p>
          : assets.map((a: { id: number; tagKey: string; title?: string; label?: string; description?: string; assetType?: string; url?: string; thumbnailUrl?: string }) => {
            const ytMatch = a.url && a.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
            const ytId = ytMatch ? ytMatch[1] : null;
            const thumbSrc = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : a.thumbnailUrl || null;
            const assetTitle = a.title || a.label || a.tagKey;
            const AssetIcon = a.assetType === "video" ? Video : a.assetType === "pdf" ? FileText : a.assetType === "image" ? ImageIcon : Link2;
            return (
              <button key={a.id} type="button" onMouseDown={e => { e.preventDefault(); onInsert(`{{asset_${a.tagKey}}}`); onClose(); }}
                className="w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-emerald-800/40 text-left transition-colors">
                <div className="flex-shrink-0 w-14 h-9 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                  {thumbSrc ? <img src={thumbSrc} alt={assetTitle} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    : <AssetIcon className="w-4 h-4 text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-tight">{assetTitle}</p>
                  {a.description && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{a.description}</p>}
                  <code className="text-emerald-400 text-[10px] font-mono">{`{{asset_${a.tagKey}}}`}</code>
                </div>
              </button>
            );
          })
        )}
      </div>
      <div className="px-3 py-2 border-t border-white/10 bg-black/20">
        <p className="text-white/30 text-xs">Click a tag to insert it into the active text block</p>
      </div>
    </div>
  );
}

// ─── Live Preview ─────────────────────────────────────────────────────────────
function LivePreview({ html, onClose }: { html: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Live Preview</span>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕ Close</button>
        </div>
        <div className="p-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

// ─── Block Row ────────────────────────────────────────────────────────────────
const BLOCK_ICONS: Record<Block["type"], React.ReactNode> = {
  text: <Type className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  button: <Square className="w-4 h-4" />,
  divider: <Minus className="w-4 h-4" />,
  spacer: <AlignJustify className="w-4 h-4" />,
  columns: <Columns2 className="w-4 h-4" />,
};
const BLOCK_LABELS: Record<Block["type"], string> = {
  text: "Text", image: "Image", button: "Button",
  divider: "Divider", spacer: "Spacer", columns: "2 Columns",
};

function BlockRow({
  block, onChange, onDelete, onInsertTag, token, adminPassword,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
  onInsertTag: (blockId: string, tag: string) => void;
  token?: string;
  adminPassword?: string;
}) {
  const [open, setOpen] = useState(true);

  const handleInsert = useCallback((tag: string) => {
    onInsertTag(block.id, tag);
  }, [block.id, onInsertTag]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Block header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <GripVertical className="w-4 h-4 text-white/30 cursor-grab" />
        <span className="text-emerald-400">{BLOCK_ICONS[block.type]}</span>
        <span className="text-white/80 text-sm font-medium flex-1">{BLOCK_LABELS[block.type]}</span>
        <button type="button" onClick={() => setOpen(o => !o)} className="text-white/40 hover:text-white/70 transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onDelete} className="text-red-400/60 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      {/* Block content */}
      {open && (
        <div className="px-3 py-3">
          {block.type === "text" && (
            <TextBlockEditor block={block} onChange={b => onChange(b)} onInsert={handleInsert} />
          )}
          {block.type === "image" && (
            <ImageBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === "button" && (
            <ButtonBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === "divider" && (
            <DividerBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === "spacer" && (
            <SpacerBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === "columns" && (
            <ColumnsBlockEditor block={block} onChange={b => onChange(b)} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface BlockEmailBuilderProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  token?: string;
  adminPassword?: string;
  className?: string;
}

export default function BlockEmailBuilder({
  value,
  onChange,
  token,
  adminPassword,
  className = "",
}: BlockEmailBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (!value || value.trim() === "") return [];
    return htmlToBlocks(value);
  });
  const [showInsert, setShowInsert] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const insertRef = useRef<HTMLDivElement>(null);

  // Sync blocks → HTML → parent
  useEffect(() => {
    onChange(blocksToHtml(blocks));
  }, [blocks]); // eslint-disable-line react-hooks/exhaustive-deps

  const addBlock = (type: Block["type"]) => {
    let newBlock: Block;
    switch (type) {
      case "text": newBlock = { id: uid(), type: "text", content: "", size: 16, colour: "#1a1a1a", align: "left", bold: false }; break;
      case "image": newBlock = { id: uid(), type: "image", url: "", alt: "", align: "center" }; break;
      case "button": newBlock = { id: uid(), type: "button", label: "Click here", url: "", colour: "#059669", align: "center" }; break;
      case "divider": newBlock = { id: uid(), type: "divider", colour: "#e5e7eb" }; break;
      case "spacer": newBlock = { id: uid(), type: "spacer", height: 24 }; break;
      case "columns": newBlock = { id: uid(), type: "columns", left: "", right: "" }; break;
    }
    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const updateBlock = (updated: Block) => {
    setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const insertTagIntoBlock = useCallback((blockId: string, tag: string) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      if (b.type === "text") return { ...b, content: b.content + tag };
      if (b.type === "columns") return { ...b, left: b.left + tag };
      return b;
    }));
  }, []);

  // Insert tag into the last active text block, or the last text block
  const insertTagGlobal = useCallback((tag: string) => {
    setBlocks(prev => {
      const targetId = activeBlockId || prev.filter(b => b.type === "text").slice(-1)[0]?.id;
      if (!targetId) {
        // Add a new text block with the tag
        return [...prev, { id: uid(), type: "text", content: tag, size: 16, colour: "#1a1a1a", align: "left", bold: false }];
      }
      return prev.map(b => {
        if (b.id !== targetId) return b;
        if (b.type === "text") return { ...b, content: b.content + tag };
        if (b.type === "columns") return { ...b, left: b.left + tag };
        return b;
      });
    });
  }, [activeBlockId]);

  const previewHtml = blocksToHtml(blocks);

  const BLOCK_TYPES: { type: Block["type"]; icon: React.ReactNode; label: string }[] = [
    { type: "text", icon: <Type className="w-3.5 h-3.5" />, label: "Text" },
    { type: "image", icon: <ImageIcon className="w-3.5 h-3.5" />, label: "Image" },
    { type: "button", icon: <Square className="w-3.5 h-3.5" />, label: "Button" },
    { type: "divider", icon: <Minus className="w-3.5 h-3.5" />, label: "Divider" },
    { type: "spacer", icon: <AlignJustify className="w-3.5 h-3.5" />, label: "Spacer" },
    { type: "columns", icon: <Columns2 className="w-3.5 h-3.5" />, label: "2 Columns" },
  ];

  return (
    <div className={`border border-white/15 rounded-xl overflow-visible bg-white/5 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-white/5">
        {BLOCK_TYPES.map(({ type, icon, label }) => (
          <button key={type} type="button" onClick={() => addBlock(type)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-emerald-700/40 text-white/80 hover:text-white text-xs font-medium transition-colors border border-white/10 hover:border-emerald-600/40">
            {icon}
            <span>+ {label}</span>
          </button>
        ))}
        {/* Insert */}
        <div className="relative ml-auto" ref={insertRef}>
          <button type="button" onClick={() => setShowInsert(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700/50 hover:bg-emerald-600/60 text-emerald-200 text-xs font-semibold transition-colors border border-emerald-600/40">
            <Plus className="w-3.5 h-3.5" />
            Insert
            <ChevronDown className="w-3 h-3" />
          </button>
          {showInsert && (
            <InsertPicker
              onInsert={insertTagGlobal}
              token={token}
              adminPassword={adminPassword}
              onClose={() => setShowInsert(false)}
            />
          )}
        </div>
        {/* Live Preview */}
        <button type="button" onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-colors border border-white/10">
          <Eye className="w-3.5 h-3.5" />
          Live Preview
        </button>
      </div>

      {/* Blocks */}
      <div className="p-3 space-y-2 min-h-[160px]">
        {blocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-white/30 text-sm">
            <Type className="w-8 h-8 mb-2 opacity-30" />
            <p>Click a block type above to start building your email</p>
          </div>
        )}
        {blocks.map(block => (
          <div key={block.id} onClick={() => setActiveBlockId(block.id)}>
            <BlockRow
              block={block}
              onChange={updateBlock}
              onDelete={() => deleteBlock(block.id)}
              onInsertTag={insertTagIntoBlock}
              token={token}
              adminPassword={adminPassword}
            />
          </div>
        ))}
      </div>

      {/* Live Preview Modal */}
      {showPreview && <LivePreview html={previewHtml} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

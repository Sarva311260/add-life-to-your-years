/**
 * Admin Content Library
 * Manages:
 *  1. Global Merge Tags — custom link/text tags available to all affiliates
 *  2. Asset Library — shared videos, PDFs, documents for use in emails
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tag, Plus, Pencil, Trash2, Video, FileText, Link2, Image, ToggleLeft, ToggleRight, BookOpen,
} from "lucide-react";
import HelpTip from "@/components/HelpTip";

interface Props {
  adminPassword: string;
}

// ─── Merge Tags Section ───────────────────────────────────────────────────────

function MergeTagsSection({ adminPassword }: Props) {
  const utils = trpc.useUtils();
  const { data: tagsData, isLoading } = trpc.mergeTags.adminGetAllTags.useQuery({ adminPassword });
  const tags = (tagsData as any)?.globalTags ?? [];
  const upsert = trpc.mergeTags.adminUpsertTag.useMutation({
    onSuccess: () => { utils.mergeTags.adminGetAllTags.invalidate(); toast.success("Tag saved!"); setEditOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.mergeTags.adminDeleteTag.useMutation({
    onSuccess: () => { utils.mergeTags.adminGetAllTags.invalidate(); toast.success("Tag deleted"); },
    onError: (e) => toast.error(e.message),
  });
  const toggle = trpc.mergeTags.adminToggleTag.useMutation({
    onSuccess: () => utils.mergeTags.adminGetAllTags.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editTag, setEditTag] = useState<{ id?: number; tagKey: string; label: string; defaultValue: string; category: "link" | "text" | "asset"; description: string; sortOrder: number } | null>(null);

  const openNew = () => {
    setEditTag({ tagKey: "", label: "", defaultValue: "", category: "link", description: "", sortOrder: 0 });
    setEditOpen(true);
  };
  const openEdit = (tag: typeof tags[0]) => {
    setEditTag({ id: tag.id, tagKey: tag.tagKey, label: tag.label, defaultValue: tag.defaultValue || "", category: (tag.category as "link" | "text" | "asset") || "link", description: tag.description || "", sortOrder: tag.sortOrder || 0 });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editTag) return;
    if (!editTag.tagKey || !editTag.label) { toast.error("Tag key and label are required"); return; }
    upsert.mutate({ adminPassword, ...editTag });
  };

  const categoryIcon = (cat: string) => {
    if (cat === "link") return <Link2 className="w-3.5 h-3.5" />;
    if (cat === "asset") return <Video className="w-3.5 h-3.5" />;
    return <Tag className="w-3.5 h-3.5" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">Global Merge Tags <HelpTip text="Custom tags shared with all affiliates. Affiliates can insert these into their email templates using the Insert picker. Use {{tag_key}} syntax." /></h3>
          <p className="text-gray-400 text-sm mt-0.5">Custom tags available to all affiliates in their emails. Use <code className="text-emerald-400">{"{{tag_key}}"}</code> in email subject or body.</p>
        </div>
        <Button onClick={openNew} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Add Tag
        </Button>
      </div>

      {/* System tags reference */}
      <div className="bg-[#0a2e1a]/60 border border-emerald-800/20 rounded-xl p-4 mb-4">
        <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">Built-in System Tags (always available)</p>
        <div className="flex flex-wrap gap-2">
          {[
            "{{first_name}}", "{{full_name}}", "{{prospect_email}}",
            "{{affiliate_name}}", "{{affiliate_email}}", "{{affiliate_phone}}",
            "{{pemf_link}}", "{{redox_link}}", "{{olylife_link}}", "{{site_link}}",
          ].map(tag => (
            <code key={tag} className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-1 rounded border border-emerald-800/30">{tag}</code>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : tags.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-8 border border-dashed border-gray-700 rounded-xl">
          No global tags yet. Add your first tag above.
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag: any) => (
            <div key={tag.id} className={`flex items-start gap-3 p-3 rounded-xl border ${tag.isActive ? "bg-[#0d3b22]/40 border-emerald-800/20" : "bg-gray-900/40 border-gray-700/30 opacity-60"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-emerald-400 text-sm font-mono">{`{{${tag.tagKey}}}`}</code>
                  <span className="text-white text-sm font-medium">{tag.label}</span>
                  <Badge variant="outline" className="text-xs gap-1 border-gray-600 text-gray-400">
                    {categoryIcon(tag.category || "text")} {tag.category || "text"}
                  </Badge>
                </div>
                {tag.defaultValue && (
                  <p className="text-gray-400 text-xs mt-1 truncate">{tag.defaultValue}</p>
                )}
                {tag.description && (
                  <p className="text-gray-500 text-xs mt-0.5">{tag.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggle.mutate({ adminPassword, id: tag.id, isActive: tag.isActive ? 0 : 1 })}
                  className="text-gray-400 hover:text-emerald-400 transition-colors"
                  title={tag.isActive ? "Deactivate" : "Activate"}
                >
                  {tag.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => openEdit(tag)} className="text-gray-400 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm("Delete this tag?")) del.mutate({ adminPassword, id: tag.id }); }} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0d1f14] border-emerald-800/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editTag?.id ? "Edit Tag" : "Add Global Tag"}</DialogTitle>
          </DialogHeader>
          {editTag && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tag Key <span className="text-red-400">*</span></label>
                <Input
                  value={editTag.tagKey}
                  onChange={e => setEditTag({ ...editTag, tagKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                  placeholder="e.g. my_booking_link"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white font-mono"
                  disabled={!!editTag.id}
                />
                <p className="text-gray-500 text-xs mt-1">Used as <code className="text-emerald-400">{`{{${editTag.tagKey || "tag_key"}}}`}</code> in emails</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Label <span className="text-red-400">*</span></label>
                <Input
                  value={editTag.label}
                  onChange={e => setEditTag({ ...editTag, label: e.target.value })}
                  placeholder="e.g. My Booking Page"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Category</label>
                <Select value={editTag.category} onValueChange={v => setEditTag({ ...editTag, category: v as "link" | "text" | "asset" })}>
                  <SelectTrigger className="bg-[#0a2e1a] border-emerald-800/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1f14] border-emerald-800/30 text-white">
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Default Value</label>
                <Input
                  value={editTag.defaultValue}
                  onChange={e => setEditTag({ ...editTag, defaultValue: e.target.value })}
                  placeholder="e.g. https://addlifetoyouryears.org"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">Affiliates can override this with their own value</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
                <Input
                  value={editTag.description}
                  onChange={e => setEditTag({ ...editTag, description: e.target.value })}
                  placeholder="Brief description of what this tag does"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Sort Order</label>
                <Input
                  type="number"
                  value={editTag.sortOrder}
                  onChange={e => setEditTag({ ...editTag, sortOrder: parseInt(e.target.value) || 0 })}
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white w-24"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={upsert.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white flex-1">
                  {upsert.isPending ? "Saving..." : "Save Tag"}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Asset Library Section ────────────────────────────────────────────────────

function AssetLibrarySection({ adminPassword }: Props) {
  const utils = trpc.useUtils();
  const { data: assets = [], isLoading } = trpc.mergeTags.adminGetAllAssets.useQuery({ adminPassword });
  const upsert = trpc.mergeTags.adminUpsertAsset.useMutation({
    onSuccess: () => { utils.mergeTags.adminGetAllAssets.invalidate(); toast.success("Asset saved!"); setEditOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const del = trpc.mergeTags.adminDeleteAsset.useMutation({
    onSuccess: () => { utils.mergeTags.adminGetAllAssets.invalidate(); toast.success("Asset deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<{
    id?: number; tagKey: string; title: string; assetType: "video" | "pdf" | "image" | "link";
    url: string; thumbnailUrl: string; description: string; embedHtml: string; sortOrder: number;
  } | null>(null);

  const openNew = () => {
    setEditAsset({ tagKey: "", title: "", assetType: "video", url: "", thumbnailUrl: "", description: "", embedHtml: "", sortOrder: 0 });
    setEditOpen(true);
  };
  const openEdit = (asset: typeof assets[0]) => {
    setEditAsset({
      id: asset.id, tagKey: asset.tagKey, title: asset.title,
      assetType: (asset.assetType as "video" | "pdf" | "image" | "link") || "video",
      url: asset.url, thumbnailUrl: asset.thumbnailUrl || "", description: asset.description || "",
      embedHtml: asset.embedHtml || "", sortOrder: asset.sortOrder || 0,
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editAsset) return;
    if (!editAsset.tagKey || !editAsset.title || !editAsset.url) { toast.error("Tag key, title and URL are required"); return; }
    upsert.mutate({
      adminPassword,
      ...editAsset,
      thumbnailUrl: editAsset.thumbnailUrl || undefined,
      description: editAsset.description || undefined,
      embedHtml: editAsset.embedHtml || undefined,
    });
  };

  const assetTypeIcon = (type: string) => {
    if (type === "video") return <Video className="w-4 h-4 text-blue-400" />;
    if (type === "pdf") return <FileText className="w-4 h-4 text-red-400" />;
    if (type === "image") return <Image className="w-4 h-4 text-purple-400" />;
    return <Link2 className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">Asset Library <HelpTip text="Shared videos, PDFs, and links that affiliates can insert into their emails. Each asset gets a tag key so affiliates can insert it with one click." /></h3>
          <p className="text-gray-400 text-sm mt-0.5">Shared videos, PDFs, and links. Insert into emails using <code className="text-emerald-400">{"{{tag_key}}"}</code>.</p>
        </div>
        <Button onClick={openNew} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Add Asset
        </Button>
      </div>

      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : assets.length === 0 ? (
        <div className="text-gray-500 text-sm text-center py-8 border border-dashed border-gray-700 rounded-xl">
          No assets yet. Add your first video, PDF or link above.
        </div>
      ) : (
        <div className="space-y-2">
          {assets.map(asset => (
            <div key={asset.id} className={`flex items-start gap-3 p-3 rounded-xl border ${asset.isActive ? "bg-[#0d3b22]/40 border-emerald-800/20" : "bg-gray-900/40 border-gray-700/30 opacity-60"}`}>
              <div className="flex-shrink-0 mt-0.5">{assetTypeIcon(asset.assetType || "link")}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-emerald-400 text-sm font-mono">{`{{${asset.tagKey}}}`}</code>
                  <span className="text-white text-sm font-medium">{asset.title}</span>
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">{asset.assetType}</Badge>
                </div>
                <p className="text-gray-400 text-xs mt-1 truncate">{asset.url}</p>
                {asset.description && <p className="text-gray-500 text-xs mt-0.5">{asset.description}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(asset)} className="text-gray-400 hover:text-white transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { if (confirm("Delete this asset?")) del.mutate({ adminPassword, id: asset.id }); }} className="text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-[#0d1f14] border-emerald-800/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editAsset?.id ? "Edit Asset" : "Add Asset"}</DialogTitle>
          </DialogHeader>
          {editAsset && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Tag Key <span className="text-red-400">*</span></label>
                <Input
                  value={editAsset.tagKey}
                  onChange={e => setEditAsset({ ...editAsset, tagKey: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                  placeholder="e.g. video_redox_intro"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white font-mono"
                  disabled={!!editAsset.id}
                />
                <p className="text-gray-500 text-xs mt-1">Used as <code className="text-emerald-400">{`{{${editAsset.tagKey || "tag_key"}}}`}</code> in emails</p>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Title <span className="text-red-400">*</span></label>
                <Input
                  value={editAsset.title}
                  onChange={e => setEditAsset({ ...editAsset, title: e.target.value })}
                  placeholder="e.g. ASEA Redox Introduction Video"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type</label>
                <Select value={editAsset.assetType} onValueChange={v => setEditAsset({ ...editAsset, assetType: v as "video" | "pdf" | "image" | "link" })}>
                  <SelectTrigger className="bg-[#0a2e1a] border-emerald-800/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0d1f14] border-emerald-800/30 text-white">
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF / Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">URL <span className="text-red-400">*</span></label>
                <Input
                  value={editAsset.url}
                  onChange={e => setEditAsset({ ...editAsset, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Thumbnail URL (optional)</label>
                <Input
                  value={editAsset.thumbnailUrl}
                  onChange={e => setEditAsset({ ...editAsset, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description (optional)</label>
                <Input
                  value={editAsset.description}
                  onChange={e => setEditAsset({ ...editAsset, description: e.target.value })}
                  placeholder="Brief description"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Custom HTML (optional — overrides default rendering)</label>
                <Textarea
                  value={editAsset.embedHtml}
                  onChange={e => setEditAsset({ ...editAsset, embedHtml: e.target.value })}
                  placeholder="<a href='...'>Click here</a>"
                  className="bg-[#0a2e1a] border-emerald-800/30 text-white font-mono text-xs"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={upsert.isPending} className="bg-blue-600 hover:bg-blue-500 text-white flex-1">
                  {upsert.isPending ? "Saving..." : "Save Asset"}
                </Button>
                <Button variant="outline" onClick={() => setEditOpen(false)} className="border-gray-600 text-gray-300">Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type LibraryTab = "tags" | "assets";

export default function PEMFAdminContentLibrary({ adminPassword }: Props) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("tags");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" /> Content Library
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage merge tags and shared assets that affiliates can insert into their emails.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-emerald-800/20 pb-0">
        {(["tags", "assets"] as LibraryTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab === "tags" ? "Merge Tags" : "Asset Library"}
          </button>
        ))}
      </div>

      {activeTab === "tags" && <MergeTagsSection adminPassword={adminPassword} />}
      {activeTab === "assets" && <AssetLibrarySection adminPassword={adminPassword} />}
    </div>
  );
}

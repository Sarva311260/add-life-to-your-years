import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Leaf, ArrowLeft, Plus, Trash2, Edit2, Check, X, Eye, EyeOff,
  FileText, Mail, Video, BookOpen, Upload, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";

const ADMIN_TOKEN_KEY = "pemf_admin_token";
function getAdminToken() { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; }

const TYPE_CONFIG = {
  document: { label: "Document / PDF", icon: FileText, color: "text-blue-400", bg: "bg-blue-900/20" },
  script: { label: "Script", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-900/20" },
  email_template: { label: "Email Template", icon: Mail, color: "text-yellow-400", bg: "bg-yellow-900/20" },
  video: { label: "Video", icon: Video, color: "text-red-400", bg: "bg-red-900/20" },
} as const;

type ResourceType = keyof typeof TYPE_CONFIG;

interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  content: string | null;
  videoUrl: string | null;
  category: string | null;
  isPublished: number;
  sortOrder: number;
  createdAt: Date;
}

// ─── Add Resource Form ────────────────────────────────────────────────────────
function AddResourceForm({ adminToken, onSuccess, onCancel }: {
  adminToken: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<ResourceType>("document");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.pemfAffiliate.adminUploadFile.useMutation({
    onSuccess: (data) => {
      setUploadedFile({ url: data.url, name: data.fileName });
      toast.success("File uploaded successfully.");
      setUploading(false);
    },
    onError: (err) => { toast.error(err.message); setUploading(false); },
  });

  const createMutation = trpc.pemfAffiliate.adminCreateResource.useMutation({
    onSuccess: () => { toast.success("Resource added."); onSuccess(); },
    onError: (err) => toast.error(err.message),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("File must be under 16MB."); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ adminToken, fileName: file.name, fileBase64: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required."); return; }
    if ((type === "document" || type === "script") && !uploadedFile) {
      toast.error("Please upload a file."); return;
    }
    if (type === "video" && !videoUrl.trim()) {
      toast.error("Please enter a video URL."); return;
    }
    if (type === "email_template" && !content.trim()) {
      toast.error("Please enter the email template content."); return;
    }
    createMutation.mutate({
      adminToken,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      fileUrl: uploadedFile?.url,
      fileName: uploadedFile?.name,
      content: content.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      category: category.trim() || undefined,
      isPublished,
    });
  };

  return (
    <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-400" /> Add New Resource
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div>
          <label className="block text-emerald-300/70 text-xs mb-2">Resource Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(TYPE_CONFIG) as ResourceType[]).map((t) => {
              const { label, icon: Icon, color, bg } = TYPE_CONFIG[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                    type === t
                      ? `${bg} border-emerald-500/50 ${color}`
                      : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title + Category */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-emerald-300/70 text-xs mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="e.g. PEMF Introduction Script"
              required
            />
          </div>
          <div>
            <label className="block text-emerald-300/70 text-xs mb-1">Category (optional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="e.g. Getting Started, Social Media"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-emerald-300/70 text-xs mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
            placeholder="Brief description shown to affiliates"
          />
        </div>

        {/* File upload for document/script */}
        {(type === "document" || type === "script") && (
          <div>
            <label className="block text-emerald-300/70 text-xs mb-1">Upload File *</label>
            {uploadedFile ? (
              <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg px-4 py-3">
                <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-white text-sm flex-1 truncate">{uploadedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.pptx,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-emerald-700/30 text-white text-sm px-4 py-2.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploading ? "Uploading..." : "Choose File (PDF, DOC, etc.)"}
                </button>
                <p className="text-gray-500 text-xs mt-1">Max 16MB</p>
              </div>
            )}
          </div>
        )}

        {/* Video URL */}
        {type === "video" && (
          <div>
            <label className="block text-emerald-300/70 text-xs mb-1">Video URL * (YouTube, Vimeo, etc.)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        )}

        {/* Email template content */}
        {type === "email_template" && (
          <div>
            <label className="block text-emerald-300/70 text-xs mb-1">Email Template Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y font-mono"
              placeholder="Subject: ...\n\nHi [Name],\n\n..."
            />
          </div>
        )}

        {/* Published toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-emerald-600" : "bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-sm text-gray-300">{isPublished ? "Published (visible to affiliates)" : "Draft (hidden from affiliates)"}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending || uploading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            Add Resource
          </button>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white text-sm px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, adminToken, onRefresh }: {
  resource: Resource;
  adminToken: string;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(resource.title);
  const [editDesc, setEditDesc] = useState(resource.description || "");
  const [editCategory, setEditCategory] = useState(resource.category || "");
  const [editContent, setEditContent] = useState(resource.content || "");
  const [editVideoUrl, setEditVideoUrl] = useState(resource.videoUrl || "");

  const { label, icon: Icon, color, bg } = TYPE_CONFIG[resource.type];

  const togglePublish = trpc.pemfAffiliate.adminUpdateResource.useMutation({
    onSuccess: () => { toast.success(resource.isPublished ? "Unpublished." : "Published."); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.pemfAffiliate.adminUpdateResource.useMutation({
    onSuccess: () => { toast.success("Resource updated."); setEditing(false); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.pemfAffiliate.adminDeleteResource.useMutation({
    onSuccess: () => { toast.success("Resource deleted."); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${resource.isPublished ? "border-emerald-800/30" : "border-gray-700/30 opacity-60"}`}>
      <div className="flex items-center gap-3 p-4">
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-medium text-sm">{resource.title}</p>
            {!resource.isPublished && <span className="text-xs bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded">Draft</span>}
            {resource.category && <span className="text-xs bg-emerald-900/30 text-emerald-400/70 px-1.5 py-0.5 rounded">{resource.category}</span>}
          </div>
          <p className="text-gray-500 text-xs">{label}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white transition-colors p-1">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-emerald-800/20 p-4 space-y-3">
          {!editing ? (
            <>
              {resource.description && <p className="text-gray-400 text-sm">{resource.description}</p>}
              {resource.fileUrl && (
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm">
                  <ExternalLink className="w-4 h-4" /> {resource.fileName || "View File"}
                </a>
              )}
              {resource.videoUrl && (
                <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm">
                  <ExternalLink className="w-4 h-4" /> {resource.videoUrl}
                </a>
              )}
              {resource.content && (
                <pre className="bg-black/30 rounded-lg p-3 text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">{resource.content}</pre>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => togglePublish.mutate({ adminToken, id: resource.id, isPublished: !resource.isPublished })}
                  disabled={togglePublish.isPending}
                  className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {resource.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {resource.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => { if (confirm("Delete this resource?")) deleteMutation.mutate({ adminToken, id: resource.id }); }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1.5 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-emerald-300/70 text-xs mb-1">Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-emerald-300/70 text-xs mb-1">Category</label>
                <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
              <div>
                <label className="block text-emerald-300/70 text-xs mb-1">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
              </div>
              {resource.type === "email_template" && (
                <div>
                  <label className="block text-emerald-300/70 text-xs mb-1">Email Content</label>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={8}
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y font-mono" />
                </div>
              )}
              {resource.type === "video" && (
                <div>
                  <label className="block text-emerald-300/70 text-xs mb-1">Video URL</label>
                  <input type="url" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({
                    adminToken, id: resource.id,
                    title: editTitle, description: editDesc || undefined,
                    category: editCategory || undefined,
                    content: resource.type === "email_template" ? (editContent || undefined) : undefined,
                    videoUrl: resource.type === "video" ? (editVideoUrl || undefined) : undefined,
                  })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PEMFAdminResources() {
  const adminToken = getAdminToken();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");

  const { data: resources, isLoading, refetch } = trpc.pemfAffiliate.adminGetResources.useQuery(
    { adminToken },
    { enabled: !!adminToken, retry: false }
  );

  if (!adminToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">You must be logged in as admin.</p>
          <a href="/pemf/admin" className="text-emerald-400 hover:text-emerald-300">← Back to Admin</a>
        </div>
      </div>
    );
  }

  const filtered = resources
    ? (filterType === "all" ? resources : resources.filter(r => r.type === filterType))
    : [];

  const grouped = filtered.reduce((acc, r) => {
    const cat = r.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/pemf/admin" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-medium">Resource Library</span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Add form */}
        {showAddForm && (
          <AddResourceForm
            adminToken={adminToken}
            onSuccess={() => { setShowAddForm(false); refetch(); }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "document", "script", "email_template", "video"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                filterType === t
                  ? "bg-emerald-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t === "all" ? "All" : TYPE_CONFIG[t].label}
              {resources && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({t === "all" ? resources.length : resources.filter(r => r.type === t).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Resources */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No resources yet. Click "Add Resource" to get started.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-emerald-400/70 text-xs font-semibold uppercase tracking-wider mb-3">{category}</h3>
              <div className="space-y-2">
                {items.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource as Resource}
                    adminToken={adminToken}
                    onRefresh={() => refetch()}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

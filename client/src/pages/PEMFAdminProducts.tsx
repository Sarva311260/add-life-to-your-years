/**
 * PEMFAdminProducts — Admin UI for managing Recommended Products
 * Shown inside the "Recommended Products" tab in PEMFAdmin.tsx
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag, Plus, Edit2, Trash2, Check, X, ExternalLink, Eye, EyeOff, Link2, Upload, ImageIcon
} from "lucide-react";

/** Reusable image upload widget */
function ImageUploadField({
  adminToken,
  value,
  onChange,
}: {
  adminToken: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.recommendedProducts.adminUploadImage.useMutation({
    onSuccess: (data) => { onChange(data.url); toast.success("Image uploaded."); },
    onError: (e) => toast.error("Upload failed: " + e.message),
  });
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ adminToken, fileName: file.name, fileBase64: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-2">
      <label className="text-emerald-300 text-xs font-medium block">Product Image</label>
      <div className="flex gap-2 items-start">
        <div className="w-16 h-16 rounded-lg bg-white/5 border border-emerald-700/30 flex items-center justify-center shrink-0 overflow-hidden">
          {value ? (
            <img src={value} alt="Product" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-600" />
          )}
        </div>
        <div className="flex-1 space-y-1.5">
          <Button
            type="button" size="sm" variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="border-emerald-700/40 text-emerald-300 hover:text-white hover:bg-emerald-800/40 text-xs w-full"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
          </Button>
          <Input
            value={value} onChange={e => onChange(e.target.value)}
            placeholder="Or paste image URL"
            className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500 text-xs h-7"
          />
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

interface Props {
  adminToken: string;
}

type Product = {
  id: number;
  name: string;
  description: string;
  shortDescription: string | null;
  imageUrl: string | null;
  category: string | null;
  isAffiliate: number;
  defaultAffiliateUrl: string | null;
  isPublished: number;
  sortOrder: number;
};

function ProductRow({
  product,
  adminToken,
  onRefresh,
}: {
  product: Product;
  adminToken: string;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [shortDescription, setShortDescription] = useState(product.shortDescription || "");
  const [category, setCategory] = useState(product.category || "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [isAffiliate, setIsAffiliate] = useState(product.isAffiliate === 1);
  const [defaultAffiliateUrl, setDefaultAffiliateUrl] = useState(product.defaultAffiliateUrl || "");
  const [isPublished, setIsPublished] = useState(product.isPublished === 1);

  const updateMutation = trpc.recommendedProducts.adminUpdate.useMutation({
    onSuccess: () => { toast.success("Product updated."); setEditing(false); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.recommendedProducts.adminDelete.useMutation({
    onSuccess: () => { toast.success("Product deleted."); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const togglePublish = () => {
    updateMutation.mutate({ adminToken, id: product.id, isPublished: !isPublished });
    setIsPublished(!isPublished);
  };

  const handleSave = () => {
    updateMutation.mutate({
      adminToken,
      id: product.id,
      name,
      description,
      shortDescription: shortDescription || undefined,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      isAffiliate,
      defaultAffiliateUrl: defaultAffiliateUrl || undefined,
      isPublished,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ adminToken, id: product.id });
  };

  if (editing) {
    return (
      <div className="bg-white/5 border border-emerald-700/40 rounded-xl p-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Product Name *</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/10 border-emerald-700/30 text-white" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Category</label>
            <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Supplements" className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500" />
          </div>
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-medium block mb-1">Short Description (shown on card)</label>
          <Input value={shortDescription} onChange={e => setShortDescription(e.target.value)} className="bg-white/10 border-emerald-700/30 text-white" />
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-medium block mb-1">Full Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="bg-white/10 border-emerald-700/30 text-white" />
        </div>
        <ImageUploadField adminToken={adminToken} value={imageUrl} onChange={setImageUrl} />

        {/* Affiliate toggle */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setIsAffiliate(!isAffiliate)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isAffiliate ? "bg-emerald-500" : "bg-gray-600"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isAffiliate ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-white text-sm">Third-party affiliate product (Brand Partners can add their own link)</span>
        </div>

        {isAffiliate && (
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Your (Peter's) Default Affiliate Link</label>
            <Input
              value={defaultAffiliateUrl}
              onChange={e => setDefaultAffiliateUrl(e.target.value)}
              placeholder="https://..."
              className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500"
            />
            <p className="text-gray-500 text-xs mt-1">Used when a visitor has no Brand Partner cookie, or when a Brand Partner hasn't set their own link.</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Check className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="border-gray-600 text-gray-300 hover:text-white">
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-emerald-800/20 rounded-xl p-4 flex items-start gap-4">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-white/5 border border-emerald-800/20 flex items-center justify-center shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <ShoppingBag className="w-5 h-5 text-gray-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-medium">{product.name}</span>
          {product.category && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300">{product.category}</span>
          )}
          {product.isAffiliate === 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300 flex items-center gap-1">
              <Link2 className="w-3 h-3" /> Affiliate
            </span>
          )}
          {product.isPublished === 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">Draft</span>
          )}
        </div>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.shortDescription || product.description}</p>
        {product.isAffiliate === 1 && product.defaultAffiliateUrl && (
          <a href={product.defaultAffiliateUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 text-xs flex items-center gap-1 mt-1 hover:underline">
            <ExternalLink className="w-3 h-3" /> Default link
          </a>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={togglePublish}
          title={isPublished ? "Unpublish" : "Publish"}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            isPublished
              ? "bg-emerald-900/40 text-emerald-300 hover:bg-red-900/40 hover:text-red-300"
              : "bg-gray-700 text-gray-300 hover:bg-emerald-900/40 hover:text-emerald-300"
          }`}
        >
          {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isPublished ? "Live" : "Publish"}
        </button>
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-emerald-400 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={handleDelete} disabled={deleteMutation.isPending} className="text-gray-400 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function PEMFAdminProducts({ adminToken }: Props) {
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [defaultAffiliateUrl, setDefaultAffiliateUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const { data: products, isLoading, refetch } = trpc.recommendedProducts.adminList.useQuery(
    { adminToken },
    { enabled: !!adminToken }
  );

  const createMutation = trpc.recommendedProducts.adminCreate.useMutation({
    onSuccess: () => {
      toast.success("Product added.");
      setShowAdd(false);
      setName(""); setDescription(""); setShortDescription(""); setCategory("");
      setImageUrl(""); setIsAffiliate(false); setDefaultAffiliateUrl(""); setIsPublished(true);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Name and description are required.");
      return;
    }
    createMutation.mutate({
      adminToken,
      name: name.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim() || undefined,
      category: category.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isAffiliate,
      defaultAffiliateUrl: defaultAffiliateUrl.trim() || undefined,
      isPublished,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-semibold">Recommended Products</h2>
          {products && <span className="text-gray-500 text-sm">({products.length})</span>}
        </div>
        <Button
          size="sm"
          onClick={() => setShowAdd(!showAdd)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      <p className="text-gray-400 text-sm">
        Products added here appear on the main site's <strong className="text-white">Recommended Products</strong> section.
        Toggle <strong className="text-blue-300">Affiliate</strong> on any product to let Brand Partners enter their own affiliate link in their portal.
      </p>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white/5 border border-emerald-700/40 rounded-xl p-5 space-y-3">
          <h3 className="text-emerald-300 font-medium text-sm">New Product</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Product Name *</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. MasterPeace Zeolite" className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Category</label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Supplements" className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500" />
            </div>
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Short Description (shown on card)</label>
            <Input value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="One-line summary" className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Full Description *</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detailed description of the product and its benefits" className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500" />
          </div>
          <ImageUploadField adminToken={adminToken} value={imageUrl} onChange={setImageUrl} />
          {/* Affiliate toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsAffiliate(!isAffiliate)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isAffiliate ? "bg-emerald-500" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isAffiliate ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-white text-sm">Third-party affiliate product (Brand Partners can add their own link)</span>
          </div>

          {isAffiliate && (
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Your (Peter's) Default Affiliate Link</label>
              <Input
                value={defaultAffiliateUrl}
                onChange={e => setDefaultAffiliateUrl(e.target.value)}
                placeholder="https://..."
                className="bg-white/10 border-emerald-700/30 text-white placeholder-gray-500"
              />
              <p className="text-gray-500 text-xs mt-1">Used when no Brand Partner cookie is present, or when a Brand Partner hasn't set their own link.</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`relative w-10 h-5 rounded-full transition-colors ${isPublished ? "bg-emerald-500" : "bg-gray-600"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isPublished ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-white text-sm">Published (visible on main site)</span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {createMutation.isPending ? "Saving..." : "Save Product"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)} className="border-gray-600 text-gray-300 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Product List */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading products...</div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products yet. Click "Add Product" to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <ProductRow
              key={p.id}
              product={p}
              adminToken={adminToken}
              onRefresh={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}

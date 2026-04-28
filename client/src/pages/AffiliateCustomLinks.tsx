import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link2, Plus, Trash2, Tag, ChevronDown, ChevronUp, Copy, Info } from "lucide-react";

interface Props {
  token: string;
}

const SYSTEM_TAGS = [
  { tag: "{{first_name}}", desc: "Prospect's first name" },
  { tag: "{{full_name}}", desc: "Prospect's full name" },
  { tag: "{{affiliate_name}}", desc: "Your name" },
  { tag: "{{affiliate_phone}}", desc: "Your phone number" },
  { tag: "{{affiliate_email}}", desc: "Your email address" },
  { tag: "{{pemf_link}}", desc: "Your PEMF page URL" },
  { tag: "{{redox_link}}", desc: "Your Redox Signalling page URL" },
  { tag: "{{olylife_link}}", desc: "Your OlyLife page URL" },
  { tag: "{{unsubscribe_link}}", desc: "Auto-generated unsubscribe link" },
];

export default function AffiliateCustomLinks({ token }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<"text" | "link">("link");

  const { data: customLinks = [], refetch } = trpc.mergeTags.getMyCustomLinks.useQuery(
    { token },
    { enabled: !!token && expanded }
  );

  const addLink = trpc.mergeTags.upsertCustomLink.useMutation({
    onSuccess: () => {
      toast.success("Custom tag added!");
      setNewLabel(""); setNewTag(""); setNewValue("");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteLink = trpc.mergeTags.deleteCustomLink.useMutation({
    onSuccess: () => { toast.success("Tag removed."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast.success("Copied " + tag);
  };

  const handleLabelChange = (val: string) => {
    setNewLabel(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    setNewTag(slug);
  };

  return (
    <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-400" />
          <h2 className="text-white font-semibold">My Email Tags &amp; Links</h2>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* System Tags Reference */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-400/70" />
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider">Built-in System Tags</p>
            </div>
            <p className="text-gray-500 text-xs mb-3">These tags are always available in your email templates. Click to copy.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {SYSTEM_TAGS.map(({ tag, desc }) => (
                <button
                  key={tag}
                  onClick={() => copyTag(tag)}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-emerald-800/20 rounded-lg px-3 py-2 text-left transition-all group"
                >
                  <div>
                    <code className="text-emerald-400 text-xs font-mono">{tag}</code>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                  <Copy className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Links */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-emerald-400/70" />
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider">My Custom Tags</p>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              Add your own tags — booking links, Facebook group URLs, personal notes, etc. Use them in email templates with the tag name shown.
            </p>

            {(customLinks as any[]).length > 0 && (
              <div className="space-y-2 mb-4">
                {(customLinks as any[]).map((link: any) => (
                  <div key={link.id} className="flex items-center gap-3 bg-white/5 border border-emerald-800/20 rounded-lg px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-emerald-400 text-xs font-mono">{"{{" + link.tagKey + "}}"}</code>
                        <span className="text-gray-500 text-xs">-</span>
                        <span className="text-gray-300 text-xs truncate">{link.label}</span>
                      </div>
                      <p className="text-gray-600 text-xs truncate mt-0.5">{link.value}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => copyTag("{{" + link.tagKey + "}}")} className="text-gray-500 hover:text-gray-300 transition-colors p-1" title="Copy tag">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteLink.mutate({ token, id: link.id })} className="text-gray-600 hover:text-red-400 transition-colors p-1" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 border border-emerald-800/20 rounded-xl p-4 space-y-3">
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider">Add New Tag</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Label (e.g. "My Booking Link")</label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    placeholder="My Booking Link"
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Tag name (auto-generated)</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="my_booking_link"
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-emerald-400 font-mono text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Value (URL or text)</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="https://calendly.com/yourname or any text"
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-xs">Type:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "text" | "link")}
                    className="bg-white/10 border border-emerald-700/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                  >
                    <option value="link">Link (clickable URL)</option>
                    <option value="text">Text (plain value)</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!newLabel || !newTag || !newValue) { toast.error("Please fill in all fields."); return; }
                    addLink.mutate({ token, label: newLabel, tagKey: newTag, value: newValue, category: newType });
                  }}
                  disabled={addLink.isPending}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50 ml-auto"
                >
                  <Plus className="w-4 h-4" /> Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

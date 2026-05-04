import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import HelpTip from "@/components/HelpTip";

interface Props { token: string; }

type Template = {
  id: number;
  name: string;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

const emptyForm = () => ({ name: "", subject: "", body: "" });

export default function EmailTemplates({ token }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [editForm, setEditForm] = useState(emptyForm());

  const utils = trpc.useUtils();

  const { data: templates = [], isLoading } = trpc.emailTemplates.list.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const createMutation = trpc.emailTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Template created!");
      utils.emailTemplates.list.invalidate();
      setForm(emptyForm());
      setShowCreate(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.emailTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Template saved!");
      utils.emailTemplates.list.invalidate();
      setEditingId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted.");
      utils.emailTemplates.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const startEdit = (t: Template) => {
    setEditingId(t.id);
    setEditForm({ name: t.name, subject: t.subject, body: t.body });
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">Email Templates <HelpTip text="Create reusable email templates with personalised tags. Save time by writing your message once and reusing it whenever you send emails to contacts." /></h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Create reusable email templates with personalised tags. Use them when sending emails to your contacts.
          </p>
        </div>
        <span className="inline-flex items-center gap-1">
          <Button
            onClick={() => { setShowCreate(!showCreate); setForm(emptyForm()); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
          >
            <Plus size={15} /> New Template
          </Button>
          <HelpTip text="Create a new email template. Give it a name, subject line, and body. Use the Insert button to add personalised tags like the recipient's name or your referral links." />
        </span>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" /> New Email Template
          </h3>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Template Name</label>
            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Introduction Email"
              className="bg-white/10 border-emerald-700/30 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Subject Line</label>
            <Input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. A gift for you — read this free health book"
              className="bg-white/10 border-emerald-700/30 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Email Body</label>
            <RichTextEditor
              value={form.body}
              onChange={v => setForm(f => ({ ...f, body: v }))}
              token={token}
              placeholder="Write your email here. Use the Insert button to add personalised tags and video links."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate({ token, ...form })}
              disabled={!form.name || !form.subject || !form.body || createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {createMutation.isPending ? "Saving…" : "Save Template"}
            </Button>
          </div>
        </div>
      )}

      {/* Templates list */}
      {isLoading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading templates…</div>
      ) : templates.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-emerald-700/30 rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 text-emerald-700/50 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No templates yet. Create your first one above.</p>
          <p className="text-gray-500 text-xs mt-1">
            Tip: Use tags like <code className="text-emerald-400">{"{{first_name}}"}</code>, <code className="text-emerald-400">{"{{book_link}}"}</code> to personalise each email automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-white/5 border border-emerald-700/20 rounded-xl overflow-hidden">
              {editingId === t.id ? (
                /* Edit mode */
                <div className="p-5 space-y-4">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Pencil size={14} className="text-emerald-400" /> Edit Template
                  </h3>
                  <div>
                    <label className="text-emerald-300 text-xs font-medium block mb-1">Template Name</label>
                    <Input
                      value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-white/10 border-emerald-700/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-300 text-xs font-medium block mb-1">Subject Line</label>
                    <Input
                      value={editForm.subject}
                      onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                      className="bg-white/10 border-emerald-700/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-emerald-300 text-xs font-medium block mb-1">Email Body</label>
                    <RichTextEditor
                      value={editForm.body}
                      onChange={v => setEditForm(f => ({ ...f, body: v }))}
                      token={token}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white">
                      <X size={14} className="mr-1" /> Cancel
                    </Button>
                    <Button
                      onClick={() => updateMutation.mutate({ token, id: t.id, ...editForm })}
                      disabled={!editForm.name || !editForm.subject || !editForm.body || updateMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Check size={14} className="mr-1" />
                      {updateMutation.isPending ? "Saving…" : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-800/60 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">Subject: {t.subject}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-300 hover:bg-white/10 rounded transition-colors"
                        title="Preview"
                      >
                        {expandedId === t.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteMutation.mutate({ token, id: t.id }); }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {expandedId === t.id && (
                    <div className="border-t border-white/10 px-4 py-3">
                      <p className="text-gray-500 text-xs mb-2">Preview (tags shown as-is — they'll be replaced when sent)</p>
                      <div
                        className="text-sm text-gray-300 prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: t.body }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

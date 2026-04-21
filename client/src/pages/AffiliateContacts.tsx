import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { UserPlus, Upload, FileText, Smartphone, ChevronDown, ChevronUp, Trash2, Pencil, Check, X, Info } from "lucide-react";
import { toast } from "sonner";

interface Props {
  token: string;
}

type ImportMode = "manual" | "csv" | "vcf" | null;
type TutorialKey = "csv_gmail" | "csv_outlook" | "csv_apple" | "vcf_iphone" | "vcf_android" | null;

const TUTORIALS: Record<NonNullable<TutorialKey>, { title: string; steps: string[] }> = {
  csv_gmail: {
    title: "Export contacts from Gmail",
    steps: [
      "Go to contacts.google.com on your computer",
      "Click the Export button in the left sidebar",
      "Select 'All contacts' or a specific label",
      "Choose 'Google CSV' format",
      "Click Export and save the file",
      "Upload the saved .csv file here",
    ],
  },
  csv_outlook: {
    title: "Export contacts from Outlook",
    steps: [
      "Open Outlook on your computer",
      "Click File → Open & Export → Import/Export",
      "Choose 'Export to a file' → Next",
      "Select 'Comma Separated Values' → Next",
      "Choose 'Contacts' folder → Next",
      "Save the file and upload it here",
    ],
  },
  csv_apple: {
    title: "Export contacts from Apple Contacts (Mac)",
    steps: [
      "Open the Contacts app on your Mac",
      "Select all contacts (Cmd + A)",
      "Click File → Export → Export vCard",
      "Or: File → Export → Export as CSV (if available)",
      "Save the file and upload it here",
      "Note: Apple exports .vcf by default — use the vCard import below",
    ],
  },
  vcf_iphone: {
    title: "Export contacts from iPhone",
    steps: [
      "Open the Contacts app on your iPhone",
      "Tap a contact, then tap 'Share Contact'",
      "For ALL contacts: Go to iCloud.com on your computer",
      "Sign in → click Contacts",
      "Select all (Cmd+A on Mac) → click the gear icon",
      "Choose 'Export vCard' → upload the .vcf file here",
    ],
  },
  vcf_android: {
    title: "Export contacts from Android",
    steps: [
      "Open the Contacts app on your Android phone",
      "Tap the three-dot menu (⋮) in the top right",
      "Select 'Import/Export' or 'Manage contacts'",
      "Tap 'Export' → choose 'Export to .vcf file'",
      "Save to your phone storage or Google Drive",
      "Transfer the .vcf file to your computer and upload it here",
    ],
  },
};

export default function AffiliateContacts({ token }: Props) {
  const [importMode, setImportMode] = useState<ImportMode>(null);
  const [openTutorial, setOpenTutorial] = useState<TutorialKey>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Manual form state
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [manualSequenceId, setManualSequenceId] = useState<number | "">("");

  // Import state
  const [importSequenceId, setImportSequenceId] = useState<number | "">("");
  const csvRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const utils = trpc.useUtils();

  const { data: contacts = [], isLoading } = trpc.affiliateContacts.list.useQuery({ token });
  const { data: sequences = [] } = trpc.affiliateContacts.getSequences.useQuery({ token });

  const addMutation = trpc.affiliateContacts.add.useMutation({
    onSuccess: () => {
      toast.success("Contact added");
      setManualName(""); setManualEmail(""); setManualPhone(""); setManualNotes(""); setManualSequenceId("");
      setImportMode(null);
      utils.affiliateContacts.list.invalidate({ token });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.affiliateContacts.update.useMutation({
    onSuccess: () => {
      toast.success("Contact updated");
      setEditingId(null);
      utils.affiliateContacts.list.invalidate({ token });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.affiliateContacts.delete.useMutation({
    onSuccess: () => {
      toast.success("Contact deleted");
      utils.affiliateContacts.list.invalidate({ token });
    },
    onError: (e) => toast.error(e.message),
  });

  const csvMutation = trpc.affiliateContacts.importCsv.useMutation({
    onSuccess: (r) => {
      toast.success(`Imported ${r.imported} contacts from CSV`);
      setImportMode(null); setImportSequenceId("");
      utils.affiliateContacts.list.invalidate({ token });
    },
    onError: (e) => toast.error(e.message),
  });

  const vcfMutation = trpc.affiliateContacts.importVcf.useMutation({
    onSuccess: (r) => {
      toast.success(`Imported ${r.imported} contacts from vCard`);
      setImportMode(null); setImportSequenceId("");
      utils.affiliateContacts.list.invalidate({ token });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    addMutation.mutate({
      token, name: manualName.trim(), email: manualEmail || undefined,
      phone: manualPhone || undefined, notes: manualNotes || undefined,
      enrollSequenceId: manualSequenceId ? Number(manualSequenceId) : undefined,
    });
  };

  const handleFileImport = async (file: File, type: "csv" | "vcf") => {
    const text = await file.text();
    if (type === "csv") {
      csvMutation.mutate({ token, csvText: text, enrollSequenceId: importSequenceId ? Number(importSequenceId) : undefined });
    } else {
      vcfMutation.mutate({ token, vcfText: text, enrollSequenceId: importSequenceId ? Number(importSequenceId) : undefined });
    }
  };

  const startEdit = (c: typeof contacts[0]) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditEmail(c.email || "");
    setEditPhone(c.phone || "");
    setEditNotes(c.notes || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({ token, id: editingId, name: editName, email: editEmail, phone: editPhone, notes: editNotes });
  };

  const TutorialBox = ({ tutKey }: { tutKey: NonNullable<TutorialKey> }) => {
    const t = TUTORIALS[tutKey];
    const isOpen = openTutorial === tutKey;
    return (
      <div className="border border-emerald-700/30 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenTutorial(isOpen ? null : tutKey)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-white/10 text-emerald-300 text-sm font-medium transition-colors"
        >
          <span className="flex items-center gap-2"><Info size={14} />{t.title}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {isOpen && (
          <ol className="px-4 py-3 space-y-1 bg-white/5">
            {t.steps.map((step, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2">
                <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  };

  const SequenceSelect = ({ value, onChange, label }: { value: number | ""; onChange: (v: number | "") => void; label: string }) => (
    <div>
      <label className="text-emerald-300 text-xs font-medium block mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : "")}
        className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="">— No campaign —</option>
        {sequences.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );

  const sourceLabel = (src: string) => {
    const map: Record<string, string> = { manual: "Manual", csv: "CSV", vcf: "vCard", enquiry: "Enquiry" };
    return map[src] || src;
  };

  const sourceBadgeColor = (src: string) => {
    const map: Record<string, string> = {
      manual: "bg-blue-500/20 text-blue-300",
      csv: "bg-purple-500/20 text-purple-300",
      vcf: "bg-orange-500/20 text-orange-300",
      enquiry: "bg-emerald-500/20 text-emerald-300",
    };
    return map[src] || "bg-gray-500/20 text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-semibold">My Contacts</h2>
          <p className="text-gray-400 text-sm mt-0.5">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setImportMode(importMode === "manual" ? null : "manual")}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={15} /> Add Contact
          </button>
          <button
            onClick={() => setImportMode(importMode === "csv" ? null : "csv")}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FileText size={15} /> CSV Import
          </button>
          <button
            onClick={() => setImportMode(importMode === "vcf" ? null : "vcf")}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Smartphone size={15} /> Phone Import
          </button>
        </div>
      </div>

      {/* Manual Add Form */}
      {importMode === "manual" && (
        <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><UserPlus size={16} /> Add Contact Manually</h3>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Full Name *</label>
              <input value={manualName} onChange={e => setManualName(e.target.value)} required placeholder="Jane Smith"
                className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Email</label>
              <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)} placeholder="jane@example.com"
                className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Phone</label>
              <input value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="+1 555 000 0000"
                className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <SequenceSelect value={manualSequenceId} onChange={setManualSequenceId} label="Add to Campaign (optional)" />
            <div className="md:col-span-2">
              <label className="text-emerald-300 text-xs font-medium block mb-1">Notes</label>
              <textarea value={manualNotes} onChange={e => setManualNotes(e.target.value)} rows={2} placeholder="Any notes about this contact..."
                className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setImportMode(null)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={addMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CSV Import */}
      {importMode === "csv" && (
        <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><FileText size={16} /> Import from CSV</h3>
          <p className="text-gray-400 text-sm">Upload a CSV file exported from Gmail, Outlook, or any email/contact app. We'll automatically detect the name, email, and phone columns.</p>

          <div className="space-y-2">
            <p className="text-emerald-300 text-xs font-medium uppercase tracking-wide">How to export your contacts:</p>
            <TutorialBox tutKey="csv_gmail" />
            <TutorialBox tutKey="csv_outlook" />
            <TutorialBox tutKey="csv_apple" />
          </div>

          <SequenceSelect value={importSequenceId} onChange={setImportSequenceId} label="Add all imported contacts to campaign (optional)" />

          <div
            onClick={() => csvRef.current?.click()}
            className="border-2 border-dashed border-emerald-700/40 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-white/5 transition-colors"
          >
            <Upload size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-white font-medium">Click to upload CSV file</p>
            <p className="text-gray-400 text-sm mt-1">Supports .csv files from Gmail, Outlook, Apple Contacts</p>
            <input ref={csvRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f, "csv"); e.target.value = ""; }} />
          </div>
          {csvMutation.isPending && <p className="text-emerald-400 text-sm text-center">Importing contacts...</p>}
          <button onClick={() => setImportMode(null)} className="text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
        </div>
      )}

      {/* vCard Import */}
      {importMode === "vcf" && (
        <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Smartphone size={16} /> Import from Phone (vCard)</h3>
          <p className="text-gray-400 text-sm">Export your phone contacts as a .vcf (vCard) file and upload it here. Works with iPhone and Android.</p>

          <div className="space-y-2">
            <p className="text-emerald-300 text-xs font-medium uppercase tracking-wide">How to export from your phone:</p>
            <TutorialBox tutKey="vcf_iphone" />
            <TutorialBox tutKey="vcf_android" />
          </div>

          <SequenceSelect value={importSequenceId} onChange={setImportSequenceId} label="Add all imported contacts to campaign (optional)" />

          <div
            onClick={() => vcfRef.current?.click()}
            className="border-2 border-dashed border-emerald-700/40 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-white/5 transition-colors"
          >
            <Smartphone size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-white font-medium">Click to upload vCard file</p>
            <p className="text-gray-400 text-sm mt-1">Supports .vcf files from iPhone, Android, iCloud</p>
            <input ref={vcfRef} type="file" accept=".vcf,.vcard,text/vcard,text/x-vcard" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f, "vcf"); e.target.value = ""; }} />
          </div>
          {vcfMutation.isPending && <p className="text-emerald-400 text-sm text-center">Importing contacts...</p>}
          <button onClick={() => setImportMode(null)} className="text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
        </div>
      )}

      {/* Contacts Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-emerald-700/30 rounded-xl">
          <UserPlus size={32} className="mx-auto text-emerald-600 mb-3" />
          <p className="text-white font-medium">No contacts yet</p>
          <p className="text-gray-400 text-sm mt-1">Add contacts manually or import from your email or phone</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wide">
                <th className="text-left py-2 pr-4">Name</th>
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2 pr-4">Phone</th>
                <th className="text-left py-2 pr-4">Source</th>
                <th className="text-left py-2 pr-4">Campaign</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  {editingId === c.id ? (
                    <>
                      <td className="py-2 pr-4"><input value={editName} onChange={e => setEditName(e.target.value)}
                        className="bg-white/10 border border-emerald-700/30 rounded px-2 py-1 text-white text-sm w-full" /></td>
                      <td className="py-2 pr-4"><input value={editEmail} onChange={e => setEditEmail(e.target.value)}
                        className="bg-white/10 border border-emerald-700/30 rounded px-2 py-1 text-white text-sm w-full" /></td>
                      <td className="py-2 pr-4"><input value={editPhone} onChange={e => setEditPhone(e.target.value)}
                        className="bg-white/10 border border-emerald-700/30 rounded px-2 py-1 text-white text-sm w-full" /></td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadgeColor(c.source)}`}>{sourceLabel(c.source)}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-400 text-xs">{c.enrolledSequenceId ? sequences.find(s => s.id === c.enrolledSequenceId)?.name || "—" : "—"}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button onClick={saveEdit} disabled={updateMutation.isPending}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"><X size={14} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 pr-4">
                        <div className="text-white font-medium">{c.name}</div>
                        {c.notes && <div className="text-gray-500 text-xs mt-0.5 truncate max-w-[180px]">{c.notes}</div>}
                      </td>
                      <td className="py-2 pr-4 text-gray-300">{c.email || <span className="text-gray-600">—</span>}</td>
                      <td className="py-2 pr-4 text-gray-300">{c.phone || <span className="text-gray-600">—</span>}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadgeColor(c.source)}`}>{sourceLabel(c.source)}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-400 text-xs">{c.enrolledSequenceId ? sequences.find(s => s.id === c.enrolledSequenceId)?.name || "—" : "—"}</td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm("Delete this contact?")) deleteMutation.mutate({ token, id: c.id }); }}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

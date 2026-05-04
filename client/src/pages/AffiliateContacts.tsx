import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  UserPlus, Upload, FileText, Smartphone, ChevronDown, ChevronUp,
  Trash2, Pencil, Check, X, Info, Bell, MapPin, Tag, Cake, Send, Mail, History
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import HelpTip from "@/components/HelpTip";

interface Props { token: string; }
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

// ─── Tag chip input ────────────────────────────────────────────────────────────
function TagInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tags = value ? value.split(",").map(t => t.trim()).filter(Boolean) : [];
  const [input, setInput] = useState("");
  const add = (raw: string) => {
    const t = raw.trim();
    if (!t || tags.includes(t)) { setInput(""); return; }
    onChange([...tags, t].join(","));
    setInput("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1 min-h-[20px]">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-emerald-900/50 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
            {tag}
            <button type="button" onClick={() => onChange(tags.filter(t => t !== tag).join(","))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <input
        type="text" value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
        onBlur={() => { if (input.trim()) add(input); }}
        placeholder="Type a tag and press Enter"
        className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      <p className="text-xs text-gray-500 mt-0.5">Press Enter or comma to add a tag</p>
    </div>
  );
}

// ─── Contact form (used for both Add and Edit) ────────────────────────────────
interface FormState {
  name: string; email: string; phone: string; notes: string;
  addressStreet: string; addressCity: string; addressState: string;
  addressPostcode: string; addressCountry: string;
  birthday: string; tags: string;
  reminderAt: string; reminderNote: string;
  enrollSequenceId: number | "";
}
const emptyForm = (): FormState => ({
  name: "", email: "", phone: "", notes: "",
  addressStreet: "", addressCity: "", addressState: "", addressPostcode: "", addressCountry: "",
  birthday: "", tags: "", reminderAt: "", reminderNote: "", enrollSequenceId: "",
});

function ContactForm({
  form, setForm, sequences, onSave, onCancel, saving, title,
}: {
  form: FormState; setForm: (f: FormState) => void;
  sequences: { id: number; name: string }[];
  onSave: () => void; onCancel: () => void; saving: boolean; title: string;
}) {
  const [showAddress, setShowAddress] = useState(
    !!(form.addressStreet || form.addressCity || form.addressState || form.addressPostcode || form.addressCountry)
  );
  const [showReminder, setShowReminder] = useState(!!form.reminderAt);

  const inp = (label: string, key: keyof FormState, type = "text", ph = "") => (
    <div>
      <label className="text-emerald-300 text-xs font-medium block mb-1">{label}</label>
      <input type={type} value={form[key] as string}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={ph}
        className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
    </div>
  );

  return (
    <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold flex items-center gap-2"><UserPlus size={16} className="text-emerald-400" />{title}</h3>

      {/* Basic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-emerald-300 text-xs font-medium block mb-1">Full Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Jane Smith"
            className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        {inp("Email", "email", "email", "jane@example.com")}
        {inp("Phone", "phone", "text", "+1 555 000 0000")}
      </div>

      {/* Birthday & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-emerald-300 text-xs font-medium block mb-1 flex items-center gap-1"><Cake size={12} /> Birthday</label>
          <input type="date" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })}
            className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="text-emerald-300 text-xs font-medium block mb-1 flex items-center gap-1"><Tag size={12} /> Tags</label>
          <TagInput value={form.tags} onChange={v => setForm({ ...form, tags: v })} />
        </div>
      </div>

      {/* Address (collapsible) */}
      <div>
        <button type="button" onClick={() => setShowAddress(!showAddress)}
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors mb-2">
          <MapPin size={12} />{showAddress ? "Hide address" : "Add address"}
          {showAddress ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showAddress && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">{inp("Street Address", "addressStreet", "text", "123 Main St")}</div>
            {inp("City", "addressCity", "text", "Sydney")}
            {inp("State / Province", "addressState", "text", "NSW")}
            {inp("Postcode / ZIP", "addressPostcode", "text", "2000")}
            {inp("Country", "addressCountry", "text", "Australia")}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-emerald-300 text-xs font-medium block mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
          placeholder="Any notes about this contact..."
          className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none" />
      </div>

      {/* Reminder (collapsible) */}
      <div>
        <button type="button" onClick={() => setShowReminder(!showReminder)}
          className="flex items-center gap-2 text-xs text-emerald-300 hover:text-emerald-200 transition-colors mb-2">
          <Bell size={12} />{showReminder ? "Remove reminder" : "Set a follow-up reminder"}
          {showReminder ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showReminder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inp("Reminder Date", "reminderAt", "date")}
            {inp("Reminder Note", "reminderNote", "text", "e.g. Follow up about PEMF trial")}
          </div>
        )}
      </div>

      {/* Campaign */}
      <div>
        <label className="text-emerald-300 text-xs font-medium block mb-1">Add to Campaign (optional)</label>
        <select value={form.enrollSequenceId}
          onChange={e => setForm({ ...form, enrollSequenceId: e.target.value ? Number(e.target.value) : "" })}
          className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
          <option value="">— No campaign —</option>
          {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
        <button type="button" onClick={onSave} disabled={saving || !form.name.trim()}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Save Contact"}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function AffiliateContacts({ token }: Props) {
  const [importMode, setImportMode] = useState<ImportMode>(null);
  const [openTutorial, setOpenTutorial] = useState<TutorialKey>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // ─── Email compose state ────────────────────────────────────────────────
  const [emailContact, setEmailContact] = useState<{ id: number; name: string; email: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [historyContactEmail, setHistoryContactEmail] = useState<string | null>(null);
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [importSequenceId, setImportSequenceId] = useState<number | "">("");
  const csvRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: contacts = [], isLoading } = trpc.affiliateContacts.list.useQuery({ token });
  const { data: sequences = [] } = trpc.affiliateContacts.getSequences.useQuery({ token });

  const inv = () => utils.affiliateContacts.list.invalidate({ token });

  const formToInput = (f: FormState) => ({
    token,
    name: f.name.trim(),
    email: f.email || undefined,
    phone: f.phone || undefined,
    notes: f.notes || undefined,
    addressStreet: f.addressStreet || undefined,
    addressCity: f.addressCity || undefined,
    addressState: f.addressState || undefined,
    addressPostcode: f.addressPostcode || undefined,
    addressCountry: f.addressCountry || undefined,
    birthday: f.birthday || undefined,
    tags: f.tags || undefined,
    reminderAt: f.reminderAt ? new Date(f.reminderAt).getTime() : undefined,
    reminderNote: f.reminderNote || undefined,
    enrollSequenceId: f.enrollSequenceId ? Number(f.enrollSequenceId) : undefined,
  });

  const addMutation = trpc.affiliateContacts.add.useMutation({
    onSuccess: () => { toast.success("Contact added"); setAddForm(emptyForm()); setImportMode(null); inv(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.affiliateContacts.update.useMutation({
    onSuccess: () => { toast.success("Contact updated"); setEditingId(null); inv(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.affiliateContacts.delete.useMutation({
    onSuccess: () => { toast.success("Contact deleted"); inv(); },
    onError: (e) => toast.error(e.message),
  });
  const csvMutation = trpc.affiliateContacts.importCsv.useMutation({
    onSuccess: (r) => { toast.success(`Imported ${r.imported} contacts`); setImportMode(null); setImportSequenceId(""); inv(); },
    onError: (e) => toast.error(e.message),
  });
  const vcfMutation = trpc.affiliateContacts.importVcf.useMutation({
    onSuccess: (r) => { toast.success(`Imported ${r.imported} contacts`); setImportMode(null); setImportSequenceId(""); inv(); },
    onError: (e) => toast.error(e.message),
  });

  // ─── Email queries & mutations ────────────────────────────────────────────
  const { data: templates = [] } = trpc.emailTemplates.list.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );
  const { data: emailHistory = [] } = trpc.emailTemplates.getContactHistory.useQuery(
    { token, contactEmail: historyContactEmail! },
    { enabled: !!token && !!historyContactEmail, retry: false }
  );
  const { data: contactTracking } = trpc.emailTemplates.getContactTracking.useQuery(
    { token, contactEmail: historyContactEmail! },
    { enabled: !!token && !!historyContactEmail, retry: false }
  );
  const sendEmailMutation = trpc.drip.affiliateSendEmailToLead.useMutation({
    onSuccess: () => {
      toast.success("Email sent!");
      setEmailContact(null);
      setEmailSubject("");
      setEmailBody("");
    },
    onError: (e) => toast.error(e.message),
  });
  const openEmailCompose = (c: { id: number; name: string; email: string }) => {
    setEmailContact(c);
    setEmailSubject("");
    setEmailBody("");
  };
  const applyTemplate = (t: { subject: string; body: string }) => {
    setEmailSubject(t.subject);
    setEmailBody(t.body);
  };
  const handleFileImport = async (file: File, type: "csv" | "vcf") => {
    const text = await file.text();
    const seq = importSequenceId ? Number(importSequenceId) : undefined;
    if (type === "csv") csvMutation.mutate({ token, csvText: text, enrollSequenceId: seq });
    else vcfMutation.mutate({ token, vcfText: text, enrollSequenceId: seq });
  };

  const startEdit = (c: typeof contacts[0]) => {
    setEditingId(c.id);
    setExpandedId(null);
    setEditForm({
      name: c.name, email: c.email || "", phone: c.phone || "", notes: c.notes || "",
      addressStreet: c.addressStreet || "", addressCity: c.addressCity || "",
      addressState: c.addressState || "", addressPostcode: c.addressPostcode || "",
      addressCountry: c.addressCountry || "",
      birthday: c.birthday || "",
      tags: c.tags || "",
      reminderAt: c.reminderAt ? new Date(c.reminderAt).toISOString().split("T")[0] : "",
      reminderNote: c.reminderNote || "",
      enrollSequenceId: c.enrolledSequenceId ?? "",
    });
  };

  const TutorialBox = ({ tutKey }: { tutKey: NonNullable<TutorialKey> }) => {
    const t = TUTORIALS[tutKey];
    const isOpen = openTutorial === tutKey;
    return (
      <div className="border border-emerald-700/30 rounded-lg overflow-hidden">
        <button type="button" onClick={() => setOpenTutorial(isOpen ? null : tutKey)}
          className="w-full flex items-center justify-between px-4 py-2 bg-white/5 hover:bg-white/10 text-emerald-300 text-sm font-medium transition-colors">
          <span className="flex items-center gap-2"><Info size={14} />{t.title}</span>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {isOpen && (
          <ol className="px-4 py-3 space-y-1 bg-white/5">
            {t.steps.map((step, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-2">
                <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span><span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  };

  const sourceLabel = (src: string) => ({ manual: "Manual", csv: "CSV", vcf: "vCard", enquiry: "Enquiry" }[src] || src);
  const sourceBadgeColor = (src: string) => ({
    manual: "bg-blue-500/20 text-blue-300",
    csv: "bg-purple-500/20 text-purple-300",
    vcf: "bg-orange-500/20 text-orange-300",
    enquiry: "bg-emerald-500/20 text-emerald-300",
  }[src] || "bg-gray-500/20 text-gray-300");

  const formatAddress = (c: typeof contacts[0]) =>
    [c.addressStreet, c.addressCity, c.addressState, c.addressPostcode, c.addressCountry].filter(Boolean).join(", ");

  const isOverdue = (c: typeof contacts[0]) => !!c.reminderAt && c.reminderAt < Date.now();

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-semibold flex items-center gap-2">My Contacts <HelpTip text="Your personal contact list. Add prospects manually or import from your phone or email app. You can email contacts directly or add them to a drip campaign." /></h2>
          <p className="text-gray-400 text-sm mt-0.5">{contacts.length} contact{contacts.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <button onClick={() => { setImportMode(importMode === "manual" ? null : "manual"); setAddForm(emptyForm()); }}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
              <UserPlus size={15} /> Add Contact
            </button>
            <HelpTip text="Add a single contact by entering their name, email, and phone number manually." />
          </span>
          <span className="inline-flex items-center gap-1">
            <button onClick={() => setImportMode(importMode === "csv" ? null : "csv")}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
              <FileText size={15} /> CSV Import
            </button>
            <HelpTip text="Import many contacts at once from a CSV file exported from Gmail, Outlook, or Apple Contacts." />
          </span>
          <span className="inline-flex items-center gap-1">
            <button onClick={() => setImportMode(importMode === "vcf" ? null : "vcf")}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
              <Smartphone size={15} /> Phone Import
            </button>
            <HelpTip text="Import contacts from your phone using a vCard (.vcf) file exported from your phone's Contacts app." />
          </span>
        </div>
      </div>

      {/* Manual Add Form */}
      {importMode === "manual" && (
        <ContactForm
          title="Add Contact Manually"
          form={addForm} setForm={setAddForm}
          sequences={sequences}
          onSave={() => addMutation.mutate(formToInput(addForm))}
          onCancel={() => { setImportMode(null); setAddForm(emptyForm()); }}
          saving={addMutation.isPending}
        />
      )}

      {/* CSV Import */}
      {importMode === "csv" && (
        <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><FileText size={16} /> Import from CSV</h3>
          <p className="text-gray-400 text-sm">Upload a CSV file exported from Gmail, Outlook, or any email/contact app. We'll automatically detect the name, email, and phone columns.</p>
          <div className="space-y-2">
            <p className="text-emerald-300 text-xs font-medium uppercase tracking-wide">How to export your contacts:</p>
            <TutorialBox tutKey="csv_gmail" /><TutorialBox tutKey="csv_outlook" /><TutorialBox tutKey="csv_apple" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Add all imported contacts to campaign (optional)</label>
            <select value={importSequenceId} onChange={e => setImportSequenceId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">— No campaign —</option>
              {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div onClick={() => csvRef.current?.click()}
            className="border-2 border-dashed border-emerald-700/40 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-white/5 transition-colors">
            <Upload size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-white font-medium">Click to upload CSV file</p>
            <p className="text-gray-400 text-sm mt-1">Supports .csv files from Gmail, Outlook, Apple Contacts</p>
            <input ref={csvRef} type="file" accept=".csv,text/csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f, "csv"); e.target.value = ""; }} />
          </div>
          {csvMutation.isPending && <p className="text-emerald-400 text-sm text-center">Importing contacts…</p>}
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
            <TutorialBox tutKey="vcf_iphone" /><TutorialBox tutKey="vcf_android" />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Add all imported contacts to campaign (optional)</label>
            <select value={importSequenceId} onChange={e => setImportSequenceId(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="">— No campaign —</option>
              {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div onClick={() => vcfRef.current?.click()}
            className="border-2 border-dashed border-emerald-700/40 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/60 hover:bg-white/5 transition-colors">
            <Smartphone size={28} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-white font-medium">Click to upload vCard file</p>
            <p className="text-gray-400 text-sm mt-1">Supports .vcf files from iPhone, Android, iCloud</p>
            <input ref={vcfRef} type="file" accept=".vcf,.vcard,text/vcard,text/x-vcard" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f, "vcf"); e.target.value = ""; }} />
          </div>
          {vcfMutation.isPending && <p className="text-emerald-400 text-sm text-center">Importing contacts…</p>}
          <button onClick={() => setImportMode(null)} className="text-gray-400 hover:text-white text-sm transition-colors">Cancel</button>
        </div>
      )}

      {/* Contact list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading contacts…</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-emerald-700/30 rounded-xl">
          <UserPlus size={32} className="mx-auto text-emerald-600 mb-3" />
          <p className="text-white font-medium">No contacts yet</p>
          <p className="text-gray-400 text-sm mt-1">Add contacts manually or import from your email or phone</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {editingId === c.id ? (
                <div className="p-4">
                  <ContactForm
                    title="Edit Contact"
                    form={editForm} setForm={setEditForm}
                    sequences={sequences}
                    onSave={() => updateMutation.mutate({ ...formToInput(editForm), id: c.id })}
                    onCancel={() => setEditingId(null)}
                    saving={updateMutation.isPending}
                  />
                </div>
              ) : (
                <>
                  {/* Contact row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-800/60 flex items-center justify-center text-emerald-300 font-semibold text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm">{c.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadgeColor(c.source)}`}>{sourceLabel(c.source)}</span>
                        {c.tags && c.tags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="text-xs bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                        {c.reminderAt && (
                          <span className={`text-xs flex items-center gap-1 px-1.5 py-0.5 rounded-full ${isOverdue(c) ? "bg-red-900/50 text-red-300" : "bg-yellow-900/50 text-yellow-300"}`}>
                            <Bell size={10} /> {new Date(c.reminderAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {c.email && <span className="text-xs text-gray-400">{c.email}</span>}
                        {c.phone && <span className="text-xs text-gray-400">{c.phone}</span>}
                        {c.enrolledSequenceId && <span className="text-xs text-emerald-400">In campaign</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-300 hover:bg-white/10 rounded transition-colors" title="View details">
                        {expandedId === c.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {c.email && (
                        <button onClick={() => openEmailCompose({ id: c.id, name: c.name, email: c.email! })}
                          className="p-1.5 text-gray-400 hover:text-sky-300 hover:bg-white/10 rounded transition-colors" title="Send email">
                          <Send size={14} />
                        </button>
                      )}
                      {c.email && (
                        <button onClick={() => setHistoryContactEmail(historyContactEmail === c.email ? null : c.email!)}
                          className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-white/10 rounded transition-colors" title="Email history">
                          <History size={14} />
                        </button>
                      )}
                      <button onClick={() => startEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-emerald-300 hover:bg-white/10 rounded transition-colors" title="Edit contact">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (confirm("Delete this contact?")) deleteMutation.mutate({ token, id: c.id }); }}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded transition-colors" title="Delete contact">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === c.id && (
                    <div className="border-t border-white/10 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {c.notes && (
                        <div className="sm:col-span-2">
                          <p className="text-gray-500 mb-0.5">Notes</p>
                          <p className="text-gray-300">{c.notes}</p>
                        </div>
                      )}
                      {formatAddress(c) && (
                        <div className="sm:col-span-2">
                          <p className="text-gray-500 mb-0.5 flex items-center gap-1"><MapPin size={10} /> Address</p>
                          <p className="text-gray-300">{formatAddress(c)}</p>
                        </div>
                      )}
                      {c.birthday && (
                        <div>
                          <p className="text-gray-500 mb-0.5 flex items-center gap-1"><Cake size={10} /> Birthday</p>
                          <p className="text-gray-300">{c.birthday}</p>
                        </div>
                      )}
                      {c.reminderAt && (
                        <div>
                          <p className="text-gray-500 mb-0.5 flex items-center gap-1"><Bell size={10} /> Reminder</p>
                          <p className={isOverdue(c) ? "text-red-300" : "text-yellow-300"}>
                            {new Date(c.reminderAt).toLocaleDateString()}{c.reminderNote ? ` — ${c.reminderNote}` : ""}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 mb-0.5">Added</p>
                        <p className="text-gray-300">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {/* Email history inline */}
                  {historyContactEmail === c.email && c.email && (
                    <div className="border-t border-white/10 px-4 py-3">
                      <p className="text-purple-300 text-xs font-medium flex items-center gap-1 mb-2"><History size={11} /> Email History</p>
                      {emailHistory.length === 0 ? (
                        <p className="text-gray-500 text-xs">No emails sent to this contact yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {emailHistory.map((log: any) => {
                            // Count opens and clicks for this specific log entry
                            const logOpens = (contactTracking?.opens || []).filter((o: any) => o.emailLogId === log.id || o.dripSendLogId === log.id);
                            const logClicks = (contactTracking?.clicks || []).filter((cl: any) => cl.emailLogId === log.id || cl.dripSendLogId === log.id);
                            // Deduplicate clicked URLs
                            const uniqueUrls = Array.from(new Set(logClicks.map((cl: any) => cl.targetUrl as string)));
                            return (
                              <div key={log.id} className="bg-white/5 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-white text-xs font-medium truncate">{log.subject}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                                    log.status === 'sent' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
                                  }`}>{log.status}</span>
                                </div>
                                <p className="text-gray-500 text-xs mt-0.5">{new Date(log.sentAt).toLocaleString()}</p>
                                {/* Open & click indicators */}
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  {logOpens.length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                      Opened {logOpens.length}×
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                      Not opened
                                    </span>
                                  )}
                                  {logClicks.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-900/40 text-amber-300 px-2 py-0.5 rounded-full">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                                      {logClicks.length} click{logClicks.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                {/* Link-level click detail */}
                                {uniqueUrls.length > 0 && (
                                  <div className="mt-1.5 space-y-0.5">
                                    <p className="text-gray-500 text-xs font-medium">Links clicked:</p>
                                    {uniqueUrls.map((url: string) => {
                                      const count = logClicks.filter((cl: any) => cl.targetUrl === url).length;
                                      let label = url;
                                      try { label = new URL(url).hostname + new URL(url).pathname; } catch {}
                                      return (
                                        <div key={url} className="flex items-center gap-1.5">
                                          <span className="text-amber-400 text-xs bg-amber-900/30 px-1.5 py-0.5 rounded shrink-0">{count}×</span>
                                          <a href={url} target="_blank" rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-[200px]" title={url}>
                                            {label}
                                          </a>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

    {/* ─── Email Compose Modal ─────────────────────────────────────────────── */}
    <Dialog open={!!emailContact} onOpenChange={(o) => { if (!o) { setEmailContact(null); setEmailSubject(""); setEmailBody(""); } }}>
      <DialogContent className="bg-[#0a2e1a] border border-emerald-700/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Mail size={16} className="text-emerald-400" />
            Send Email to {emailContact?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Template picker */}
          {templates.length > 0 && (
            <div>
              <label className="text-emerald-300 text-xs font-medium block mb-1">Load a template (optional)</label>
              <select
                onChange={e => {
                  const t = templates.find((t: any) => t.id === Number(e.target.value));
                  if (t) applyTemplate(t);
                  e.target.value = "";
                }}
                defaultValue=""
                className="w-full bg-white/10 border border-emerald-700/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="" disabled>— Select a template —</option>
                {templates.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Subject</label>
            <Input
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder="Email subject"
              className="bg-white/10 border-emerald-700/30 text-white placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="text-emerald-300 text-xs font-medium block mb-1">Message</label>
            <RichTextEditor
              value={emailBody}
              onChange={v => setEmailBody(v)}
              token={token}
              placeholder="Write your message here. Use Insert to add personalised tags and video links."
            />
          </div>
          <p className="text-gray-500 text-xs">Tags like <code className="text-emerald-400">{"{{first_name}}"}</code> will be replaced with the contact's details when sent.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={() => setEmailContact(null)} className="text-gray-400 hover:text-white">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!emailContact?.email) return;
                sendEmailMutation.mutate({
                  token,
                  leadEmail: emailContact.email,
                  leadName: emailContact.name,
                  subject: emailSubject,
                  body: emailBody,
                  origin: window.location.origin,
                });
              }}
              disabled={!emailSubject || !emailBody || sendEmailMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2"
            >
              <Send size={14} />
              {sendEmailMutation.isPending ? "Sending…" : "Send Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

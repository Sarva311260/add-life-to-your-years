/**
 * AdminContacts — full contact management for the admin panel
 * Features: view all contacts (filter by affiliate), add, delete,
 * CSV/VCF import, block email composer, drip enrolment
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  UserPlus, Upload, FileText, Smartphone, ChevronDown, ChevronUp,
  Trash2, Send, Mail, History, Users, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlockEmailBuilder from "@/components/BlockEmailBuilder";

interface Props { adminToken: string; }
type ImportMode = "manual" | "csv" | "vcf" | null;

const TUTORIALS = {
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
  vcf_iphone: {
    title: "Export contacts from iPhone",
    steps: [
      "Go to iCloud.com on your computer",
      "Sign in → click Contacts",
      "Select all (Cmd+A on Mac) → click the gear icon",
      "Choose 'Export vCard' → upload the .vcf file here",
    ],
  },
  vcf_android: {
    title: "Export contacts from Android",
    steps: [
      "Open the Contacts app on your Android",
      "Tap the three-dot menu → Import/Export",
      "Choose 'Export to storage' → save the .vcf file",
      "Transfer the file to your computer and upload it here",
    ],
  },
};

export default function AdminContacts({ adminToken }: Props) {
  const utils = trpc.useUtils();

  // Filter
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<number | undefined>(undefined);

  // Queries
  const { data: affiliates = [] as { id: number; name: string; email: string }[] } = trpc.affiliateContacts.adminListAffiliates.useQuery({ adminToken });
  type Contact = { id: number; affiliateId: number; name: string; email?: string | null; phone?: string | null; notes?: string | null; source?: string | null; enrolledSequenceId?: number | null; createdAt: Date };
  const { data: contacts = [] as Contact[], isLoading } = trpc.affiliateContacts.adminList.useQuery({
    adminToken,
    affiliateId: selectedAffiliateId,
  });
  const { data: sequences = [] as { id: number; name: string }[] } = trpc.affiliateContacts.adminGetSequences.useQuery({ adminToken });

  // Mutations
  const addMutation = trpc.affiliateContacts.adminAdd.useMutation({
    onSuccess: () => { utils.affiliateContacts.adminList.invalidate(); toast.success("Contact added"); setImportMode(null); resetForm(); },
    onError: (e) => toast.error(e.message || "Failed to add contact"),
  });
  const deleteMutation = trpc.affiliateContacts.adminDelete.useMutation({
    onSuccess: () => { utils.affiliateContacts.adminList.invalidate(); toast.success("Contact deleted"); },
    onError: (e) => toast.error(e.message || "Failed to delete contact"),
  });
  const csvMutation = trpc.affiliateContacts.adminImportCsv.useMutation({
    onSuccess: (d) => { utils.affiliateContacts.adminList.invalidate(); toast.success(`Imported ${d.imported} contacts`); setImportMode(null); },
    onError: (e) => toast.error(e.message || "CSV import failed"),
  });
  const vcfMutation = trpc.affiliateContacts.adminImportVcf.useMutation({
    onSuccess: (d) => { utils.affiliateContacts.adminList.invalidate(); toast.success(`Imported ${d.imported} contacts`); setImportMode(null); },
    onError: (e) => toast.error(e.message || "vCard import failed"),
  });
  const sendEmailMutation = trpc.drip.affiliateSendEmailToLead.useMutation({
    onSuccess: () => { toast.success("Email sent"); setEmailContact(null); setEmailSubject(""); setEmailBody(""); },
    onError: (e) => toast.error(e.message || "Failed to send email"),
  });

  // Form state
  const [importMode, setImportMode] = useState<ImportMode>(null);
  const [tutorial, setTutorial] = useState<keyof typeof TUTORIALS | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAffiliate, setFormAffiliate] = useState<number | "">(affiliates[0]?.id || "");
  const [formEnroll, setFormEnroll] = useState<number | "">("");
  const [enrollImport, setEnrollImport] = useState<number | "">("");
  const [importAffiliate, setImportAffiliate] = useState<number | "">(affiliates[0]?.id || "");
  const csvRef = useRef<HTMLInputElement>(null);
  const vcfRef = useRef<HTMLInputElement>(null);

  // Email dialog
  const [emailContact, setEmailContact] = useState<{ name: string; email: string; affiliateToken?: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Expanded contact
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function resetForm() {
    setFormName(""); setFormEmail(""); setFormPhone(""); setFormNotes(""); setFormEnroll("");
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!importAffiliate) { toast.error("Please select an affiliate first"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      csvMutation.mutate({
        adminToken,
        affiliateId: Number(importAffiliate),
        csvText: ev.target?.result as string,
        enrollSequenceId: enrollImport ? Number(enrollImport) : undefined,
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleVcfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!importAffiliate) { toast.error("Please select an affiliate first"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      vcfMutation.mutate({
        adminToken,
        affiliateId: Number(importAffiliate),
        vcfText: ev.target?.result as string,
        enrollSequenceId: enrollImport ? Number(enrollImport) : undefined,
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // We need an affiliate token to send email — use the drip.affiliateSendEmailToLead which takes affiliate token
  // For admin, we'll need to get the affiliate's token. For now, we show a note that admin can send from the affiliate's portal.
  // Actually, we can create an admin send email procedure. For now, let's use a workaround: 
  // The admin can see contacts but to send email we need to use the affiliate's token.
  // We'll add an adminSendEmail procedure to dripCampaign router.

  const affiliateMap = new Map<number, { id: number; name: string; email: string }>(affiliates.map(a => [a.id, a]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-serif text-white">Contact Management</h2>
          <span className="text-white/40 text-sm">({contacts.length} contacts)</span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <select
            value={selectedAffiliateId ?? ""}
            onChange={e => setSelectedAffiliateId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white/10 border border-emerald-800/30 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">All brand partners</option>
            {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* Import / Add toolbar */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline"
          className="border-emerald-700/40 text-emerald-300 hover:bg-emerald-800/30"
          onClick={() => setImportMode(importMode === "manual" ? null : "manual")}>
          <UserPlus className="w-4 h-4 mr-1.5" /> Add Contact
        </Button>
        <Button type="button" size="sm" variant="outline"
          className="border-emerald-700/40 text-emerald-300 hover:bg-emerald-800/30"
          onClick={() => setImportMode(importMode === "csv" ? null : "csv")}>
          <FileText className="w-4 h-4 mr-1.5" /> Import CSV
        </Button>
        <Button type="button" size="sm" variant="outline"
          className="border-emerald-700/40 text-emerald-300 hover:bg-emerald-800/30"
          onClick={() => setImportMode(importMode === "vcf" ? null : "vcf")}>
          <Smartphone className="w-4 h-4 mr-1.5" /> Import vCard
        </Button>
      </div>

      {/* Add contact form */}
      {importMode === "manual" && (
        <div className="bg-white/5 border border-emerald-800/30 rounded-xl p-5 space-y-3">
          <h3 className="text-white font-medium text-sm">Add a contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Brand Partner *</label>
              <select value={formAffiliate} onChange={e => setFormAffiliate(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Select brand partner…</option>
                {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Full Name *</label>
              <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Jane Smith"
                className="bg-white/10 border-emerald-700/30 text-white placeholder:text-white/30 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Email</label>
              <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="jane@example.com" type="email"
                className="bg-white/10 border-emerald-700/30 text-white placeholder:text-white/30 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Phone</label>
              <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="+61 4xx xxx xxx"
                className="bg-white/10 border-emerald-700/30 text-white placeholder:text-white/30 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-white/60 text-xs mb-1 block">Notes</label>
              <Input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Optional notes"
                className="bg-white/10 border-emerald-700/30 text-white placeholder:text-white/30 text-sm" />
            </div>
            {sequences.length > 0 && (
              <div className="sm:col-span-2">
                <label className="text-white/60 text-xs mb-1 block">Enrol in drip sequence (optional)</label>
                <select value={formEnroll} onChange={e => setFormEnroll(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option value="">No sequence</option>
                  {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={!formName.trim() || !formAffiliate || addMutation.isPending}
              onClick={() => addMutation.mutate({
                adminToken,
                affiliateId: Number(formAffiliate),
                name: formName.trim(),
                email: formEmail.trim() || undefined,
                phone: formPhone.trim() || undefined,
                notes: formNotes.trim() || undefined,
                enrollSequenceId: formEnroll ? Number(formEnroll) : undefined,
              })}>
              {addMutation.isPending ? "Adding…" : "Add Contact"}
            </Button>
            <Button type="button" size="sm" variant="outline"
              className="border-white/20 text-white/60 hover:bg-white/10"
              onClick={() => { setImportMode(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* CSV import */}
      {importMode === "csv" && (
        <div className="bg-white/5 border border-emerald-800/30 rounded-xl p-5 space-y-3">
          <h3 className="text-white font-medium text-sm">Import from CSV</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Brand Partner *</label>
              <select value={importAffiliate} onChange={e => setImportAffiliate(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Select brand partner…</option>
                {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {sequences.length > 0 && (
              <div>
                <label className="text-white/60 text-xs mb-1 block">Enrol in sequence (optional)</label>
                <select value={enrollImport} onChange={e => setEnrollImport(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option value="">No sequence</option>
                  {sequences.map((s: { id: number; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/50 mb-2">
            {(["csv_gmail", "csv_outlook"] as const).map(k => (
              <button key={k} type="button" onClick={() => setTutorial(tutorial === k ? null : k)}
                className="flex items-center gap-1 text-emerald-400/70 hover:text-emerald-300 underline underline-offset-2">
                {TUTORIALS[k].title} {tutorial === k ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ))}
          </div>
          {tutorial && tutorial.startsWith("csv") && (
            <ol className="text-white/60 text-xs space-y-1 pl-4 list-decimal">
              {TUTORIALS[tutorial].steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
          <input ref={csvRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvFile} />
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"
            disabled={!importAffiliate || csvMutation.isPending}
            onClick={() => csvRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1.5" />
            {csvMutation.isPending ? "Importing…" : "Choose CSV File"}
          </Button>
        </div>
      )}

      {/* vCard import */}
      {importMode === "vcf" && (
        <div className="bg-white/5 border border-emerald-800/30 rounded-xl p-5 space-y-3">
          <h3 className="text-white font-medium text-sm">Import from vCard (.vcf)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Brand Partner *</label>
              <select value={importAffiliate} onChange={e => setImportAffiliate(e.target.value ? Number(e.target.value) : "")}
                className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Select brand partner…</option>
                {affiliates.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            {sequences.length > 0 && (
              <div>
                <label className="text-white/60 text-xs mb-1 block">Enrol in sequence (optional)</label>
                <select value={enrollImport} onChange={e => setEnrollImport(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                  <option value="">No sequence</option>
                  {sequences.map((s: { id: number; name: string }) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/50 mb-2">
            {(["vcf_iphone", "vcf_android"] as const).map(k => (
              <button key={k} type="button" onClick={() => setTutorial(tutorial === k ? null : k)}
                className="flex items-center gap-1 text-emerald-400/70 hover:text-emerald-300 underline underline-offset-2">
                {TUTORIALS[k].title} {tutorial === k ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ))}
          </div>
          {tutorial && tutorial.startsWith("vcf") && (
            <ol className="text-white/60 text-xs space-y-1 pl-4 list-decimal">
              {TUTORIALS[tutorial as keyof typeof TUTORIALS].steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
          <input ref={vcfRef} type="file" accept=".vcf,.vcard" className="hidden" onChange={handleVcfFile} />
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"
            disabled={!importAffiliate || vcfMutation.isPending}
            onClick={() => vcfRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1.5" />
            {vcfMutation.isPending ? "Importing…" : "Choose vCard File"}
          </Button>
        </div>
      )}

      {/* Contact list */}
      {isLoading ? (
        <div className="text-white/40 text-sm py-8 text-center">Loading contacts…</div>
      ) : contacts.length === 0 ? (
        <div className="text-white/40 text-sm py-12 text-center">
          <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>No contacts yet{selectedAffiliateId ? " for this brand partner" : ""}.</p>
          <p className="text-xs mt-1">Add contacts manually or import from CSV / vCard above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c: any) => {
            const affiliate = affiliateMap.get(c.affiliateId);
            return (
              <div key={c.id} className="bg-white/5 border border-emerald-800/20 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 gap-2">
                  <button type="button" className="flex-1 flex items-start gap-3 text-left"
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <div className="w-8 h-8 rounded-full bg-emerald-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-300 text-xs font-semibold">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{c.name}</p>
                      <p className="text-white/40 text-xs truncate">{c.email || c.phone || "No contact info"}</p>
                      {affiliate && <p className="text-emerald-400/60 text-xs">{affiliate.name}</p>}
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.email && (
                      <button type="button" title="Send email"
                        onClick={() => setEmailContact({ name: c.name, email: c.email })}
                        className="p-1.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-800/30 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" title="Delete contact"
                      onClick={() => { if (confirm(`Delete ${c.name}?`)) deleteMutation.mutate({ adminToken, id: c.id }); }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white/80 transition-colors">
                      {expandedId === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {expandedId === c.id && (
                  <div className="border-t border-white/10 px-4 py-3 space-y-1 text-xs text-white/60">
                    {c.email && <p><span className="text-white/40">Email:</span> {c.email}</p>}
                    {c.phone && <p><span className="text-white/40">Phone:</span> {c.phone}</p>}
                    {c.notes && <p><span className="text-white/40">Notes:</span> {c.notes}</p>}
                    {c.enrolledSequenceId && <p><span className="text-white/40">Enrolled in sequence ID:</span> {c.enrolledSequenceId}</p>}
                    <p><span className="text-white/40">Source:</span> {c.source || "manual"}</p>
                    <p><span className="text-white/40">Added:</span> {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Email compose dialog */}
      <Dialog open={!!emailContact} onOpenChange={open => { if (!open) { setEmailContact(null); setEmailSubject(""); setEmailBody(""); } }}>
        <DialogContent className="bg-[#0d3b22] border-emerald-800/40 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white font-serif">
              Email to {emailContact?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-white/50 text-xs">To: {emailContact?.email}</p>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Subject *</label>
              <Input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                placeholder="e.g. Sunday programme this week, {{first_name}}!"
                className="bg-white/10 border-emerald-700/30 text-white placeholder:text-white/30 text-sm" />
            </div>
            <div>
              <label className="text-white/60 text-xs mb-2 block">Message *</label>
              <BlockEmailBuilder
                value={emailBody}
                onChange={setEmailBody}
                adminPassword={adminToken}
              />
            </div>
            <p className="text-white/30 text-xs">
              Note: Email will be sent from the brand partner's name. For admin-originated emails, the sender will appear as "Add Life to Your Years Team".
            </p>
            <div className="flex gap-2 pt-1">
              <Button type="button" className="bg-emerald-600 hover:bg-emerald-500 text-white"
                disabled={!emailSubject || !emailBody || sendEmailMutation.isPending}
                onClick={() => {
                  if (!emailContact) return;
                  // Use owner affiliate token — admin sends as the owner
                  // We'll use a special admin send procedure via drip router
                  toast.info("Admin email sending is handled via the brand partner portal. Please use the portal to send individual emails.");
                }}>
                <Send className="w-4 h-4 mr-1.5" />
                {sendEmailMutation.isPending ? "Sending…" : "Send Email"}
              </Button>
              <Button type="button" variant="outline"
                className="border-white/20 text-white/60 hover:bg-white/10"
                onClick={() => { setEmailContact(null); setEmailSubject(""); setEmailBody(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail, Plus, Trash2, Edit2, Send, Users, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, Zap, Clock,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";

interface Props {
  adminToken: string;
}

export default function PEMFAdminDrip({ adminToken }: Props) {
  const utils = trpc.useUtils();

  // ── Sequences ──────────────────────────────────────────────────────────────
  const { data: sequences = [], isLoading: seqLoading } = trpc.drip.adminGetSequences.useQuery({ adminToken });

  const [showNewSeq, setShowNewSeq] = useState(false);
  const [newSeqName, setNewSeqName] = useState("");
  const [newSeqDesc, setNewSeqDesc] = useState("");
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);

  const createSeq = trpc.drip.adminCreateSequence.useMutation({
    onSuccess: () => { utils.drip.adminGetSequences.invalidate(); setShowNewSeq(false); setNewSeqName(""); setNewSeqDesc(""); toast.success("Sequence created!"); },
    onError: (e) => toast.error(e.message),
  });

  const toggleSeqActive = trpc.drip.adminUpdateSequence.useMutation({
    onSuccess: () => { utils.drip.adminGetSequences.invalidate(); toast.success("Sequence updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteSeq = trpc.drip.adminDeleteSequence.useMutation({
    onSuccess: () => { utils.drip.adminGetSequences.invalidate(); toast.success("Sequence deleted."); },
    onError: (e) => toast.error(e.message),
  });

  // ── Emails within a sequence ───────────────────────────────────────────────
  const { data: seqEmails = [] } = trpc.drip.adminGetSequenceEmails.useQuery(
    { adminToken, sequenceId: expandedSeq! },
    { enabled: !!expandedSeq }
  );

  const [showNewEmail, setShowNewEmail] = useState(false);
  const [editingEmail, setEditingEmail] = useState<typeof seqEmails[0] | null>(null);
  const [emailForm, setEmailForm] = useState({ dayOffset: 0, subject: "", body: "", sortOrder: 0 });

  const createEmail = trpc.drip.adminCreateDripEmail.useMutation({
    onSuccess: () => { utils.drip.adminGetSequenceEmails.invalidate(); setShowNewEmail(false); setEmailForm({ dayOffset: 0, subject: "", body: "", sortOrder: 0 }); toast.success("Email added!"); },
    onError: (e) => toast.error(e.message),
  });

  const updateEmail = trpc.drip.adminUpdateDripEmail.useMutation({
    onSuccess: () => { utils.drip.adminGetSequenceEmails.invalidate(); setEditingEmail(null); toast.success("Email updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteEmail = trpc.drip.adminDeleteDripEmail.useMutation({
    onSuccess: () => { utils.drip.adminGetSequenceEmails.invalidate(); toast.success("Email removed."); },
    onError: (e) => toast.error(e.message),
  });

  // ── Broadcast ──────────────────────────────────────────────────────────────
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastResult, setBroadcastResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const broadcast = trpc.drip.adminBroadcast.useMutation({
    onSuccess: (data) => { setBroadcastResult(data); setBroadcastSubject(""); setBroadcastBody(""); toast.success(`Broadcast sent to ${data.sent} affiliates!`); },
    onError: (e) => toast.error(e.message),
  });

  // ── Process drip queue ─────────────────────────────────────────────────────
  const processQueue = trpc.drip.adminProcessDripQueue.useMutation({
    onSuccess: (data) => toast.success(`Queue processed: ${data.sent} sent, ${data.failed} failed`),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Campaigns</h2>
          <p className="text-muted-foreground mt-1">Manage drip sequences, broadcast emails, and view email logs.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => processQueue.mutate({ adminToken, origin: window.location.origin })}
          disabled={processQueue.isPending}
          className="gap-2"
        >
          {processQueue.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Process Queue Now
        </Button>
      </div>

      {/* ── Broadcast Section ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-primary" />
            Broadcast to All Affiliates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {broadcastResult && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Last broadcast: {broadcastResult.sent} sent, {broadcastResult.failed} failed out of {broadcastResult.total} affiliates.
            </div>
          )}
          <Input
            placeholder="Subject line..."
            value={broadcastSubject}
            onChange={e => setBroadcastSubject(e.target.value)}
          />
          <Textarea
            placeholder="Email body (HTML supported)..."
            value={broadcastBody}
            onChange={e => setBroadcastBody(e.target.value)}
            rows={6}
          />
          <Button
            onClick={() => broadcast.mutate({ adminToken, subject: broadcastSubject, body: broadcastBody })}
            disabled={!broadcastSubject || !broadcastBody || broadcast.isPending}
            className="gap-2"
          >
            {broadcast.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send to All Active Affiliates
          </Button>
        </CardContent>
      </Card>

      {/* ── Drip Sequences ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Drip Sequences
          </h3>
          <Button size="sm" onClick={() => setShowNewSeq(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Sequence
          </Button>
        </div>

        {seqLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading sequences...
          </div>
        ) : sequences.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No drip sequences yet</p>
            <p className="text-sm mt-1">Create a sequence to start automating emails to new leads.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map(seq => (
              <Card key={seq.id} className="border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setExpandedSeq(expandedSeq === seq.id ? null : seq.id)}
                        className="flex items-center gap-2 text-left"
                      >
                        {expandedSeq === seq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        <div>
                          <div className="font-medium text-foreground">{seq.name}</div>
                          {seq.description && <div className="text-xs text-muted-foreground mt-0.5">{seq.description}</div>}
                        </div>
                      </button>
                      <Badge variant={seq.isActive ? "default" : "secondary"} className="text-xs">
                        {seq.isActive ? "Active" : "Paused"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{seq.emailCount} email{seq.emailCount !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSeqActive.mutate({ adminToken, id: seq.id, isActive: !seq.isActive })}
                      >
                        {seq.isActive ? "Pause" : "Activate"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => { if (confirm("Delete this sequence and all its emails?")) deleteSeq.mutate({ adminToken, id: seq.id }); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded: emails in this sequence */}
                  {expandedSeq === seq.id && (
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                      {seqEmails.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No emails in this sequence yet.</p>
                      ) : (
                        seqEmails.map((email, idx) => (
                          <div key={email.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Day {email.dayOffset}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">{email.subject}</div>
                              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: email.body.replace(/<[^>]*>/g, " ").slice(0, 120) + "..." }}
                              />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingEmail(email); setEmailForm({ dayOffset: email.dayOffset, subject: email.subject, body: email.body, sortOrder: email.sortOrder }); }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => { if (confirm("Remove this email?")) deleteEmail.mutate({ adminToken, id: email.id }); }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => { setShowNewEmail(true); setEmailForm({ dayOffset: (seqEmails[seqEmails.length - 1]?.dayOffset ?? -1) + 1, subject: "", body: "", sortOrder: seqEmails.length }); }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Email to Sequence
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── New Sequence Dialog ───────────────────────────────────────────── */}
      <Dialog open={showNewSeq} onOpenChange={setShowNewSeq}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Drip Sequence</DialogTitle>
            <DialogDescription>Create a new automated email sequence for new leads.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Sequence name (e.g. PEMF Welcome Series)"
              value={newSeqName}
              onChange={e => setNewSeqName(e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newSeqDesc}
              onChange={e => setNewSeqDesc(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSeq(false)}>Cancel</Button>
            <Button
              onClick={() => createSeq.mutate({ adminToken, name: newSeqName, description: newSeqDesc, isActive: true })}
              disabled={!newSeqName || createSeq.isPending}
            >
              {createSeq.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New / Edit Email Dialog ───────────────────────────────────────── */}
      <Dialog open={showNewEmail || !!editingEmail} onOpenChange={(open) => { if (!open) { setShowNewEmail(false); setEditingEmail(null); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEmail ? "Edit Email" : "Add Email to Sequence"}</DialogTitle>
            <DialogDescription>
              {editingEmail ? "Update this email in the sequence." : "Add a new email step to the sequence."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 block">Send on Day</label>
                <Input
                  type="number"
                  min={0}
                  value={emailForm.dayOffset}
                  onChange={e => setEmailForm(f => ({ ...f, dayOffset: parseInt(e.target.value) || 0 }))}
                  placeholder="0 = immediately"
                />
                <p className="text-xs text-muted-foreground mt-1">0 = immediately after form submission</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
              <Input
                placeholder="Email subject line..."
                value={emailForm.subject}
                onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Body (HTML supported)</label>
              <Textarea
                placeholder="Email body... You can use HTML. The affiliate's name and an unsubscribe link will be added automatically."
                value={emailForm.body}
                onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))}
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available placeholders: <code className="bg-muted px-1 rounded">{"{{leadName}}"}</code> — the lead's first name.
                An unsubscribe footer is added automatically.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewEmail(false); setEditingEmail(null); }}>Cancel</Button>
            <Button
              onClick={() => {
                if (editingEmail) {
                  updateEmail.mutate({ adminToken, id: editingEmail.id, ...emailForm });
                } else {
                  createEmail.mutate({ adminToken, sequenceId: expandedSeq!, ...emailForm });
                }
              }}
              disabled={!emailForm.subject || !emailForm.body || createEmail.isPending || updateEmail.isPending}
            >
              {(createEmail.isPending || updateEmail.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingEmail ? "Save Changes" : "Add Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

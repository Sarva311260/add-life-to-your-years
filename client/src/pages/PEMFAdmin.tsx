import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PEMFAdminDrip from "./PEMFAdminDrip";
import PEMFAdminContentLibrary from "./PEMFAdminContentLibrary";
import PEMFAdminProducts from "./PEMFAdminProducts";
import AdminContacts from "./AdminContacts";
import {
  Leaf, Eye, EyeOff, ArrowRight, LogOut, Users, BarChart2,
  ToggleLeft, ToggleRight, Edit2, Lock, Check, X, ChevronDown, ChevronUp,
  Mail, Phone, Link2, Copy, Search, BookOpen, Send, Loader2, Headphones, RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ADMIN_TOKEN_KEY = "pemf_admin_token";

const ADMIN_PW_KEY = "pemf_admin_password";
function getAdminToken() { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; }
function setAdminToken(t: string) { localStorage.setItem(ADMIN_TOKEN_KEY, t); }
function clearAdminToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); localStorage.removeItem(ADMIN_PW_KEY); }
function getAdminPassword() { return localStorage.getItem(ADMIN_PW_KEY) || ""; }
function setAdminPassword(p: string) { localStorage.setItem(ADMIN_PW_KEY, p); }

// ─── Admin Login ─────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const loginMutation = trpc.pemfAffiliate.adminLogin.useMutation({
    onSuccess: (data) => {
      setAdminToken(data.token);
      setAdminPassword(password);
      onLogin();
      toast.success("Welcome to the admin back office.");
    },
    onError: (err) => toast.error(err.message || "Invalid password."),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a] flex flex-col">
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-400" />
          <span className="text-white font-serif text-lg">Add Life to Your Years</span>
          <span className="ml-auto text-emerald-300/70 text-sm tracking-wider uppercase">Admin</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-serif text-white mb-1">Admin Access</h1>
            <p className="text-gray-400 text-sm">PEMF Brand Partner Management</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); loginMutation.mutate({ password }); }}
            className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block text-emerald-300 text-sm font-medium mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="Enter admin password"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginMutation.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Enter</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Affiliate Row ────────────────────────────────────────────────────────────
function AffiliateRow({ affiliate, adminToken, onRefresh }: {
  affiliate: {
    id: number; name: string; email: string; phone: string; slug: string;
    isActive: number; enquiryCount: number; hasPassword: boolean;
    lastLoginAt: Date | null; createdAt: Date;
  };
  adminToken: string;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(affiliate.name);
  const [editEmail, setEditEmail] = useState(affiliate.email);
  const [editPhone, setEditPhone] = useState(affiliate.phone);
  const [newPassword, setNewPassword] = useState("");
  const [showPwField, setShowPwField] = useState(false);

  const setActiveMutation = trpc.pemfAffiliate.adminSetActive.useMutation({
    onSuccess: () => { toast.success(`Affiliate ${affiliate.isActive ? "deactivated" : "activated"}.`); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.pemfAffiliate.adminUpdateAffiliate.useMutation({
    onSuccess: () => { toast.success("Affiliate updated."); setEditMode(false); onRefresh(); },
    onError: (err) => toast.error(err.message),
  });

  const resetPwMutation = trpc.pemfAffiliate.adminResetPassword.useMutation({
    onSuccess: () => { toast.success("Password reset successfully."); setNewPassword(""); setShowPwField(false); },
    onError: (err) => toast.error(err.message),
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pemf/${affiliate.slug}`);
    toast.success("Link copied!");
  };

  // Individual email to affiliate
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const sendEmail = trpc.drip.adminEmailAffiliate.useMutation({
    onSuccess: () => { toast.success("Email sent!"); setShowEmailDialog(false); setEmailSubject(""); setEmailBody(""); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${affiliate.isActive ? "border-emerald-800/30" : "border-red-900/30 opacity-60"}`}>
      {/* Row Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-medium">{affiliate.name}</p>
            {!affiliate.isActive && <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>}
            {!affiliate.hasPassword && <span className="text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full">No password set</span>}
          </div>
          <p className="text-gray-400 text-sm truncate">{affiliate.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-center hidden sm:block">
            <p className="text-white font-bold text-lg">{affiliate.enquiryCount}</p>
            <p className="text-gray-500 text-xs">enquiries</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-emerald-800/20 p-4 space-y-4">
          {/* Info Grid */}
          {!editMode ? (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-300"><Mail className="w-4 h-4 text-emerald-400/70" />{affiliate.email}</div>
              <div className="flex items-center gap-2 text-gray-300"><Phone className="w-4 h-4 text-emerald-400/70" />{affiliate.phone}</div>
              <div className="flex items-center gap-2 text-gray-300 col-span-2">
                <Link2 className="w-4 h-4 text-emerald-400/70 flex-shrink-0" />
                <span className="text-emerald-400 truncate">/pemf/{affiliate.slug}</span>
                <button onClick={copyLink} className="flex-shrink-0 text-gray-400 hover:text-white"><Copy className="w-4 h-4" /></button>
              </div>
              <div className="text-gray-500 text-xs">Joined: {new Date(affiliate.createdAt).toLocaleDateString()}</div>
              <div className="text-gray-500 text-xs">Last login: {affiliate.lastLoginAt ? new Date(affiliate.lastLoginAt).toLocaleDateString() : "Never"}</div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Name", value: editName, setter: setEditName, type: "text" },
                { label: "Phone", value: editPhone, setter: setEditPhone, type: "tel" },
                { label: "Email", value: editEmail, setter: setEditEmail, type: "email" },
              ].map(({ label, value, setter, type }) => (
                <div key={label}>
                  <label className="block text-emerald-300/70 text-xs mb-1">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={() => updateMutation.mutate({ adminToken, affiliateId: affiliate.id, name: editName, email: editEmail, phone: editPhone })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => setEditMode(false)} className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            )}

            <button
              onClick={() => setShowPwField(!showPwField)}
              className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all"
            >
              <Lock className="w-3.5 h-3.5" /> Reset Password
            </button>

            <button
              onClick={() => setShowEmailDialog(true)}
              className="flex items-center gap-1.5 text-xs bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 px-3 py-1.5 rounded-lg transition-all"
            >
              <Mail className="w-3.5 h-3.5" /> Send Email
            </button>

            <button
              onClick={() => setActiveMutation.mutate({ adminToken, affiliateId: affiliate.id, isActive: !affiliate.isActive })}
              disabled={setActiveMutation.isPending}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${affiliate.isActive ? "bg-red-900/40 hover:bg-red-900/60 text-red-300" : "bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300"}`}
            >
              {affiliate.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
              {affiliate.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>

          {/* Password Reset Field */}
          {showPwField && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="flex-1 bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                onClick={() => {
                  if (newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
                  resetPwMutation.mutate({ adminToken, affiliateId: affiliate.id, newPassword });
                }}
                disabled={resetPwMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                Set
              </button>
            </div>
          )}
        </div>
      )}

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {affiliate.name}</DialogTitle>
            <DialogDescription>Send a direct email to this affiliate from noreply@addlifetoyouryears.org.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Subject..." value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
            <Textarea placeholder="Message body (HTML supported)..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={6} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
            <Button
              onClick={() => sendEmail.mutate({ adminToken, affiliateId: affiliate.id, subject: emailSubject, body: emailBody })}
              disabled={!emailSubject || !emailBody || sendEmail.isPending}
              className="gap-2"
            >
              {sendEmail.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Blog Posts Panel ────────────────────────────────────────────────────────
function BlogPostsPanel() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.blog.listAll.useQuery();
  const generateAudio = trpc.blog.generateAudio.useMutation({
    onSuccess: () => {
      utils.blog.listAll.invalidate();
      toast.success("Audio generated successfully!");
    },
    onError: (e) => toast.error(e.message || "Audio generation failed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading posts…</span>
      </div>
    );
  }

  const postList = posts ?? [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h2 className="text-white font-semibold text-lg">Blog Posts</h2>
        <span className="ml-auto text-gray-400 text-sm">{postList.length} posts</span>
      </div>
      {postList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No blog posts found.</div>
      ) : (
        <div className="space-y-3">
          {postList.map((post) => {
            const isGenerating = generateAudio.isPending && generateAudio.variables?.id === post.id;
            return (
              <div key={post.id} className="bg-white/5 border border-emerald-800/30 rounded-xl p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.published ? "bg-emerald-900/50 text-emerald-300" : "bg-gray-700 text-gray-400"
                    }`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-white font-medium truncate">{post.title}</p>
                  <p className="text-gray-400 text-sm truncate mt-0.5">{post.excerpt}</p>
                  {post.audioUrl && (
                    <div className="mt-2 flex items-center gap-2">
                      <Headphones className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <audio controls src={post.audioUrl} className="h-7" style={{ maxWidth: "260px" }} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    View →
                  </a>
                  <button
                    onClick={() => generateAudio.mutate({ id: post.id })}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      isGenerating
                        ? "bg-emerald-900/40 text-emerald-500 cursor-not-allowed"
                        : post.audioUrl
                        ? "bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-300"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                    ) : post.audioUrl ? (
                      <><RefreshCw className="w-3.5 h-3.5" /> Regenerate</>
                    ) : (
                      <><Headphones className="w-3.5 h-3.5" /> Generate Audio</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
type AdminView = "affiliates" | "campaigns" | "contacts" | "products" | "library" | "blog";

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const adminToken = getAdminToken();
  const [search, setSearch] = useState("");
  const [activeView, setActiveView] = useState<AdminView>("affiliates");

  const { data: affiliates, isLoading, refetch } = trpc.pemfAffiliate.adminGetAffiliates.useQuery(
    { adminToken },
    { enabled: !!adminToken, retry: false, refetchInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!affiliates) {
    clearAdminToken();
    onLogout();
    return null;
  }

  const filtered = affiliates.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.phone.includes(search)
  );

  const totalEnquiries = affiliates.reduce((sum, a) => sum + a.enquiryCount, 0);
  const activeCount = affiliates.filter(a => a.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-serif text-lg">Add Life to Your Years</span>
            <span className="text-emerald-600/60 mx-1">·</span>
            <span className="text-emerald-300/70 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/pemf/admin/resources" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </a>
            <button
              onClick={() => { clearAdminToken(); onLogout(); }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="bg-[#0a2e1a]/80 border-b border-emerald-800/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {(["affiliates", "campaigns", "contacts", "products", "library", "blog"] as AdminView[]).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-5 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                  activeView === view
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                  {view === "affiliates" ? "Brand Partners" : view === "campaigns" ? "Email Campaigns" : view === "contacts" ? "Contacts" : view === "products" ? "Recommended Products" : view === "library" ? "Content Library" : "Blog Posts"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        {/* Stats — only on affiliates tab */}
        {activeView === "blog" && (
          <div className="bg-[#0d3b22]/60 border border-emerald-800/30 rounded-2xl p-6">
            <BlogPostsPanel />
          </div>
        )}
        {activeView === "library" && (
          <div className="bg-[#0d3b22]/60 border border-emerald-800/30 rounded-2xl p-6">
            <PEMFAdminContentLibrary adminPassword={getAdminPassword()} />
          </div>
        )}
        {activeView === "products" && (
          <div className="bg-[#0d3b22]/60 border border-emerald-800/30 rounded-2xl p-6">
            <PEMFAdminProducts adminToken={adminToken} />
          </div>
        )}
        {activeView === "campaigns" && (
          <div className="bg-[#0d3b22]/60 border border-emerald-800/30 rounded-2xl p-6">
            <PEMFAdminDrip adminToken={adminToken} />
          </div>
        )}
        {activeView === "contacts" && (
          <div className="bg-[#0d3b22]/60 border border-emerald-800/30 rounded-2xl p-6">
            <AdminContacts adminToken={adminToken} adminPassword={getAdminPassword()} />
          </div>
        )}
        {activeView === "affiliates" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Partners", value: affiliates.length, icon: Users },
                { label: "Active Partners", value: activeCount, icon: ToggleRight },
                { label: "Total Enquiries", value: totalEnquiries, icon: BarChart2 },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white/5 border border-emerald-800/30 rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Search + List */}
            <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-white font-semibold">Brand Partners</h2>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="bg-white/10 border border-emerald-700/30 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {search ? "No partners match your search." : "No brand partners registered yet."}
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((affiliate) => (
                    <AffiliateRow
                      key={affiliate.id}
                      affiliate={affiliate}
                      adminToken={adminToken}
                      onRefresh={() => refetch()}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="flex gap-3 flex-wrap">
              <a href="/pemf/join" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                → Affiliate Sign-Up Page
              </a>
              <a href="/pemf" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                → Main PEMF Page
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PEMFAdmin() {
  const [loggedIn, setLoggedIn] = useState(() => !!getAdminToken());

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setLoggedIn(false)} />;
}

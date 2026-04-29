import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Leaf, Eye, EyeOff, ArrowRight, LogOut, User, Phone, Mail,
  BarChart2, Link2, Copy, Edit2, Check, X, Lock, ChevronDown, ChevronUp, BookOpen,
  Send, Loader2, Zap, Mail as MailIcon, Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AffiliateContacts from "./AffiliateContacts";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/RichTextEditor";
import AffiliateCustomLinks from "./AffiliateCustomLinks";

const TOKEN_KEY = "affiliate_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Login Screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const loginMutation = trpc.pemfAffiliate.login.useMutation({
    onSuccess: (data) => {
      setToken(data.token);
      onLogin();
      toast.success(`Welcome back, ${data.affiliate.name}!`);
    },
    onError: (err) => toast.error(err.message || "Login failed."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a] flex flex-col">
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-serif text-lg">Add Life to Your Years</span>
          </div>
          <span className="text-emerald-300/70 text-sm tracking-wider uppercase">Partner Portal</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-serif text-white mb-2">Partner Login</h1>
            <p className="text-gray-400">Sign in to manage your PEMF brand partner account.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-emerald-800/30 rounded-2xl p-8 space-y-5">
            <div>
              <label className="block text-emerald-300 text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-emerald-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Not a partner yet?{" "}
            <a href="/pemf/join" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign up here →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ onLogout }: { onLogout: () => void }) {
  const token = getToken();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEnquiries, setShowEnquiries] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Social media fields
  const [editFacebook, setEditFacebook] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editTiktok, setEditTiktok] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [editTwitter, setEditTwitter] = useState("");
  // ASEA cart URLs (4 separate links)
  const [editAseaRedoxRetailUrl, setEditAseaRedoxRetailUrl] = useState("");
  const [editAseaRedoxSubscriptionUrl, setEditAseaRedoxSubscriptionUrl] = useState("");
  const [editAseaRenu28RetailUrl, setEditAseaRenu28RetailUrl] = useState("");
  const [editAseaRenu28SubscriptionUrl, setEditAseaRenu28SubscriptionUrl] = useState("");

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const { data: profile, isLoading, refetch } = trpc.pemfAffiliate.getProfile.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const { data: allEnquiries } = trpc.pemfAffiliate.getEnquiries.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const { data: enrollments = [] } = trpc.drip.affiliateGetEnrollments.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Drip overrides
  const [activeTab, setActiveTab] = useState<"dashboard" | "campaigns" | "products" | "contacts">("dashboard");
  const { data: dripSequences = [], refetch: refetchDrip } = trpc.drip.affiliateGetDripOverrides.useQuery(
    { token },
    { enabled: !!token && activeTab === "campaigns", retry: false }
  );

  // Product links
  const { data: productLinks = [], refetch: refetchProducts } = trpc.recommendedProducts.getMyLinks.useQuery(
    { affiliateToken: token },
    { enabled: !!token && activeTab === "products", retry: false }
  );
  const saveProductLink = trpc.recommendedProducts.saveMyLink.useMutation({
    onSuccess: () => { toast.success("Link saved!"); refetchProducts(); },
    onError: (e: any) => toast.error(e.message),
  });
  const removeProductLink = trpc.recommendedProducts.removeMyLink.useMutation({
    onSuccess: () => { toast.success("Link removed."); refetchProducts(); },
    onError: (e: any) => toast.error(e.message),
  });
  const [productLinkEdits, setProductLinkEdits] = useState<Record<number, string>>({});
  const { data: emailStats = [] } = trpc.drip.affiliateGetEmailStats.useQuery(
    { token },
    { enabled: !!token && activeTab === "campaigns", retry: false }
  );
  const statsMap = Object.fromEntries((emailStats as any[]).map((s: any) => [s.dripEmailId, s]));
  const [editingOverride, setEditingOverride] = useState<{ emailId: number; subject: string; body: string } | null>(null);
  const saveDripOverride = trpc.drip.affiliateSaveDripOverride.useMutation({
    onSuccess: () => { toast.success("Email template saved!"); setEditingOverride(null); refetchDrip(); },
    onError: (e) => toast.error(e.message),
  });

  // Manual email to lead
  const [emailTarget, setEmailTarget] = useState<{ email: string; name: string } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const sendLeadEmail = trpc.drip.affiliateSendEmailToLead.useMutation({
    onSuccess: () => { toast.success("Email sent!"); setEmailTarget(null); setEmailSubject(""); setEmailBody(""); },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditPhone(profile.phone);
      setEditEmail(profile.email);
      setEditFacebook(profile.facebook || "");
      setEditInstagram(profile.instagram || "");
      setEditLinkedin(profile.linkedin || "");
      setEditTiktok(profile.tiktok || "");
      setEditYoutube(profile.youtube || "");
      setEditTwitter(profile.twitter || "");
      setEditAseaRedoxRetailUrl((profile as any).aseaRedoxRetailUrl || "");
      setEditAseaRedoxSubscriptionUrl((profile as any).aseaRedoxSubscriptionUrl || "");
      setEditAseaRenu28RetailUrl((profile as any).aseaRenu28RetailUrl || "");
      setEditAseaRenu28SubscriptionUrl((profile as any).aseaRenu28SubscriptionUrl || "");
    }
  }, [profile]);

  const updateMutation = trpc.pemfAffiliate.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully.");
      setEditMode(false);
      refetch();
    },
    onError: (err) => toast.error(err.message || "Update failed."),
  });

  const passwordMutation = trpc.pemfAffiliate.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setShowPasswordForm(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    },
    onError: (err) => toast.error(err.message || "Password change failed."),
  });

  const handleSaveProfile = () => {
    updateMutation.mutate({
      token,
      name: editName !== profile?.name ? editName : undefined,
      phone: editPhone !== profile?.phone ? editPhone : undefined,
      email: editEmail !== profile?.email ? editEmail : undefined,
      facebook: editFacebook !== (profile?.facebook || "") ? (editFacebook || null) : undefined,
      instagram: editInstagram !== (profile?.instagram || "") ? (editInstagram || null) : undefined,
      linkedin: editLinkedin !== (profile?.linkedin || "") ? (editLinkedin || null) : undefined,
      tiktok: editTiktok !== (profile?.tiktok || "") ? (editTiktok || null) : undefined,
      youtube: editYoutube !== (profile?.youtube || "") ? (editYoutube || null) : undefined,
      twitter: editTwitter !== (profile?.twitter || "") ? (editTwitter || null) : undefined,
      aseaRedoxRetailUrl: editAseaRedoxRetailUrl !== ((profile as any)?.aseaRedoxRetailUrl || "") ? (editAseaRedoxRetailUrl || null) : undefined,
      aseaRedoxSubscriptionUrl: editAseaRedoxSubscriptionUrl !== ((profile as any)?.aseaRedoxSubscriptionUrl || "") ? (editAseaRedoxSubscriptionUrl || null) : undefined,
      aseaRenu28RetailUrl: editAseaRenu28RetailUrl !== ((profile as any)?.aseaRenu28RetailUrl || "") ? (editAseaRenu28RetailUrl || null) : undefined,
      aseaRenu28SubscriptionUrl: editAseaRenu28SubscriptionUrl !== ((profile as any)?.aseaRenu28SubscriptionUrl || "") ? (editAseaRenu28SubscriptionUrl || null) : undefined,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast.error("Passwords do not match."); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    passwordMutation.mutate({ token, currentPassword: currentPw, newPassword: newPw });
  };

  const copyLink = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`${window.location.origin}/pemf/${profile.slug}`);
    toast.success("Link copied!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    clearToken();
    onLogout();
    return null;
  }

  const personalLink = `${window.location.origin}/pemf/${profile.slug}`;
  const mainSiteLink = `${window.location.origin}/ref/${profile.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-serif text-lg">Add Life to Your Years</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/pemf/portal/resources" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Resources</span>
            </a>
            <span className="text-emerald-300 text-sm hidden sm:block">{profile.name}</span>
            <button
              onClick={() => { clearToken(); onLogout(); }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-[#0a2e1a]/80 border-b border-emerald-800/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "dashboard"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "campaigns"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <MailIcon className="w-3.5 h-3.5" /> My Campaigns
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "products"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              My Product Links
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "contacts"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              My Contacts
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">

        {/* ─── CAMPAIGNS TAB ─── */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-white mb-1">My Email Campaigns</h2>
              <p className="text-emerald-300/70 text-sm">Personalise the drip emails that go out to your prospects. Your custom version will be used instead of the default template.</p>
            </div>

            {dripSequences.length === 0 ? (
              <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-8 text-center">
                <MailIcon className="w-10 h-10 text-emerald-700 mx-auto mb-3" />
                <p className="text-gray-400">No active email sequences yet. Check back once your admin has set up campaigns.</p>
              </div>
            ) : (
              dripSequences.map((seq: any) => (
                <div key={seq.id} className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{seq.name}</h3>
                      {seq.description && <p className="text-emerald-300/60 text-sm mt-0.5">{seq.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      seq.isActive ? "bg-emerald-900/50 text-emerald-400" : "bg-gray-800 text-gray-500"
                    }`}>{seq.isActive ? "Active" : "Paused"}</span>
                  </div>

                  {seq.emails.length === 0 ? (
                    <p className="text-gray-500 text-sm">No emails in this sequence yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {seq.emails.map((email: any) => (
                        <div key={email.id} className="bg-white/5 border border-emerald-800/20 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full">Day {email.dayOffset}</span>
                                {email.hasOverride && <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded-full">Customised</span>}
                              </div>
                              <p className="text-white text-sm font-medium truncate">{email.customSubject || email.subject}</p>
                              <p className="text-gray-400 text-xs mt-0.5">Default: {email.subject}</p>
                              {/* Stats row */}
                              {(() => {
                                const s = statsMap[email.id];
                                if (!s || s.sent === 0) return null;
                                const openRate = s.sent > 0 ? Math.round((s.opens / s.sent) * 100) : 0;
                                const clickRate = s.sent > 0 ? Math.round((s.clicks / s.sent) * 100) : 0;
                                return (
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-gray-400">📤 {s.sent} sent</span>
                                    <span className="text-xs text-emerald-400">👁 {openRate}% opened</span>
                                    <span className="text-xs text-blue-400">🔗 {clickRate}% clicked</span>
                                  </div>
                                );
                              })()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 gap-1.5 text-xs"
                              onClick={() => setEditingOverride({ emailId: email.id, subject: email.customSubject || email.subject, body: email.customBody || email.body })}
                            >
                              <Edit2 className="w-3 h-3" /> Customise
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── PRODUCTS TAB ─── */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-white mb-1">My Product Links</h2>
              <p className="text-emerald-300/70 text-sm">For each affiliate product below, enter your own affiliate link. When visitors arrive through your referral link, they'll use your link to purchase. If you don't add a link, the default link will be used.</p>
            </div>
            {productLinks.length === 0 ? (
              <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-8 text-center">
                <p className="text-gray-400">No affiliate products have been set up yet. Check back once your admin has added products.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(productLinks as any[]).map((product: any) => {
                  const editVal = productLinkEdits[product.id] ?? product.myUrl ?? "";
                  return (
                    <div key={product.id} className="bg-white/5 border border-emerald-800/30 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">{product.name}</span>
                            {product.category && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-300">{product.category}</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{product.shortDescription || product.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-emerald-300 text-xs font-medium block mb-1">Your Affiliate Link</label>
                          <input
                            type="url"
                            value={editVal}
                            onChange={e => setProductLinkEdits(prev => ({ ...prev, [product.id]: e.target.value }))}
                            placeholder="https://your-affiliate-link.com/..."
                            className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const url = editVal.trim();
                            if (!url) {
                              removeProductLink.mutate({ affiliateToken: token, productId: product.id });
                            } else {
                              saveProductLink.mutate({ affiliateToken: token, productId: product.id, affiliateUrl: url });
                            }
                          }}
                          disabled={saveProductLink.isPending || removeProductLink.isPending}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                        >
                          {editVal.trim() ? "Save" : "Remove"}
                        </button>
                        {product.myUrl && (
                          <button
                            onClick={() => { setProductLinkEdits(prev => ({ ...prev, [product.id]: "" })); }}
                            className="px-3 py-2 border border-red-800/50 text-red-400 hover:text-red-300 text-sm rounded-lg transition-colors shrink-0"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      {product.myUrl && (
                        <p className="text-emerald-400/70 text-xs mt-2">✓ Your link is active</p>
                      )}
                      {!product.myUrl && product.defaultAffiliateUrl && (
                        <p className="text-gray-500 text-xs mt-2">Default link will be used until you add your own.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── CONTACTS TAB ─── */}
        {activeTab === "contacts" && (
          <AffiliateContacts token={token} />
        )}

        {/* ─── DASHBOARD TAB ─── */}
        {activeTab === "dashboard" && <>
        {/* Welcome Banner */}
        <div className="bg-emerald-900/30 border border-emerald-700/30 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-emerald-400 text-sm uppercase tracking-widest mb-1">Brand Partner Dashboard</p>
              <h1 className="text-2xl font-serif text-white">Welcome, {profile.name}</h1>
            </div>
            <div className="flex items-center gap-2 bg-emerald-800/40 border border-emerald-700/30 rounded-xl px-4 py-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{profile.enquiryCount}</p>
                <p className="text-emerald-300/70 text-xs">Total Enquiries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Links */}
        <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-semibold">Your Personalised Links</h2>
          </div>
          <div className="space-y-3">
            {/* PEMF page */}
            <div>
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5 font-medium">PEMF Therapy Page</p>
              <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4">
                <a href={personalLink} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm flex-1 break-all hover:text-emerald-300 transition-colors">
                  {personalLink}
                </a>
                <button onClick={copyLink} className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg transition-all" title="Copy PEMF link">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Redox page */}
            <div>
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5 font-medium">Redox Signalling Page</p>
              <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4">
                <a href={`${window.location.origin}/redox/${profile?.slug}`} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm flex-1 break-all hover:text-emerald-300 transition-colors">
                  {`${window.location.origin}/redox/${profile?.slug}`}
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/redox/${profile?.slug}`); toast.success("Redox link copied!"); }}
                  className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg transition-all"
                  title="Copy Redox link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Main site */}
            <div>
              <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5 font-medium">Main Website</p>
              <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4">
                <a href={mainSiteLink} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm flex-1 break-all hover:text-emerald-300 transition-colors">
                  {mainSiteLink}
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(mainSiteLink); toast.success("Main site link copied!"); }}
                  className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg transition-all"
                  title="Copy main site link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-semibold">Profile Details</h2>
            </div>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditMode(false)} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", icon: User, value: editName, setter: setEditName, type: "text" },
              { label: "Phone Number", icon: Phone, value: editPhone, setter: setEditPhone, type: "tel" },
              { label: "Email Address", icon: Mail, value: editEmail, setter: setEditEmail, type: "email" },
            ].map(({ label, icon: Icon, value, setter, type }) => (
              <div key={label}>
                <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </label>
                {editMode ? (
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{value}</p>
                )}
              </div>
            ))}
          </div>

          {/* ASEA Cart URLs — 4 links */}
          <div className="mt-6 pt-6 border-t border-emerald-800/30">
            <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-1">ASEA Shopping Cart Links</p>
            <p className="text-gray-500 text-xs mb-4">Paste your 4 personal ASEA shopping cart URLs below. These will be used on your Redox Signalling page and product pages so visitors order directly through your store.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "ASEA REDOX — Retail", value: editAseaRedoxRetailUrl, setter: setEditAseaRedoxRetailUrl, placeholder: "https://shop.aseaglobal.com/info?cartSharingId=..." },
                { label: "ASEA REDOX — Subscription", value: editAseaRedoxSubscriptionUrl, setter: setEditAseaRedoxSubscriptionUrl, placeholder: "https://shop.aseaglobal.com/info?cartSharingId=..." },
                { label: "RENU 28 — Retail", value: editAseaRenu28RetailUrl, setter: setEditAseaRenu28RetailUrl, placeholder: "https://shop.aseaglobal.com/info?cartSharingId=..." },
                { label: "RENU 28 — Subscription", value: editAseaRenu28SubscriptionUrl, setter: setEditAseaRenu28SubscriptionUrl, placeholder: "https://shop.aseaglobal.com/info?cartSharingId=..." },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5">{label}</label>
                  {editMode ? (
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  ) : (
                    value ? (
                      <a href={value} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm py-2.5 block hover:text-emerald-300 truncate">{value}</a>
                    ) : (
                      <p className="text-gray-600 text-sm py-2.5 italic">Not set</p>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-6 pt-6 border-t border-emerald-800/30">
            <p className="text-emerald-300/70 text-xs uppercase tracking-wider mb-4">Social Media Links</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Facebook", value: editFacebook, setter: setEditFacebook, placeholder: "https://facebook.com/yourpage" },
                { label: "Instagram", value: editInstagram, setter: setEditInstagram, placeholder: "https://instagram.com/yourhandle" },
                { label: "LinkedIn", value: editLinkedin, setter: setEditLinkedin, placeholder: "https://linkedin.com/in/yourprofile" },
                { label: "TikTok", value: editTiktok, setter: setEditTiktok, placeholder: "https://tiktok.com/@yourhandle" },
                { label: "YouTube", value: editYoutube, setter: setEditYoutube, placeholder: "https://youtube.com/@yourchannel" },
                { label: "X (Twitter)", value: editTwitter, setter: setEditTwitter, placeholder: "https://x.com/yourhandle" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label}>
                  <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5">{label}</label>
                  {editMode ? (
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  ) : (
                    value ? (
                      <a href={value} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm py-2.5 block hover:text-emerald-300 truncate">{value}</a>
                    ) : (
                      <p className="text-gray-600 text-sm py-2.5 italic">Not set</p>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Custom Tags & Links */}
        <AffiliateCustomLinks token={token} />

        {/* Change Password */}
        <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-semibold">Change Password</h2>
            </div>
            {showPasswordForm ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    minLength={6}
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-emerald-300/70 text-xs uppercase tracking-wider mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {passwordMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* All Leads Table */}
        <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
          <button
            onClick={() => setShowEnquiries(!showEnquiries)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-white font-semibold">My Leads</h2>
              {allEnquiries && (
                <span className="bg-emerald-600/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full">{allEnquiries.length}</span>
              )}
            </div>
            {showEnquiries ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showEnquiries && (
            <div className="mt-5">
              {!allEnquiries || allEnquiries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No leads yet. Share your PEMF link to start receiving enquiries.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allEnquiries.map((enq) => (
                    <div key={enq.id} className="bg-black/20 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{enq.visitorName}</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {enq.visitorEmail}{enq.visitorPhone ? ` · ${enq.visitorPhone}` : ""}
                          </p>
                          {enq.message && (
                            <p className="text-gray-300 text-sm mt-1.5 italic">"{enq.message}"</p>
                          )}
                          {enq.sourcePage && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 bg-emerald-900/30 border border-emerald-700/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
                                <Link2 className="w-3 h-3" />
                                {enq.sourcePage}
                              </span>
                            </div>
                          )}
                          {/* Drip enrollment status */}
                          {(() => {
                            const enroll = enrollments.find(e => e.enquiryId === enq.id);
                            if (!enroll) return null;
                            return (
                              <div className="mt-2 flex items-center gap-1.5">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  enroll.status === 'active' ? 'bg-amber-900/30 text-amber-300' :
                                  enroll.status === 'completed' ? 'bg-emerald-900/30 text-emerald-300' :
                                  'bg-gray-800 text-gray-400'
                                }`}>
                                  Drip: {enroll.status} · {enroll.emailsSent} sent
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-gray-500 text-xs whitespace-nowrap">
                            {new Date(enq.createdAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => { setEmailTarget({ email: enq.visitorEmail, name: enq.visitorName }); setEmailSubject(""); setEmailBody(""); }}
                            className="flex items-center gap-1 text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-2.5 py-1 rounded-lg transition-all"
                          >
                            <Mail className="w-3 h-3" /> Email
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </> /* end dashboard tab */}
      </div>

      {/* Drip Override Edit Dialog */}
      <Dialog open={!!editingOverride} onOpenChange={(open) => { if (!open) setEditingOverride(null); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customise Email Template</DialogTitle>
            <DialogDescription>
              Edit the subject and body for this email. Your version will be sent to your prospects instead of the default.
            </DialogDescription>
          </DialogHeader>
          {editingOverride && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Subject</label>
                <Input
                  value={editingOverride.subject}
                  onChange={e => setEditingOverride(o => o ? { ...o, subject: e.target.value } : null)}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body</label>
                <RichTextEditor
                  value={editingOverride.body}
                  onChange={(html) => setEditingOverride(o => o ? { ...o, body: html } : null)}
                  placeholder="Email body..."
                  minHeight={280}
                  token={token}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use <code className="bg-muted px-1 rounded">{"{{leadName}}"}</code> for the prospect's name. An unsubscribe link is added automatically.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOverride(null)}>Cancel</Button>
            <Button
              onClick={() => editingOverride && saveDripOverride.mutate({ token, dripEmailId: editingOverride.emailId, subject: editingOverride.subject, body: editingOverride.body })}
              disabled={!editingOverride?.subject || !editingOverride?.body || saveDripOverride.isPending}
              className="gap-2"
            >
              {saveDripOverride.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save My Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Email Dialog */}
      <Dialog open={!!emailTarget} onOpenChange={(open) => { if (!open) setEmailTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email {emailTarget?.name}</DialogTitle>
            <DialogDescription>
              Send a personal follow-up email to {emailTarget?.email}. Your email address will be set as the reply-to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              placeholder="Subject..."
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
            />
            <RichTextEditor
              value={emailBody}
              onChange={setEmailBody}
              placeholder="Your message..."
              minHeight={200}
              token={token}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailTarget(null)}>Cancel</Button>
            <Button
              onClick={() => sendLeadEmail.mutate({ token, leadEmail: emailTarget!.email, leadName: emailTarget!.name, subject: emailSubject, body: emailBody })}
              disabled={!emailSubject || !emailBody || sendLeadEmail.isPending}
              className="gap-2"
            >
              {sendLeadEmail.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PEMFPortal() {
  const [loggedIn, setLoggedIn] = useState(() => !!getToken());

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <DashboardScreen onLogout={() => setLoggedIn(false)} />;
}

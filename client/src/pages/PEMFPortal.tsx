import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Leaf, Eye, EyeOff, ArrowRight, LogOut, User, Phone, Mail,
  BarChart2, Link2, Copy, Edit2, Check, X, Lock, ChevronDown, ChevronUp, BookOpen
} from "lucide-react";

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

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const { data: profile, isLoading, refetch } = trpc.pemfAffiliate.getProfile.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditPhone(profile.phone);
      setEditEmail(profile.email);
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
              <span className="hidden sm:inline">Resources</span>
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

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
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

        {/* Personal Link */}
        <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-white font-semibold">Your Personal PEMF Link</h2>
          </div>
          <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4">
            <a href={personalLink} target="_blank" rel="noreferrer" className="text-emerald-400 text-sm flex-1 break-all hover:text-emerald-300 transition-colors">
              {personalLink}
            </a>
            <button onClick={copyLink} className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg transition-all" title="Copy link">
              <Copy className="w-4 h-4" />
            </button>
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
        </div>

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

        {/* Recent Enquiries */}
        {profile.recentEnquiries.length > 0 && (
          <div className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6">
            <button
              onClick={() => setShowEnquiries(!showEnquiries)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-white font-semibold">Recent Enquiries</h2>
                <span className="bg-emerald-600/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full">{profile.recentEnquiries.length}</span>
              </div>
              {showEnquiries ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showEnquiries && (
              <div className="mt-5 space-y-3">
                {profile.recentEnquiries.map((enq) => (
                  <div key={enq.id} className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-medium text-sm">{enq.visitorName}</p>
                        <p className="text-gray-400 text-xs">{enq.visitorEmail}{enq.visitorPhone ? ` · ${enq.visitorPhone}` : ""}</p>
                        {enq.message && <p className="text-gray-300 text-sm mt-1.5 italic">"{enq.message}"</p>}
                      </div>
                      <p className="text-gray-500 text-xs whitespace-nowrap">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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

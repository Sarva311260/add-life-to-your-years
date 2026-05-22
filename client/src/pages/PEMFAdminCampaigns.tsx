import { useState } from "react";
import { Leaf, ArrowLeft, LogOut, Mail, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import PEMFAdminDrip from "./PEMFAdminDrip";
import AdminContacts from "./AdminContacts";

const ADMIN_TOKEN_KEY = "pemf_admin_token";
function getAdminToken() { return localStorage.getItem(ADMIN_TOKEN_KEY) || ""; }
function setAdminToken(t: string) { localStorage.setItem(ADMIN_TOKEN_KEY, t); }
function clearAdminToken() { localStorage.removeItem(ADMIN_TOKEN_KEY); }

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const loginMutation = trpc.pemfAffiliate.adminLogin.useMutation({
    onSuccess: (data) => { setAdminToken(data.token); onLogin(); toast.success("Welcome!"); },
    onError: (err) => toast.error(err.message || "Invalid password."),
  });
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Leaf className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h1 className="text-2xl font-serif text-white mb-1">Admin Access</h1>
          <p className="text-gray-400 text-sm">Email Campaigns &amp; Contacts</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate({ password }); }}
          className="bg-white/5 border border-emerald-800/30 rounded-2xl p-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Admin password"
            required
          />
          <button type="submit" disabled={loginMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50">
            {loginMutation.isPending ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PEMFAdminCampaigns() {
  const [loggedIn, setLoggedIn] = useState(() => !!getAdminToken());
  const [activeTab, setActiveTab] = useState<"campaigns" | "contacts">("campaigns");
  const adminToken = getAdminToken();

  if (!loggedIn) return <AdminLogin onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/pemf/admin" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-serif">Add Life to Your Years</span>
            <span className="text-emerald-600/60 mx-1">·</span>
            <span className="text-emerald-300/70 text-sm">Admin Panel</span>
          </div>
          <button
            onClick={() => { clearAdminToken(); setLoggedIn(false); }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "campaigns"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <Mail className="w-4 h-4" /> Email Campaigns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "contacts"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            <Users className="w-4 h-4" /> Contacts
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {activeTab === "campaigns" && <PEMFAdminDrip adminToken={adminToken} />}
        {activeTab === "contacts" && <AdminContacts adminToken={adminToken} />}
      </div>
    </div>
  );
}

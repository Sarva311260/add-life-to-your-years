import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Leaf, CheckCircle, Copy, ArrowRight, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";

function generateSlugPreview(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PEMFJoin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [debouncedSlug, setDebouncedSlug] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-populate slug from name (only if user hasn't manually edited it)
  useEffect(() => {
    if (!slugTouched && name) {
      const preview = generateSlugPreview(name);
      setCustomSlug(preview);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setDebouncedSlug(preview), 500);
    }
  }, [name, slugTouched]);

  // Debounce slug availability check
  const handleSlugChange = (val: string) => {
    setSlugTouched(true);
    const sanitized = generateSlugPreview(val);
    setCustomSlug(sanitized);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSlug(sanitized), 500);
  };

  const slugCheck = trpc.pemfAffiliate.checkSlugAvailability.useQuery(
    { slug: debouncedSlug },
    { enabled: debouncedSlug.length > 0 }
  );

  const registerMutation = trpc.pemfAffiliate.register.useMutation({
    onSuccess: (data) => {
      setGeneratedSlug(data.slug);
      setSubmitted(true);
      if (data.token) {
        localStorage.setItem("affiliate_token", data.token);
      }
      toast.success("Welcome aboard! Your personalised PEMF page is ready.");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (slugCheck.data && !slugCheck.data.available) {
      toast.error("That URL is already taken. Please choose a different one.");
      return;
    }
    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      customSlug: customSlug || undefined,
    });
  };

  const personalLink = `${window.location.origin}/pemf/${generatedSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(personalLink);
    toast.success("Link copied to clipboard!");
  };

  const slugPreviewUrl = `${window.location.origin}/pemf/${customSlug || "your-name"}`;
  const isCheckingSlug = slugCheck.isFetching;
  const slugAvailable = slugCheck.data?.available;
  const slugChecked = !isCheckingSlug && debouncedSlug.length > 0 && slugCheck.data !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-serif text-lg">Add Life to Your Years</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/pemf/portal" className="text-emerald-300/70 text-sm hover:text-emerald-300 transition-colors">
              Already a partner? Sign in →
            </a>
            <span className="text-emerald-300/70 text-sm tracking-wider uppercase hidden sm:block">Brand Partner Programme</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {!submitted ? (
          <>
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/30 rounded-full px-4 py-1.5 mb-6">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm tracking-wider uppercase">Join Our Team</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                Become a <span className="text-emerald-400">Brand Partner</span>
              </h1>
              <p className="text-gray-300 text-lg max-w-lg mx-auto">
                Join our network of wellness advocates and receive your own personalised PEMF page to share with your community.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-emerald-800/30 rounded-2xl p-8 space-y-6">
              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>

              {/* Custom Slug Field */}
              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-1">Your Personal URL</label>
                <p className="text-gray-400 text-xs mb-2">This is the unique link you'll share with people — it's the address they'll visit to learn about PEMF through you. Choose something simple and memorable. Note: your slug is visible in the URL, so if privacy is a concern, consider using a nickname or brand name rather than your full name. <span className="text-amber-400/80">This cannot be changed after registration.</span></p>
                <div className="relative">
                  <div className="flex items-center bg-white/10 border rounded-lg overflow-hidden transition-all"
                    style={{
                      borderColor: slugChecked
                        ? (slugAvailable ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.5)")
                        : "rgba(6,78,59,0.3)"
                    }}
                  >
                    <span className="text-gray-400 text-sm px-3 py-3 border-r border-emerald-700/30 whitespace-nowrap bg-white/5">
                      …/pemf/
                    </span>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="your-name"
                      className="flex-1 bg-transparent px-3 py-3 text-white placeholder-gray-500 focus:outline-none text-sm"
                    />
                    <div className="px-3">
                      {isCheckingSlug && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                      {slugChecked && slugAvailable && <Check className="w-4 h-4 text-emerald-400" />}
                      {slugChecked && !slugAvailable && <X className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                </div>
                {slugChecked && slugAvailable && (
                  <p className="text-emerald-400 text-xs mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available! Your link will be: <span className="font-medium">{slugPreviewUrl}</span>
                  </p>
                )}
                {slugChecked && !slugAvailable && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <X className="w-3 h-3" /> That URL is already taken — please choose a different one.
                  </p>
                )}
                {!slugChecked && customSlug && (
                  <p className="text-gray-500 text-xs mt-1.5">
                    Your link will be: <span className="text-gray-400">{slugPreviewUrl}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 400 000 000"
                  className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 text-sm font-medium mb-2">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/10 border border-emerald-700/30 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">You'll use this to log in to your partner dashboard.</p>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending || (slugChecked && !slugAvailable)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating your page...
                  </>
                ) : (
                  <>
                    Get My Personal Link
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Benefits */}
            <div className="mt-12 grid gap-4">
              {[
                "Your own personalised PEMF information page",
                "Your name displayed as a Brand Partner",
                "Contact form notifications sent directly to you",
                "Share your unique link with your network",
                "Access your partner dashboard to track enquiries",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Success State */
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-white mb-4">
              Welcome, {name}!
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Your personalised PEMF page is ready. Share this link with your community:
            </p>

            {/* Link Display */}
            <div className="bg-white/5 border border-emerald-700/30 rounded-xl p-6 mb-6">
              <p className="text-emerald-300 text-sm mb-3 uppercase tracking-wider">Your Personal Link</p>
              <div className="flex items-center gap-3 bg-black/30 rounded-lg p-4">
                <code className="text-emerald-400 text-sm md:text-base flex-1 break-all text-left">
                  {personalLink}
                </code>
                <button
                  onClick={copyLink}
                  className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-lg transition-all"
                  title="Copy link"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`/pemf/${generatedSlug}`}
                className="inline-flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-600/50 text-emerald-300 font-semibold px-6 py-3.5 rounded-lg transition-all"
              >
                View Your Page
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/pemf/portal"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3.5 rounded-lg transition-all"
              >
                Go to My Dashboard
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

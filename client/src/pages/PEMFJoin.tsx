import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Leaf, CheckCircle, Copy, ArrowRight } from "lucide-react";

export default function PEMFJoin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState("");

  const registerMutation = trpc.pemfAffiliate.register.useMutation({
    onSuccess: (data) => {
      setGeneratedSlug(data.slug);
      setSubmitted(true);
      toast.success("Welcome aboard! Your personalised PEMF page is ready.");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    registerMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
  };

  const personalLink = `${window.location.origin}/pemf/${generatedSlug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(personalLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-400" />
            <span className="text-white font-serif text-lg">Add Life to Your Years</span>
          </div>
          <span className="text-emerald-300/70 text-sm tracking-wider uppercase">Brand Partner Programme</span>
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

              <button
                type="submit"
                disabled={registerMutation.isPending}
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

            <a
              href={`/pemf/${generatedSlug}`}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3.5 rounded-lg transition-all"
            >
              View Your Page
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

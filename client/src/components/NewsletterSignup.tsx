import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

interface NewsletterSignupProps {
  /** The blog post slug — used to track where signups come from */
  sourceSlug?: string;
}

export default function NewsletterSignup({ sourceSlug = "" }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    subscribe.mutate({ email: email.trim(), sourceSlug });
  }

  if (submitted) {
    return (
      <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#0f2410] to-[#1a3a1c] border border-[#2a4a2c] p-8 text-center">
        <CheckCircle className="w-12 h-12 text-[#4ade80] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">You're subscribed!</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          A welcome email is on its way. You'll be the first to know when a new Supplementary Guide is published.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-14 rounded-2xl bg-gradient-to-br from-[#0f2410] to-[#1a3a1c] border border-[#2a4a2c] overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#4ade80] via-[#22c55e] to-[#16a34a]" />

      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-[#4ade80]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              Get new guides in your inbox
            </h3>
            <p className="text-gray-400 text-sm">
              Evidence-based wellness — no spam, unsubscribe anytime.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-[#071208] border border-[#1f3520] focus:border-[#4ade80]/60 focus:outline-none rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm transition-colors"
            disabled={subscribe.isPending}
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4ade80] hover:bg-[#22c55e] disabled:opacity-60 text-[#0a1a0c] font-bold rounded-xl text-sm transition-colors flex-shrink-0"
          >
            {subscribe.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing…
              </>
            ) : (
              "Subscribe"
            )}
          </button>
        </form>

        {error && (
          <p className="mt-3 text-red-400 text-sm">{error}</p>
        )}

        <p className="mt-4 text-gray-600 text-xs">
          By subscribing you agree to receive occasional wellness guides. No spam. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}

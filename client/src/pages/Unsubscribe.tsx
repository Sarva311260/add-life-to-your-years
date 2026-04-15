import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, Leaf } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Unsubscribe() {
  const token = new URLSearchParams(window.location.search).get("token") || "";
  const [done, setDone] = useState(false);
  const [leadName, setLeadName] = useState("");

  const unsubscribe = trpc.drip.unsubscribe.useMutation({
    onSuccess: (data) => { setDone(true); setLeadName(data.leadName); },
  });

  useEffect(() => {
    if (token) unsubscribe.mutate({ token });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex flex-col">
      <header className="bg-[#0a2e1a]/95 border-b border-emerald-800/30 py-3 px-6">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-serif">Add Life to Your Years</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          {unsubscribe.isPending && (
            <>
              <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
              <p className="text-white text-lg">Processing your request...</p>
            </>
          )}
          {done && (
            <>
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <h1 className="text-2xl font-serif text-white mb-2">You've been unsubscribed</h1>
              <p className="text-gray-300">
                {leadName ? `Hi ${leadName}, you` : "You"} will no longer receive automated emails from Add Life to Your Years.
              </p>
              <p className="text-gray-500 text-sm mt-4">
                If this was a mistake, please contact us directly.
              </p>
            </>
          )}
          {unsubscribe.isError && (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-serif text-white mb-2">Link not found</h1>
              <p className="text-gray-300">This unsubscribe link is invalid or has already been used.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

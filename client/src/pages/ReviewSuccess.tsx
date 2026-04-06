import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import {
  CheckCircle2, Loader2, Leaf, ArrowRight, XCircle,
} from "lucide-react";

export default function ReviewSuccess() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id") || "";
  const { isAuthenticated } = useAuth();

  const { data: verification, isLoading } = trpc.review.verifyPayment.useQuery(
    { sessionId },
    { enabled: isAuthenticated && !!sessionId, refetchInterval: 3000, retry: 3 }
  );

  if (!isAuthenticated) {
    window.location.href = getLoginUrl("/consult/review-success?session_id=" + sessionId);
    return null;
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container max-w-lg py-20 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold mb-2">Invalid Session</h2>
          <p className="text-muted-foreground mb-6">
            This payment link appears to be invalid. Please try again from your report page.
          </p>
          <Button onClick={() => navigate("/consult/history")}>
            View My Consultations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="container max-w-lg py-20">
        {isLoading ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        ) : verification?.success ? (
          <Card className="border-primary/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-3">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your payment has been confirmed. Sarva Keller will personally review your
                consultation report and add his notes, observations, and tailored recommendations.
                You'll be able to see them directly on your report page when they're ready.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                  <span>
                    Sarva typically completes reviews within 48 hours.
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/consult/history")}
                  className="gap-2"
                >
                  View My Consultations
                </Button>
                <Button
                  onClick={() => navigate("/consult")}
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Start New Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-10 h-10 text-muted-foreground animate-spin mx-auto mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">
                Processing Payment
              </h2>
              <p className="text-muted-foreground mb-4">
                {verification?.message || "Your payment is being processed. This page will update automatically."}
              </p>
              <Button variant="outline" onClick={() => navigate("/consult/history")}>
                View My Consultations
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

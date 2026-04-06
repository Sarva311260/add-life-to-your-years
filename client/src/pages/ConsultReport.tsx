import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, Printer, Loader2, Calendar,
  Leaf, MessageCircle, ShoppingBag, Star, CheckCircle2, Clock,
} from "lucide-react";

export default function ConsultReport() {
  const params = useParams<{ id: string }>();
  const consultationId = parseInt(params.id || "0", 10);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: report, isLoading } = trpc.consult.getReport.useQuery(
    { consultationId },
    { enabled: isAuthenticated && consultationId > 0 }
  );

  const { data: consultation } = trpc.consult.getById.useQuery(
    { id: consultationId },
    { enabled: isAuthenticated && consultationId > 0 }
  );

  const { data: reviewStatus } = trpc.review.getReviewStatus.useQuery(
    { reportId: report?.id || 0 },
    { enabled: isAuthenticated && !!report?.id }
  );

  const createCheckout = trpc.review.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.info("Redirecting to our secure payment page...");
        window.open(data.checkoutUrl, "_blank");
      }
      setIsCheckingOut(false);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
      setIsCheckingOut(false);
    },
  });

  const handleRequestReview = () => {
    if (!report) return;
    setIsCheckingOut(true);
    createCheckout.mutate({
      reportId: report.id,
      consultationId,
    });
  };

  if (!isAuthenticated) {
    window.location.href = getLoginUrl(`/consult/report/${consultationId}`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container max-w-2xl py-20 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-xl font-semibold mb-2">Report Not Ready</h2>
          <p className="text-muted-foreground mb-4">
            Your report may still be generating. Please check back in a moment.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(`/consult/session/${consultationId}`)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              View Consultation
            </Button>
            <Button variant="outline" onClick={() => navigate("/consult/history")}>
              View All Consultations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Top bar (hidden in print) */}
      <div className="print:hidden border-b bg-card">
        <div className="container py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/consult/history")}
            className="gap-1 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/shop")}
              className="gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Report content */}
      <div className="container max-w-3xl py-8">
        {/* Report header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-serif text-lg font-semibold text-primary">
              Add Life to Your Years
            </span>
          </div>
          <Badge variant="secondary" className="mb-4">
            {consultation?.consultType === "full_review"
              ? "Complete Wellness Review"
              : "Targeted Consultation"}
          </Badge>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {report.createdAt
              ? new Date(report.createdAt).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Date unavailable"}
          </div>
        </div>

        {/* Report body */}
        <Card>
          <CardContent className="p-6 md:p-10">
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg">
              <Streamdown>{report.content}</Streamdown>
            </div>
          </CardContent>
        </Card>

        {/* Sarva's personal notes (if review completed) */}
        {reviewStatus?.status === "completed" && reviewStatus.reviewNotes && (
          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="p-6 md:p-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <h3 className="font-serif text-lg font-semibold text-primary">
                  Personal Notes from Sarva Keller
                </h3>
              </div>
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-serif">
                <Streamdown>{reviewStatus.reviewNotes}</Streamdown>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Reviewed on{" "}
                {reviewStatus.reviewedAt
                  ? new Date(reviewStatus.reviewedAt).toLocaleDateString("en-AU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "recently"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personal Review Upsell (hidden in print) */}
        <div className="print:hidden mt-8">
          {!reviewStatus?.requested && (
            <Card className="border-amber-500/30 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/10">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Star className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      Want a Personal Review by Sarva?
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      While this AI-generated report draws on decades of wellness knowledge, nothing replaces
                      the insight of a seasoned practitioner. For a small fee, Sarva Keller will personally
                      review your report and add his own notes, observations, and tailored recommendations
                      based on his experience — things that only a human eye can catch.
                    </p>
                    <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Personal review of your full consultation report
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Additional notes and recommendations from Sarva
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        Insights drawn from 40+ years in the wellness field
                      </li>
                    </ul>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleRequestReview}
                        disabled={isCheckingOut}
                        className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
                        size="lg"
                      >
                        {isCheckingOut ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Preparing Checkout...
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4" />
                            Get Personal Review — US$27
                          </>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Secure payment via Stripe
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {reviewStatus?.status === "paid" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">
                  Personal Review In Progress
                </h3>
                <p className="text-muted-foreground">
                  Thank you for your payment. Sarva is reviewing your report and will add his personal
                  notes and recommendations. You'll be able to see them right here when they're ready.
                </p>
              </CardContent>
            </Card>
          )}

          {reviewStatus?.status === "in_review" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-serif text-lg font-semibold mb-2">
                  Sarva Is Reviewing Your Report
                </h3>
                <p className="text-muted-foreground">
                  Your report is currently being reviewed. Personal notes and additional recommendations
                  will appear above the report when complete.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
          <Button
            variant="outline"
            onClick={() => navigate(`/consult/session/${consultationId}`)}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Review Conversation
          </Button>
          <Button onClick={() => navigate("/consult")} className="gap-2">
            <Leaf className="w-4 h-4" />
            Start New Consultation
          </Button>
        </div>
      </div>
    </div>
  );
}

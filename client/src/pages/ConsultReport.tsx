import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import { Streamdown } from "streamdown";
import {
  ArrowLeft, FileText, Printer, Loader2, Calendar,
  Leaf, MessageCircle, ShoppingBag,
} from "lucide-react";

export default function ConsultReport() {
  const params = useParams<{ id: string }>();
  const consultationId = parseInt(params.id || "0", 10);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: report, isLoading } = trpc.consult.getReport.useQuery(
    { consultationId },
    { enabled: isAuthenticated && consultationId > 0 }
  );

  const { data: consultation } = trpc.consult.getById.useQuery(
    { id: consultationId },
    { enabled: isAuthenticated && consultationId > 0 }
  );

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

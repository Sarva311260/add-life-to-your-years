import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import {
  ArrowLeft, Plus, MessageCircle, FileText, Calendar,
  Loader2, ClipboardCheck, Stethoscope, Leaf,
} from "lucide-react";

export default function ConsultHistory() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: consultations, isLoading } = trpc.consult.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    window.location.href = getLoginUrl("/consult/history");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="container max-w-3xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/consult")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                Your Consultations
              </h1>
              <p className="text-sm text-muted-foreground">
                Review and revisit your wellness consultations
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/consult")} className="gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!consultations || consultations.length === 0) && (
          <div className="text-center py-20">
            <Leaf className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              No Consultations Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your first wellness consultation to receive personalised
              guidance based on your health situation.
            </p>
            <Button onClick={() => navigate("/consult")} className="gap-2">
              <Plus className="w-4 h-4" />
              Start Your First Consultation
            </Button>
          </div>
        )}

        {/* Consultation list */}
        {consultations && consultations.length > 0 && (
          <div className="space-y-3">
            {consultations.map((c) => (
              <Card
                key={c.id}
                className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
                onClick={() =>
                  c.status === "completed"
                    ? navigate(`/consult/report/${c.id}`)
                    : navigate(`/consult/session/${c.id}`)
                }
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        {c.consultType === "full_review" ? (
                          <ClipboardCheck className="w-5 h-5 text-primary" />
                        ) : (
                          <Stethoscope className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {c.consultType === "full_review"
                            ? "Complete Wellness Review"
                            : "Targeted Consultation"}
                        </h3>
                        {Array.isArray(c.selectedConditions) && c.selectedConditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(c.selectedConditions as string[]).slice(0, 3).map((cond: string) => (
                              <Badge key={cond} variant="secondary" className="text-xs">
                                {cond.replace(/_/g, " ")}
                              </Badge>
                            ))}
                            {(c.selectedConditions as string[]).length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                {`+${(c.selectedConditions as string[]).length - 3} more`}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleDateString("en-AU", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Unknown date"}
                          </span>
                          <span>Phase {c.currentPhase}/6</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={c.status === "completed" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {c.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                      {c.status === "completed" ? (
                        <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

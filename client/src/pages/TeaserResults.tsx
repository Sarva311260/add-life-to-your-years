import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CATEGORIES, getScoreLevel, getScoreLevelLabel, calculateOverallScore, hasCardiacFlag, getBMICategory } from "@shared/questionnaire";
import {
  ArrowRight, AlertTriangle, Leaf, Lock, Loader2,
  Target, TrendingUp, CheckCircle2, BarChart3, Sparkles, UserPlus
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";

const TEASER_STORAGE_KEY = "wellness-eval-teaser-data";
const STORAGE_KEY = "wellness-eval-responses";

interface TeaserData {
  responses: Record<string, number>;
  categoryScores: Record<string, number>;
  overallScore: number;
  cardiacFlag: boolean;
  demographics?: any;
  bmi?: { value: number; label: string; score: number } | null;
  timestamp: number;
}

function loadTeaserData(): TeaserData | null {
  try {
    const saved = localStorage.getItem(TEASER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Expire after 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed;
      }
      localStorage.removeItem(TEASER_STORAGE_KEY);
    }
  } catch {}
  return null;
}

export default function TeaserResults() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [teaserData, setTeaserData] = useState<TeaserData | null>(loadTeaserData);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitDone, setAutoSubmitDone] = useState(false);

  const submitMutation = trpc.evaluation.submit.useMutation();

  // If user is authenticated and we have teaser data, auto-submit to save the evaluation
  useEffect(() => {
    if (autoSubmitDone) return;
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (!teaserData) return;

    setAutoSubmitDone(true);
    setSubmitting(true);

    submitMutation.mutateAsync({
      responses: teaserData.responses,
      categoryScores: teaserData.categoryScores,
      demographics: teaserData.demographics || undefined,
    }).then((result) => {
      // Clear teaser data and questionnaire responses
      localStorage.removeItem(TEASER_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("wellness-eval-category-index");
      localStorage.removeItem("wellness-eval-pending-submit");
      localStorage.removeItem("wellness-eval-demographics");
      toast.success("Evaluation saved! Viewing your full results...");
      navigate(`/results/${result.evaluationId}`);
    }).catch((error) => {
      console.error("Auto-submit error:", error);
      toast.error("Failed to save evaluation. Please try again.");
      setSubmitting(false);
    });
  }, [authLoading, isAuthenticated, teaserData, autoSubmitDone]);

  // If no teaser data, redirect to questionnaire
  if (!teaserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Results Found</h2>
            <p className="text-muted-foreground mb-6">Complete the self-evaluation to see your wellness score.</p>
            <Link href="/questionnaire">
              <Button className="gap-2">
                Start Evaluation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If authenticated and submitting, show loading
  if (isAuthenticated && (submitting || !autoSubmitDone)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Saving your evaluation and generating personalised recommendations...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment.</p>
        </div>
      </div>
    );
  }

  const { overallScore, categoryScores, cardiacFlag } = teaserData;
  const scoreLevel = getScoreLevel(overallScore);
  const scoreLevelLabel = getScoreLevelLabel(overallScore);

  // Prepare blurred preview data
  const categoryPreviewData = CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    score: categoryScores[cat.id] ?? 0,
    level: getScoreLevel(categoryScores[cat.id] ?? 0),
  }));

  const strongCount = categoryPreviewData.filter((c) => c.level === "high").length;
  const growCount = categoryPreviewData.filter((c) => c.level === "medium").length;
  const attentionCount = categoryPreviewData.filter((c) => c.level === "low").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Leaf className="w-4 h-4 text-primary" />
              Health, Wellness & Vitality
            </button>
          </Link>
        </div>
      </div>

      <div className="container py-8 max-w-3xl mx-auto">
        {/* Overall Score — Visible */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Your Wellness Score
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Overall Wellness Score
          </h1>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Based on your responses across 8 health dimensions, here is your overall wellness assessment.
          </p>

          <div className="inline-flex flex-col items-center">
            <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 shadow-lg ${
              scoreLevel === "high" ? "border-green-500 bg-green-50" :
              scoreLevel === "medium" ? "border-orange-500 bg-orange-50" :
              "border-red-500 bg-red-50"
            }`}>
              <div>
                <div className={`text-4xl font-bold ${
                  scoreLevel === "high" ? "text-green-700" :
                  scoreLevel === "medium" ? "text-orange-700" :
                  "text-red-700"
                }`}>{Math.round(overallScore)}%</div>
                <div className="text-xs text-muted-foreground">Overall</div>
              </div>
            </div>
            <span className={`mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${
              scoreLevel === "high" ? "bg-green-100 text-green-700" :
              scoreLevel === "medium" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}>
              {scoreLevelLabel}
            </span>
          </div>

          {/* BMI Display — Visible */}
          {teaserData.bmi && (() => {
            const bmiInfo = getBMICategory(teaserData.bmi.value);
            return (
              <div className="mt-6 max-w-lg mx-auto">
                <Card className="border-border/60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                        bmiInfo.score >= 4 ? "bg-green-100" : bmiInfo.score >= 3 ? "bg-yellow-100" : "bg-red-100"
                      }`}>
                        <span className={`text-xl font-bold ${
                          bmiInfo.score >= 4 ? "text-green-700" : bmiInfo.score >= 3 ? "text-yellow-700" : "text-red-700"
                        }`}>{teaserData.bmi.value}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Body Mass Index (BMI)</p>
                        <p className={`text-sm font-medium ${
                          bmiInfo.score >= 4 ? "text-green-600" : bmiInfo.score >= 3 ? "text-yellow-600" : "text-red-600"
                        }`}>{bmiInfo.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {cardiacFlag && (
            <div className="mt-6 max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">Cardiac Health Flag</p>
                <p className="text-sm text-red-700 mt-1">
                  You indicated a personal or family history of heart disease. You might like to consider contacting your healthcare provider for appropriate screening and preventive care.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick summary stats — Visible */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{strongCount}</div>
              <div className="text-xs text-green-600 font-medium">Strong Areas</div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-700">{growCount}</div>
              <div className="text-xs text-orange-600 font-medium">Room to Grow</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{attentionCount}</div>
              <div className="text-xs text-red-600 font-medium">Needs Attention</div>
            </CardContent>
          </Card>
        </div>

        {/* Gated Content Preview — Blurred */}
        <div className="relative mb-10">
          {/* Blurred preview of charts */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Wellness Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-green-100/50 to-emerald-50/50 rounded-lg flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-green-300 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-2 border-dashed border-green-200 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-green-200/50" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Category Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 space-y-3">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-muted-foreground truncate">{cat.name}</div>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{ width: `${categoryScores[cat.id] ?? 50}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blurred category cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {CATEGORIES.map((cat) => (
                <Card key={cat.id}>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-1 truncate">{cat.name}</div>
                    <div className="text-2xl font-bold text-gray-400">??%</div>
                    <div className="text-xs mt-1 text-gray-400">Hidden</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Blurred recommendations */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-50">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/60 via-white/90 to-white/60 backdrop-blur-[1px]">
            <Card className="max-w-md w-full mx-4 shadow-xl border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Unlock Your Full Results
                </h2>
                <p className="text-muted-foreground mb-2">
                  Sign in or create a free account to access:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left max-w-xs mx-auto">
                  <li className="flex items-start gap-2">
                    <BarChart3 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Detailed scores for all 8 health dimensions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Interactive radar and bar charts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>AI-powered personalised recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Progress tracking dashboard over time</span>
                  </li>
                </ul>
                <a href={getLoginUrl("/teaser-results")}>
                  <Button size="lg" className="w-full gap-2 text-base">
                    <UserPlus className="w-5 h-5" />
                    Sign In or Register — It's Free
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground mt-3">
                  Your answers are saved and will be submitted automatically after sign-in.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pb-10">
          <Link href="/questionnaire">
            <Button variant="outline" className="gap-2">
              Retake Evaluation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

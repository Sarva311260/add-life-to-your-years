import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CATEGORIES, getScoreLevel, getScoreLevelLabel, getBMICategory } from "@shared/questionnaire";
import {
  ArrowLeft, Download, AlertTriangle, CheckCircle2, ArrowRight,
  Leaf, TrendingUp, Target, Loader2, FileDown
} from "lucide-react";
import { useLocation, useParams, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";

const PRIORITY_COLORS = {
  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-100 text-red-700" },
  medium: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  low: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "bg-green-100 text-green-700" },
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "PRIORITY FOCUS",
  medium: "ROOM TO GROW",
  low: "MAINTAIN",
};

const SCORE_COLORS = ["#ef4444", "#ef4444", "#f97316", "#f97316", "#22c55e", "#22c55e", "#16a34a", "#16a34a"];

export default function Results() {
  const params = useParams<{ id: string }>();
  const evaluationId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: evaluation, isLoading: evalLoading } = trpc.evaluation.getById.useQuery(
    { id: evaluationId },
    { enabled: evaluationId > 0 && isAuthenticated }
  );

  const { data: recommendations, isLoading: recsLoading } = trpc.evaluation.getRecommendations.useQuery(
    { evaluationId },
    { enabled: evaluationId > 0 && isAuthenticated }
  );

  const generatePDF = trpc.evaluation.generatePDF.useMutation();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
      return;
    }
    setGeneratingPdf(true);
    try {
      const result = await generatePDF.mutateAsync({ evaluationId });
      setPdfUrl(result.url);
      window.open(result.url, "_blank");
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In or Register</h2>
            <p className="text-muted-foreground mb-6">Please sign in or create a free account to view your evaluation results.</p>
            <a href={getLoginUrl()}>
              <Button className="gap-2">Sign In or Register</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evalLoading || recsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your results...</p>
          {recsLoading && !evalLoading && (
            <p className="text-sm text-muted-foreground mt-2">Generating personalised recommendations...</p>
          )}
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Evaluation Not Found</h2>
            <p className="text-muted-foreground mb-6">This evaluation may not exist or you may not have permission to view it.</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryScores = evaluation.categoryScores as Record<string, number>;
  const overallScore = parseFloat(evaluation.overallScore);
  const scoreLevel = getScoreLevel(overallScore);
  const scoreLevelLabel = getScoreLevelLabel(overallScore);

  const radarData = CATEGORIES.map((cat) => ({
    category: cat.name.split(" ")[0],
    fullName: cat.name,
    score: categoryScores[cat.id] ?? 0,
    fullMark: 100,
  }));

  const barData = CATEGORIES.map((cat, i) => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
    fullName: cat.name,
    score: categoryScores[cat.id] ?? 0,
    color: SCORE_COLORS[i],
  }));

  const sortedRecs = [...(recommendations || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
  });

  const handleExport = () => {
    const lines: string[] = [];
    lines.push("=== WELLNESS EVALUATION REPORT ===");
    lines.push(`Date: ${new Date(evaluation.completedAt).toLocaleDateString()}`);
    lines.push(`Overall Score: ${overallScore}% (${scoreLevelLabel})`);
    lines.push("");
    lines.push("--- CATEGORY SCORES ---");
    CATEGORIES.forEach((cat) => {
      const score = categoryScores[cat.id] ?? 0;
      lines.push(`${cat.name}: ${score}% (${getScoreLevelLabel(score)})`);
    });
    if (evaluation.cardiacFlag) {
      lines.push("");
      lines.push("⚠️ CARDIAC FLAG: Personal or family history of heart disease indicated.");
    }
    if (sortedRecs.length > 0) {
      lines.push("");
      lines.push("--- RECOMMENDATIONS ---");
      sortedRecs.forEach((rec, i) => {
        lines.push("");
        const exportLabel = PRIORITY_LABELS[rec.priority] || rec.priority.toUpperCase();
        lines.push(`${i + 1}. [${exportLabel}] ${rec.title}`);
        const catName = CATEGORIES.find((c) => c.id === rec.category)?.name || rec.category;
        lines.push(`   Category: ${catName}`);
        lines.push(`   ${rec.description}`);
        const steps = rec.actionSteps as string[];
        if (steps?.length) {
          lines.push("   Action Steps:");
          steps.forEach((step, j) => {
            lines.push(`     ${j + 1}. ${step}`);
          });
        }
      });
    }
    lines.push("");
    lines.push("=== END OF REPORT ===");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wellness-report-${new Date(evaluation.completedAt).toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="container py-8">
        {/* Overall Score */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Your Wellness Results</h1>
          <p className="text-muted-foreground mb-6">
            Completed on {new Date(evaluation.completedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="inline-flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
              scoreLevel === "high" ? "border-green-500 bg-green-50" :
              scoreLevel === "medium" ? "border-orange-500 bg-orange-50" :
              "border-red-500 bg-red-50"
            }`}>
              <div>
                <div className={`text-3xl font-bold ${
                  scoreLevel === "high" ? "text-green-700" :
                  scoreLevel === "medium" ? "text-orange-700" :
                  "text-red-700"
                }`}>{Math.round(overallScore)}%</div>
                <div className="text-xs text-muted-foreground">Overall</div>
              </div>
            </div>
            <span className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${
              scoreLevel === "high" ? "bg-green-100 text-green-700" :
              scoreLevel === "medium" ? "bg-orange-100 text-orange-700" :
              "bg-red-100 text-red-700"
            }`}>
              {scoreLevelLabel}
            </span>
          </div>

          {/* BMI Display */}
          {evaluation.bmi && (() => {
            const bmiVal = parseFloat(evaluation.bmi);
            const bmiInfo = getBMICategory(bmiVal);
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
                        }`}>{bmiVal}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Body Mass Index (BMI)</p>
                        <p className={`text-sm font-medium ${
                          bmiInfo.score >= 4 ? "text-green-600" : bmiInfo.score >= 3 ? "text-yellow-600" : "text-red-600"
                        }`}>{bmiInfo.label}</p>
                        {evaluation.gender && evaluation.age && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {evaluation.gender === "male" ? "Male" : "Female"}, Age {evaluation.age}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}

          {evaluation.cardiacFlag === 1 && (
            <div className="mt-6 max-w-lg mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-800">Cardiac Health Flag</p>
                <p className="text-sm text-red-700 mt-1">
                  You indicated a personal or family history of heart disease. You might like to consider contacting
                  your healthcare provider for appropriate screening and preventive care.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Wellness Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Score"]}
                    labelFormatter={(label: string) => {
                      const item = barData.find((d) => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 70 ? "#22c55e" : entry.score >= 40 ? "#f97316" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category score cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {CATEGORIES.map((cat) => {
            const score = categoryScores[cat.id] ?? 0;
            const level = getScoreLevel(score);
            return (
              <Card key={cat.id} className="border-border/60">
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-medium text-muted-foreground mb-1 truncate">{cat.name}</div>
                  <div className={`text-2xl font-bold ${
                    level === "high" ? "text-green-600" :
                    level === "medium" ? "text-orange-600" :
                    "text-red-600"
                  }`}>{score}%</div>
                  <div className={`text-xs mt-1 ${
                    level === "high" ? "text-green-600" :
                    level === "medium" ? "text-orange-600" :
                    "text-red-600"
                  }`}>{getScoreLevelLabel(score)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Personalised Recommendations
          </h2>
          <p className="text-sm text-muted-foreground mb-6 ml-8">
            Recommendations are grouped by action level: <span className="font-medium text-red-600">Priority Focus</span> areas need the most attention, <span className="font-medium text-orange-600">Room to Grow</span> areas have good potential for improvement, and <span className="font-medium text-green-600">Maintain</span> areas are already strong — keep up the great work.
          </p>

          {sortedRecs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Generating your personalised recommendations...</p>
                <p className="text-sm text-muted-foreground mt-2">This may take a moment. Refresh the page if needed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedRecs.map((rec, i) => {
                const colors = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low;
                const steps = rec.actionSteps as string[];
                return (
                  <Card key={rec.id} className={`${colors.bg} ${colors.border} border`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-muted-foreground">
                              {CATEGORIES.find((c) => c.id === rec.category)?.name || rec.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                              {PRIORITY_LABELS[rec.priority] || rec.priority.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                      {steps?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action Steps</p>
                          <ul className="space-y-1.5">
                            {steps.map((step, j) => (
                              <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {j + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pb-10">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleDownloadPDF}
            disabled={generatingPdf || sortedRecs.length === 0}
          >
            {generatingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {generatingPdf ? "Generating PDF..." : pdfUrl ? "Download PDF Report" : "Generate PDF Report"}
          </Button>
          <Link href="/questionnaire">
            <Button variant="outline" className="gap-2">
              Retake Evaluation
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2">
              View Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

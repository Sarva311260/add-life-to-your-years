import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CATEGORIES, getScoreLevel, getScoreLevelLabel, getBMICategory, getOptionsForQuestion } from "@shared/questionnaire";
import {
  ArrowLeft, Download, AlertTriangle, CheckCircle2,
  Leaf, TrendingUp, Target, Loader2
} from "lucide-react";
import { useLocation, useParams, Link } from "wouter";
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

export default function Report() {
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

  const handlePrint = () => {
    window.print();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In or Register</h2>
            <p className="text-muted-foreground mb-6">Please sign in or create a free account to view your evaluation report.</p>
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
          <p className="text-muted-foreground">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
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
  const responses = evaluation.responses as Record<string, number>;

  const radarData = CATEGORIES.map((cat) => ({
    category: cat.name.split(" ")[0],
    fullName: cat.name,
    score: categoryScores[cat.id] ?? 0,
    fullMark: 100,
  }));

  const barData = CATEGORIES.map((cat) => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
    fullName: cat.name,
    score: categoryScores[cat.id] ?? 0,
  }));

  const sortedRecs = [...(recommendations || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Print-hidden header with navigation and download */}
      <div className="bg-white border-b border-border/50 print:hidden">
        <div className="container py-4 flex items-center justify-between">
          <button onClick={() => navigate(`/results/${evaluationId}`)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>
          <Button onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />
            Download / Print PDF
          </Button>
        </div>
      </div>

      {/* Report Content — print-friendly */}
      <div className="container py-8 max-w-4xl mx-auto">
        {/* Report Header */}
        <div className="text-center mb-8 border-b border-border/50 pb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="font-serif text-3xl font-bold text-foreground">Wellness Evaluation Report</h1>
          </div>
          <p className="text-muted-foreground">
            Add Life to Your Years — Comprehensive Self-Evaluation
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Completed on {new Date(evaluation.completedAt).toLocaleDateString("en-AU", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          {evaluation.gender && evaluation.age && (
            <p className="text-sm text-muted-foreground mt-1">
              {evaluation.gender === "male" ? "Male" : "Female"}, Age {evaluation.age}
            </p>
          )}
        </div>

        {/* Overall Score */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-4">Overall Wellness Score</h2>
          <div className="inline-flex flex-col items-center">
            <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 ${
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
                <div className="text-sm text-muted-foreground">Overall</div>
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

          {/* BMI */}
          {evaluation.bmi && (() => {
            const bmiVal = parseFloat(evaluation.bmi);
            const bmiInfo = getBMICategory(bmiVal);
            return (
              <div className="mt-6 max-w-md mx-auto">
                <div className={`p-4 rounded-lg border flex items-center gap-4 ${
                  bmiInfo.score >= 4 ? "bg-green-50 border-green-200" : bmiInfo.score >= 3 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"
                }`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    bmiInfo.score >= 4 ? "bg-green-100" : bmiInfo.score >= 3 ? "bg-yellow-100" : "bg-red-100"
                  }`}>
                    <span className={`text-xl font-bold ${
                      bmiInfo.score >= 4 ? "text-green-700" : bmiInfo.score >= 3 ? "text-yellow-700" : "text-red-700"
                    }`}>{bmiVal}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Body Mass Index (BMI): {bmiInfo.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">A healthy BMI range is 18.5–24.9</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cardiac Flag */}
          {evaluation.cardiacFlag === 1 && (
            <div className="mt-6 max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
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
        <div className="grid md:grid-cols-2 gap-6 mb-8 print:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Wellness Radar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
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

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Category Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, "Score"]} />
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

        {/* Category Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 print:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const score = categoryScores[cat.id] ?? 0;
            const level = getScoreLevel(score);
            return (
              <div key={cat.id} className={`p-3 rounded-lg border text-center ${
                level === "high" ? "bg-green-50 border-green-200" :
                level === "medium" ? "bg-orange-50 border-orange-200" :
                "bg-red-50 border-red-200"
              }`}>
                <div className="text-xs font-medium text-muted-foreground mb-1 truncate">{cat.name}</div>
                <div className={`text-xl font-bold ${
                  level === "high" ? "text-green-600" :
                  level === "medium" ? "text-orange-600" :
                  "text-red-600"
                }`}>{score}%</div>
                <div className={`text-xs ${
                  level === "high" ? "text-green-600" :
                  level === "medium" ? "text-orange-600" :
                  "text-red-600"
                }`}>{getScoreLevelLabel(score)}</div>
              </div>
            );
          })}
        </div>

        {/* Individual Responses by Category */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Your Responses
          </h2>
          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="border border-border/60 rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border/60">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">{cat.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      getScoreLevel(categoryScores[cat.id] ?? 0) === "high" ? "bg-green-100 text-green-700" :
                      getScoreLevel(categoryScores[cat.id] ?? 0) === "medium" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {categoryScores[cat.id] ?? 0}% — {getScoreLevelLabel(categoryScores[cat.id] ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-border/40">
                  {cat.questions.map((q) => {
                    const responseVal = responses[q.id];
                    const options = getOptionsForQuestion(q);
                    const selectedOption = options.find(o => o.value === responseVal);
                    const maxVal = options.length > 0 ? Math.max(...options.map(o => o.value)) : 5;
                    return (
                      <div key={q.id} className="px-4 py-3">
                        <p className="text-sm text-foreground font-medium">{q.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground">
                            {selectedOption ? selectedOption.label : `Value: ${responseVal}`}
                          </p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            responseVal >= maxVal * 0.7 ? "bg-green-100 text-green-700" :
                            responseVal >= maxVal * 0.4 ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {responseVal}/{maxVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Personalised Recommendations
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            <span className="font-medium text-red-600">Priority Focus</span> areas need the most attention,{" "}
            <span className="font-medium text-orange-600">Room to Grow</span> areas have good potential,{" "}
            <span className="font-medium text-green-600">Maintain</span> areas are already strong.
          </p>

          {sortedRecs.length === 0 ? (
            <div className="p-6 text-center border border-border/60 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Generating recommendations... Refresh if needed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRecs.map((rec, i) => {
                const colors = PRIORITY_COLORS[rec.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.low;
                const steps = rec.actionSteps as string[];
                return (
                  <div key={rec.id} className={`p-5 rounded-lg border ${colors.bg} ${colors.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {CATEGORIES.find((c) => c.id === rec.category)?.name || rec.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                        {PRIORITY_LABELS[rec.priority] || rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    {steps?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Action Steps</p>
                        <ol className="space-y-1.5">
                          {steps.map((step, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center border-t border-border/50 pt-6 pb-8">
          <p className="text-xs text-muted-foreground">
            This report was generated by the Add Life to Your Years Self-Evaluation platform.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            For personalised coaching and guidance, visit our website or contact us directly.
          </p>
        </div>

        {/* Print-hidden bottom actions */}
        <div className="flex justify-center gap-4 pb-8 print:hidden">
          <Button onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />
            Download / Print PDF
          </Button>
          <Link href={`/results/${evaluationId}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

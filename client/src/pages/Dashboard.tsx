import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CATEGORIES, getScoreLevel, getScoreLevelLabel } from "@shared/questionnaire";
import {
  ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Minus,
  Leaf, Calendar, BarChart3, Target, Loader2, LogOut, User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const CATEGORY_COLORS = [
  "#4CAF50", "#2196F3", "#FF9800", "#9C27B0",
  "#00BCD4", "#E91E63", "#8BC34A", "#FF5722",
];

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: evaluations, isLoading } = trpc.evaluation.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50/30 to-white">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In to Access Dashboard</h2>
            <p className="text-muted-foreground mb-6">Track your wellness journey by signing in.</p>
            <a href={getLoginUrl()}>
              <Button className="gap-2">Sign In or Register</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedEvals = [...(evaluations || [])].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const latestEval = sortedEvals.length > 0 ? sortedEvals[sortedEvals.length - 1] : null;
  const previousEval = sortedEvals.length > 1 ? sortedEvals[sortedEvals.length - 2] : null;

  const latestScores = latestEval ? (latestEval.categoryScores as Record<string, number>) : {};
  const previousScores = previousEval ? (previousEval.categoryScores as Record<string, number>) : {};
  const latestOverall = latestEval ? parseFloat(latestEval.overallScore) : 0;
  const previousOverall = previousEval ? parseFloat(previousEval.overallScore) : 0;
  const overallChange = previousEval ? latestOverall - previousOverall : 0;

  // Trend data for line chart
  const trendData = sortedEvals.map((ev) => {
    const scores = ev.categoryScores as Record<string, number>;
    const point: Record<string, unknown> = {
      date: new Date(ev.completedAt).toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
      overall: parseFloat(ev.overallScore),
    };
    CATEGORIES.forEach((cat) => {
      point[cat.id] = scores[cat.id] ?? 0;
    });
    return point;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-serif font-semibold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              {user?.name || "User"}
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-muted-foreground">
            {evaluations?.length
              ? `You have completed ${evaluations.length} evaluation${evaluations.length > 1 ? "s" : ""}. Here's your wellness overview.`
              : "Start your first evaluation to begin tracking your wellness journey."}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !evaluations?.length ? (
          /* Empty state */
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-primary/30 mx-auto mb-6" />
              <h2 className="text-xl font-bold text-foreground mb-3">No Evaluations Yet</h2>
              <p className="text-muted-foreground mb-8">
                Take your first self-evaluation to establish your baseline wellness profile
                and start tracking your progress.
              </p>
              <Link href="/questionnaire">
                <Button size="lg" className="gap-2">
                  Start Your First Evaluation
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall score + change */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-1">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Current Overall Score</div>
                  <div className={`text-5xl font-bold ${
                    getScoreLevel(latestOverall) === "high" ? "text-green-600" :
                    getScoreLevel(latestOverall) === "medium" ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {Math.round(latestOverall)}%
                  </div>
                  <div className={`text-sm mt-1 ${
                    getScoreLevel(latestOverall) === "high" ? "text-green-600" :
                    getScoreLevel(latestOverall) === "medium" ? "text-orange-600" :
                    "text-red-600"
                  }`}>
                    {getScoreLevelLabel(latestOverall)}
                  </div>
                  {previousEval && (
                    <div className={`flex items-center justify-center gap-1 mt-3 text-sm ${
                      overallChange > 0 ? "text-green-600" : overallChange < 0 ? "text-red-600" : "text-muted-foreground"
                    }`}>
                      {overallChange > 0 ? <TrendingUp className="w-4 h-4" /> :
                       overallChange < 0 ? <TrendingDown className="w-4 h-4" /> :
                       <Minus className="w-4 h-4" />}
                      {overallChange > 0 ? "+" : ""}{Math.round(overallChange)}% from last
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Total Evaluations</div>
                  <div className="text-5xl font-bold text-primary">{evaluations.length}</div>
                  <div className="text-sm text-muted-foreground mt-1">completed</div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Last Evaluation</div>
                  <div className="text-lg font-bold text-foreground">
                    {latestEval ? new Date(latestEval.completedAt).toLocaleDateString("en-AU", {
                      month: "short", day: "numeric", year: "numeric"
                    }) : "N/A"}
                  </div>
                  <Link href="/questionnaire">
                    <Button size="sm" variant="outline" className="mt-3 gap-2">
                      New Evaluation
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Category scores with change indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map((cat) => {
                const score = latestScores[cat.id] ?? 0;
                const prevScore = previousScores[cat.id];
                const change = prevScore !== undefined ? score - prevScore : undefined;
                const level = getScoreLevel(score);

                return (
                  <Card key={cat.id} className="border-border/60">
                    <CardContent className="p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-1 truncate">{cat.name}</div>
                      <div className="flex items-end justify-between">
                        <div className={`text-2xl font-bold ${
                          level === "high" ? "text-green-600" :
                          level === "medium" ? "text-orange-600" :
                          "text-red-600"
                        }`}>{score}%</div>
                        {change !== undefined && change !== 0 && (
                          <div className={`flex items-center gap-0.5 text-xs ${
                            change > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {change > 0 ? "+" : ""}{change}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Trend chart */}
            {trendData.length > 1 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Progress Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="overall"
                        name="Overall"
                        stroke="#1a1a1a"
                        strokeWidth={3}
                        dot={{ fill: "#1a1a1a", r: 4 }}
                      />
                      {CATEGORIES.map((cat, i) => (
                        <Line
                          key={cat.id}
                          type="monotone"
                          dataKey={cat.id}
                          name={cat.name}
                          stroke={CATEGORY_COLORS[i]}
                          strokeWidth={1.5}
                          dot={{ fill: CATEGORY_COLORS[i], r: 3 }}
                          strokeDasharray={i % 2 === 0 ? undefined : "5 5"}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Evaluation History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Evaluation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...(evaluations || [])].sort(
                    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
                  ).map((ev) => {
                    const score = parseFloat(ev.overallScore);
                    const level = getScoreLevel(score);
                    return (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/results/${ev.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            level === "high" ? "bg-green-100 text-green-700" :
                            level === "medium" ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {Math.round(score)}%
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {new Date(ev.completedAt).toLocaleDateString("en-AU", {
                                weekday: "long", year: "numeric", month: "long", day: "numeric"
                              })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getScoreLevelLabel(score)}
                              {ev.cardiacFlag === 1 && (
                                <span className="ml-2 text-red-600 text-xs">⚠ Cardiac flag</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

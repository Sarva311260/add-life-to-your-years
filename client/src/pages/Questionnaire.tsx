import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CATEGORIES, getOptionsForQuestion, calculateCategoryScore } from "@shared/questionnaire";
import {
  Heart, Building2, Dna, Shield, Brain, Compass, Users, Activity,
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Leaf, Loader2
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lifestyle: <Heart className="w-5 h-5" />,
  environmental: <Building2 className="w-5 h-5" />,
  genetic: <Dna className="w-5 h-5" />,
  structural: <Shield className="w-5 h-5" />,
  stress: <Brain className="w-5 h-5" />,
  purpose: <Compass className="w-5 h-5" />,
  relationships: <Users className="w-5 h-5" />,
  physical_trauma: <Activity className="w-5 h-5" />,
};

export default function Questionnaire() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const submitMutation = trpc.evaluation.submit.useMutation();

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const totalQuestions = CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);

  const currentCategoryAnswered = useMemo(() => {
    return currentCategory.questions.filter((q) => responses[q.id] !== undefined).length;
  }, [currentCategory, responses]);

  const isCurrentCategoryComplete = currentCategoryAnswered === currentCategory.questions.length;

  const categoryScores = useMemo(() => {
    const scores: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      const catResponses = cat.questions
        .map((q) => responses[q.id])
        .filter((v): v is number => v !== undefined);
      if (catResponses.length === cat.questions.length) {
        scores[cat.id] = calculateCategoryScore(catResponses);
      }
    });
    return scores;
  }, [responses]);

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save your evaluation.");
      window.location.href = getLoginUrl();
      return;
    }

    // Check all questions are answered
    const unanswered = CATEGORIES.flatMap((cat) =>
      cat.questions.filter((q) => responses[q.id] === undefined)
    );
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitMutation.mutateAsync({
        responses,
        categoryScores,
      });
      toast.success("Evaluation submitted successfully!");
      navigate(`/results/${result.evaluationId}`);
    } catch (error) {
      toast.error("Failed to submit evaluation. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const allComplete = Object.keys(categoryScores).length === CATEGORIES.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-medium">{answeredQuestions}/{totalQuestions} answered</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Category sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
              {CATEGORIES.map((cat, i) => {
                const catAnswered = cat.questions.filter((q) => responses[q.id] !== undefined).length;
                const catComplete = catAnswered === cat.questions.length;
                const isCurrent = i === currentCategoryIndex;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : catComplete
                        ? "text-foreground hover:bg-accent"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="flex-shrink-0">{CATEGORY_ICONS[cat.id]}</span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    {catComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {catAnswered}/{cat.questions.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile category selector */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {CATEGORIES.map((cat, i) => {
                const catAnswered = cat.questions.filter((q) => responses[q.id] !== undefined).length;
                const catComplete = catAnswered === cat.questions.length;
                const isCurrent = i === currentCategoryIndex;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryIndex(i)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-primary text-white"
                        : catComplete
                        ? "bg-primary/10 text-primary"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {catComplete && <CheckCircle2 className="w-3 h-3" />}
                    {cat.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions area */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      {CATEGORY_ICONS[currentCategory.id]}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{currentCategory.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        Category {currentCategoryIndex + 1} of {CATEGORIES.length}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-2">{currentCategory.description}</p>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  {currentCategory.questions.map((question, qi) => {
                    const options = getOptionsForQuestion(question);
                    const selectedValue = responses[question.id];

                    return (
                      <Card key={question.id} className={`border transition-all ${selectedValue !== undefined ? "border-primary/30 bg-primary/[0.02]" : "border-border/60"}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                              {qi + 1}
                            </span>
                            <div>
                              <h3 className="font-medium text-foreground leading-snug">{question.text}</h3>
                              {question.description && (
                                <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                              )}
                              {question.isFlag && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  This question may trigger a cardiac health flag
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2 ml-10">
                            {options.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => handleAnswer(question.id, option.value)}
                                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                                  selectedValue === option.value
                                    ? "border-primary bg-primary/10 text-primary font-medium"
                                    : "border-border/60 hover:border-primary/30 hover:bg-accent/50 text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                    selectedValue === option.value ? "border-primary" : "border-muted-foreground/30"
                                  }`}>
                                    {selectedValue === option.value && (
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                  </div>
                                  {option.label}
                                </div>
                              </button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentCategoryIndex === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {currentCategoryAnswered}/{currentCategory.questions.length} answered
                  </div>

                  {currentCategoryIndex < CATEGORIES.length - 1 ? (
                    <Button onClick={handleNext} className="gap-2">
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allComplete || submitting}
                      className="gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Evaluation
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Sign-in prompt for unauthenticated users */}
                {!authLoading && !isAuthenticated && (
                  <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                    <p className="text-sm text-orange-800 mb-3">
                      Sign in to save your evaluation results and track your progress over time.
                    </p>
                    <a href={getLoginUrl()}>
                      <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                        Sign In to Save Results
                      </Button>
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

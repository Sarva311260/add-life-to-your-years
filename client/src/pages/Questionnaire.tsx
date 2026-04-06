import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  CATEGORIES, getOptionsForQuestion, calculateCategoryScore, calculateOverallScore,
  hasCardiacFlag, calculateBMI, getBMICategory,
  type Demographics,
} from "@shared/questionnaire";
import {
  Heart, Building2, Dna, Shield, Brain, Compass, Users, Activity,
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Leaf, Loader2, User
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STORAGE_KEY = "wellness-eval-responses";
const CATEGORY_INDEX_KEY = "wellness-eval-category-index";
const TEASER_STORAGE_KEY = "wellness-eval-teaser-data";
const DEMOGRAPHICS_KEY = "wellness-eval-demographics";

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

function loadSavedResponses(): Record<string, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    }
  } catch {}
  return {};
}

function loadSavedDemographics(): Partial<Demographics> {
  try {
    const saved = localStorage.getItem(DEMOGRAPHICS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure unit defaults are always set
      if (!parsed.heightUnit) parsed.heightUnit = "metric";
      if (!parsed.weightUnit) parsed.weightUnit = "metric";
      return parsed;
    }
  } catch {}
  return { heightUnit: "metric", weightUnit: "metric" };
}

// Step index: -1 = demographics, 0..N = category indices
export default function Questionnaire() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const redirectTo = new URLSearchParams(searchString).get("redirect");

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem(CATEGORY_INDEX_KEY);
      if (saved) {
        const idx = parseInt(saved, 10);
        if (!isNaN(idx) && idx >= -1 && idx < CATEGORIES.length) return idx;
      }
    } catch {}
    return -1; // Start at demographics
  });

  const [responses, setResponses] = useState<Record<string, number>>(loadSavedResponses);
  const [demographics, setDemographics] = useState<Partial<Demographics>>(loadSavedDemographics);
  const [submitting, setSubmitting] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);

  const submitMutation = trpc.evaluation.submit.useMutation();

  // Persist responses
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    }
  }, [responses]);

  // Persist demographics
  useEffect(() => {
    if (Object.keys(demographics).length > 0) {
      localStorage.setItem(DEMOGRAPHICS_KEY, JSON.stringify(demographics));
    }
  }, [demographics]);

  // Persist step
  useEffect(() => {
    localStorage.setItem(CATEGORY_INDEX_KEY, String(currentStep));
  }, [currentStep]);

  const totalQuestions = CATEGORIES.reduce((sum, cat) => sum + cat.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  const demographicsComplete = !!(demographics.gender && demographics.age &&
    ((demographics.heightUnit === "metric" && demographics.heightCm) ||
     (demographics.heightUnit === "imperial" && demographics.heightFt)) &&
    ((demographics.weightUnit === "metric" && demographics.weightKg) ||
     (demographics.weightUnit === "imperial" && demographics.weightLbs)));

  // Progress: demographics counts as 1 step, then questions
  const totalSteps = totalQuestions + 1; // +1 for demographics
  const completedSteps = (demographicsComplete ? 1 : 0) + answeredQuestions;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  const currentCategory = currentStep >= 0 ? CATEGORIES[currentStep] : null;

  const currentCategoryAnswered = useMemo(() => {
    if (!currentCategory) return 0;
    return currentCategory.questions.filter((q) => responses[q.id] !== undefined).length;
  }, [currentCategory, responses]);

  const categoryScores = useMemo(() => {
    const scores: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      const catResponses = cat.questions
        .map((q) => responses[q.id])
        .filter((v): v is number => v !== undefined);
      if (catResponses.length === cat.questions.length) {
        const weights = cat.questions.map((q) => q.weight ?? 1.0);
        const maxValues = cat.questions.map((q) => {
          const opts = getOptionsForQuestion(q);
          return opts.length > 0 ? Math.max(...opts.map(o => o.value)) : 5;
        });
        scores[cat.id] = calculateCategoryScore(catResponses, weights, maxValues);
      }
    });
    return scores;
  }, [responses]);

  const firstIncompleteCategory = useMemo(() => {
    return CATEGORIES.findIndex((cat) => {
      const answered = cat.questions.filter((q) => responses[q.id] !== undefined).length;
      return answered < cat.questions.length;
    });
  }, [responses]);

  const handleAnswer = useCallback((questionId: string, value: number) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = () => {
    if (currentStep === -1) {
      // Validate demographics before proceeding
      if (!demographicsComplete) {
        toast.error("Please complete all demographic fields before continuing.");
        return;
      }
      setCurrentStep(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep < CATEGORIES.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > -1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Calculate BMI from demographics
  const bmiResult = useMemo(() => {
    if (!demographicsComplete) return null;
    const bmi = calculateBMI(demographics as Demographics);
    if (!bmi) return null;
    return { value: bmi, ...getBMICategory(bmi) };
  }, [demographics, demographicsComplete]);

  // Factor BMI into lifestyle category score
  const adjustedCategoryScores = useMemo(() => {
    const adjusted = { ...categoryScores };
    if (bmiResult && adjusted.lifestyle !== undefined) {
      // BMI score (1-5) contributes as an additional question to lifestyle
      const lifestyleCat = CATEGORIES.find((c) => c.id === "lifestyle");
      if (lifestyleCat) {
        const catResponses = lifestyleCat.questions
          .map((q) => responses[q.id])
          .filter((v): v is number => v !== undefined);
        // Add BMI score to the responses
        const allScores = [...catResponses, bmiResult.score];
        adjusted.lifestyle = Math.round((allScores.reduce((a, b) => a + b, 0) / (allScores.length * 5)) * 100);
      }
    }
    return adjusted;
  }, [categoryScores, bmiResult, responses]);

  const handleSubmit = async () => {
    // Check demographics
    if (!demographicsComplete) {
      setShowIncomplete(true);
      setCurrentStep(-1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.error("Please complete the demographic information.");
      return;
    }

    // Check all questions are answered
    const unanswered = CATEGORIES.flatMap((cat) =>
      cat.questions.filter((q) => responses[q.id] === undefined)
    );
    if (unanswered.length > 0) {
      setShowIncomplete(true);
      if (firstIncompleteCategory >= 0) {
        setCurrentStep(firstIncompleteCategory);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      toast.error(`Please answer all questions. ${unanswered.length} question${unanswered.length > 1 ? "s" : ""} remaining.`);
      return;
    }

    // If NOT authenticated, calculate scores client-side and go to teaser results
    if (!isAuthenticated) {
      const overallScore = calculateOverallScore(adjustedCategoryScores);
      const cardiacFlag = hasCardiacFlag(responses);

      const teaserData = {
        responses,
        categoryScores: adjustedCategoryScores,
        overallScore,
        cardiacFlag,
        demographics,
        bmi: bmiResult,
        timestamp: Date.now(),
      };
      localStorage.setItem(TEASER_STORAGE_KEY, JSON.stringify(teaserData));
      navigate("/teaser-results");
      return;
    }

    // If authenticated, submit directly to the server
    setSubmitting(true);
    try {
      const result = await submitMutation.mutateAsync({
        responses,
        categoryScores: adjustedCategoryScores,
        demographics: demographics as Demographics,
      });
      // Clear saved data on successful submit
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CATEGORY_INDEX_KEY);
      localStorage.removeItem(DEMOGRAPHICS_KEY);
      localStorage.removeItem("wellness-eval-pending-submit");
      localStorage.removeItem(TEASER_STORAGE_KEY);
      toast.success("Evaluation submitted successfully!");
      if (redirectTo === "consult") {
        toast.info("Evaluation complete! Taking you back to your consultation...");
        navigate("/consult");
      } else {
        navigate(`/results/${result.evaluationId}`);
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      const errorMessage = error?.message || "Unknown error";
      toast.error(`Failed to submit evaluation: ${errorMessage}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const allComplete = Object.keys(categoryScores).length === CATEGORIES.length;

  const handleClearResponses = () => {
    setResponses({});
    setDemographics({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CATEGORY_INDEX_KEY);
    localStorage.removeItem(DEMOGRAPHICS_KEY);
    localStorage.removeItem("wellness-eval-pending-submit");
    localStorage.removeItem(TEASER_STORAGE_KEY);
    setCurrentStep(-1);
    setShowIncomplete(false);
    toast.success("All responses cleared. Start fresh!");
  };

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
            <div className="flex items-center gap-3 text-sm">
              {(answeredQuestions > 0 || Object.keys(demographics).length > 0) && (
                <button
                  onClick={handleClearResponses}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
              )}
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                <span className="font-medium">{completedSteps}/{totalSteps} completed</span>
              </div>
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
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Sections</h3>

              {/* Demographics entry */}
              <button
                onClick={() => setCurrentStep(-1)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                  currentStep === -1
                    ? "bg-primary/10 text-primary font-medium"
                    : demographicsComplete
                    ? "text-foreground hover:bg-accent"
                    : showIncomplete
                    ? "text-red-600 bg-red-50/50 hover:bg-red-50"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 truncate">About You</span>
                {demographicsComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                ) : showIncomplete ? (
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                ) : null}
              </button>

              {CATEGORIES.map((cat, i) => {
                const catAnswered = cat.questions.filter((q) => responses[q.id] !== undefined).length;
                const catComplete = catAnswered === cat.questions.length;
                const isCurrent = i === currentStep;
                const hasIncomplete = showIncomplete && !catComplete;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentStep(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : catComplete
                        ? "text-foreground hover:bg-accent"
                        : hasIncomplete
                        ? "text-red-600 bg-red-50/50 hover:bg-red-50"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="flex-shrink-0">{CATEGORY_ICONS[cat.id]}</span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    {catComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    ) : hasIncomplete ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
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

          {/* Mobile section selector */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              <button
                onClick={() => setCurrentStep(-1)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                  currentStep === -1
                    ? "bg-primary text-white"
                    : demographicsComplete
                    ? "bg-primary/10 text-primary"
                    : showIncomplete
                    ? "bg-red-100 text-red-600"
                    : "bg-accent text-muted-foreground"
                }`}
              >
                {demographicsComplete ? <CheckCircle2 className="w-3 h-3" /> : null}
                About You
              </button>
              {CATEGORIES.map((cat, i) => {
                const catAnswered = cat.questions.filter((q) => responses[q.id] !== undefined).length;
                const catComplete = catAnswered === cat.questions.length;
                const isCurrent = i === currentStep;
                const hasIncomplete = showIncomplete && !catComplete;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentStep(i)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-primary text-white"
                        : catComplete
                        ? "bg-primary/10 text-primary"
                        : hasIncomplete
                        ? "bg-red-100 text-red-600"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {catComplete ? <CheckCircle2 className="w-3 h-3" /> : hasIncomplete ? <AlertTriangle className="w-3 h-3" /> : null}
                    {cat.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content area */}
          <div>
            <AnimatePresence mode="wait">
              {currentStep === -1 ? (
                <motion.div
                  key="demographics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DemographicsForm
                    demographics={demographics}
                    setDemographics={setDemographics}
                    bmiResult={bmiResult}
                    showIncomplete={showIncomplete}
                  />

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <div />
                    <Button onClick={handleNext} className="gap-2">
                      Next: {CATEGORIES[0].name}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : currentCategory ? (
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
                          Category {currentStep + 1} of {CATEGORIES.length}
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
                      const isUnanswered = showIncomplete && selectedValue === undefined;

                      return (
                        <Card key={question.id} className={`border transition-all ${
                          selectedValue !== undefined
                            ? "border-primary/30 bg-primary/[0.02]"
                            : isUnanswered
                            ? "border-red-300 bg-red-50/30 ring-1 ring-red-200"
                            : "border-border/60"
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                              <span className={`flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center ${
                                isUnanswered
                                  ? "bg-red-100 text-red-600"
                                  : "bg-primary/10 text-primary"
                              }`}>
                                {qi + 1}
                              </span>
                              <div>
                                <h3 className="font-medium text-foreground leading-snug">{question.text}</h3>
                                {question.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{question.description}</p>
                                )}
                                {isUnanswered && (
                                  <p className="text-xs text-red-500 mt-1 font-medium">Please answer this question</p>
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
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      {currentCategoryAnswered}/{currentCategory.questions.length} answered
                    </div>

                    {currentStep < CATEGORIES.length - 1 ? (
                      <Button onClick={handleNext} className="gap-2">
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          onClick={handleSubmit}
                          disabled={submitting}
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
                        {!allComplete && (
                          <p className="text-xs text-orange-600 font-medium">
                            {totalQuestions - answeredQuestions} question{totalQuestions - answeredQuestions > 1 ? "s" : ""} still unanswered
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sign-in prompt for unauthenticated users */}
                  {!authLoading && !isAuthenticated && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <p className="text-sm text-orange-800 mb-3">
                        Sign in or register to save your evaluation results and track your progress over time.
                      </p>
                      <a href={getLoginUrl("/questionnaire")}>
                        <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                          Sign In or Register
                        </Button>
                      </a>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Demographics Form Component ----

interface DemographicsFormProps {
  demographics: Partial<Demographics>;
  setDemographics: React.Dispatch<React.SetStateAction<Partial<Demographics>>>;
  bmiResult: { value: number; label: string; score: number } | null;
  showIncomplete: boolean;
}

function DemographicsForm({ demographics, setDemographics, bmiResult, showIncomplete }: DemographicsFormProps) {
  const update = (field: string, value: any) => {
    setDemographics((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">About You</h2>
            <p className="text-sm text-muted-foreground">Basic information to personalise your evaluation</p>
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          This information helps us calculate your <strong>BMI (Body Mass Index)</strong> and provide more personalised wellness recommendations. BMI is a simple measure that uses your height and weight to estimate whether your body weight is within a healthy range. It is widely used as a general indicator of overall health.
        </p>
      </div>

      <div className="space-y-6">
        {/* First Name */}
        <Card className={`border transition-all ${demographics.firstName ? "border-primary/30 bg-primary/[0.02]" : "border-border/60"}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center bg-primary/10 text-primary">&#9733;</span>
              <div>
                <h3 className="font-medium text-foreground leading-snug">What's your first name?</h3>
                <p className="text-xs text-muted-foreground mt-1">This helps us personalise your results and consultation</p>
              </div>
            </div>
            <div className="ml-10">
              <input
                type="text"
                value={demographics.firstName || ""}
                onChange={(e) => update("firstName", e.target.value)}
                placeholder="Your first name"
                className="w-full max-w-xs px-4 py-3 rounded-lg border border-border/60 text-sm bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Gender */}
        <Card className={`border transition-all ${demographics.gender ? "border-primary/30 bg-primary/[0.02]" : showIncomplete && !demographics.gender ? "border-red-300 bg-red-50/30 ring-1 ring-red-200" : "border-border/60"}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center ${
                showIncomplete && !demographics.gender ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
              }`}>1</span>
              <div>
                <h3 className="font-medium text-foreground leading-snug">What is your gender?</h3>
                {showIncomplete && !demographics.gender && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Please select your gender</p>
                )}
              </div>
            </div>
            <div className="space-y-2 ml-10">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => update("gender", g)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    demographics.gender === g
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30 hover:bg-accent/50 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      demographics.gender === g ? "border-primary" : "border-muted-foreground/30"
                    }`}>
                      {demographics.gender === g && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    {g === "male" ? "Male" : "Female"}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age */}
        <Card className={`border transition-all ${demographics.age ? "border-primary/30 bg-primary/[0.02]" : showIncomplete && !demographics.age ? "border-red-300 bg-red-50/30 ring-1 ring-red-200" : "border-border/60"}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center ${
                showIncomplete && !demographics.age ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
              }`}>2</span>
              <div>
                <h3 className="font-medium text-foreground leading-snug">What is your age?</h3>
                {showIncomplete && !demographics.age && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Please enter your age</p>
                )}
              </div>
            </div>
            <div className="ml-10">
              <input
                type="number"
                min={1}
                max={150}
                value={demographics.age || ""}
                onChange={(e) => update("age", e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter your age"
                className="w-full max-w-[200px] px-4 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Height */}
        <Card className={`border transition-all ${
          (demographics.heightUnit === "metric" && demographics.heightCm) || (demographics.heightUnit === "imperial" && demographics.heightFt)
            ? "border-primary/30 bg-primary/[0.02]"
            : showIncomplete ? "border-red-300 bg-red-50/30 ring-1 ring-red-200" : "border-border/60"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center bg-primary/10 text-primary">3</span>
              <h3 className="font-medium text-foreground leading-snug">What is your height?</h3>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => update("heightUnit", "metric")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    demographics.heightUnit === "metric" || !demographics.heightUnit
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30 text-foreground"
                  }`}
                >
                  Metric (cm)
                </button>
                <button
                  onClick={() => update("heightUnit", "imperial")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    demographics.heightUnit === "imperial"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30 text-foreground"
                  }`}
                >
                  Imperial (ft/in)
                </button>
              </div>
              {demographics.heightUnit === "imperial" ? (
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={demographics.heightFt || ""}
                      onChange={(e) => update("heightFt", e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Feet"
                      className="w-20 px-3 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <span className="text-sm text-muted-foreground">ft</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={demographics.heightIn ?? ""}
                      onChange={(e) => update("heightIn", e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Inches"
                      className="w-20 px-3 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                    <span className="text-sm text-muted-foreground">in</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={50}
                    max={300}
                    value={demographics.heightCm || ""}
                    onChange={(e) => update("heightCm", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Height in cm"
                    className="w-32 px-3 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">cm</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weight */}
        <Card className={`border transition-all ${
          (demographics.weightUnit === "metric" && demographics.weightKg) || (demographics.weightUnit === "imperial" && demographics.weightLbs)
            ? "border-primary/30 bg-primary/[0.02]"
            : showIncomplete ? "border-red-300 bg-red-50/30 ring-1 ring-red-200" : "border-border/60"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full text-sm font-semibold flex items-center justify-center bg-primary/10 text-primary">4</span>
              <h3 className="font-medium text-foreground leading-snug">What is your weight?</h3>
            </div>
            <div className="ml-10 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => update("weightUnit", "metric")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    demographics.weightUnit === "metric" || !demographics.weightUnit
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30 text-foreground"
                  }`}
                >
                  Metric (kg)
                </button>
                <button
                  onClick={() => update("weightUnit", "imperial")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                    demographics.weightUnit === "imperial"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border/60 hover:border-primary/30 text-foreground"
                  }`}
                >
                  Imperial (lbs)
                </button>
              </div>
              {demographics.weightUnit === "imperial" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={20}
                    max={700}
                    value={demographics.weightLbs || ""}
                    onChange={(e) => update("weightLbs", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Weight in lbs"
                    className="w-32 px-3 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">lbs</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={demographics.weightKg || ""}
                    onChange={(e) => update("weightKg", e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Weight in kg"
                    className="w-32 px-3 py-3 rounded-lg border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* BMI Preview */}
        {bmiResult && (
          <Card className="border border-primary/30 bg-primary/[0.02]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{bmiResult.value}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Your BMI</h3>
                  <p className={`text-sm font-medium ${
                    bmiResult.score >= 4 ? "text-green-600" : bmiResult.score >= 3 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {bmiResult.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Body Mass Index (BMI) is a measure of body fat based on your height and weight. A healthy BMI typically falls between 18.5 and 24.9. This is factored into your Lifestyle Choices score.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

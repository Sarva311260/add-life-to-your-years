import { useState, useRef, useCallback } from "react";
import SEO from "@/components/SEO";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import { toast } from "sonner";
import {
  Leaf, ClipboardCheck, Stethoscope, ArrowRight, ArrowLeft,
  Shield, Heart, Brain, Sparkles, CheckCircle2, AlertCircle, Loader2,
  Search, X, BookOpen, ChevronUp, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "choose" | "conditions" | "prerequisite" | "starting";

const KB_CDN_URL = "/manus-storage/book_content_updated_91734ec4.md";

// Map heading text to anchor IDs (same as BookReader)
const kbHeadingIdMap: Record<string, string> = {
  "Recommendation 10": "rec-10", "Recommendation 11": "rec-11", "Recommendation 12": "rec-12",
  "Recommendation 13": "rec-13", "Recommendation 14": "rec-14", "Recommendation 15": "rec-15",
  "Recommendation 16": "rec-16", "Recommendation 17": "rec-17", "Recommendation 18": "rec-18",
  "Recommendation 1": "rec-1", "Recommendation 2": "rec-2", "Recommendation 3": "rec-3",
  "Recommendation 4": "rec-4", "Recommendation 5": "rec-5", "Recommendation 6": "rec-6",
  "Recommendation 7": "rec-7", "Recommendation 8": "rec-8", "Recommendation 9": "rec-9",
  "Chapter 10": "chapter-10", "Chapter 11": "chapter-11", "Chapter 12": "chapter-12",
  "Chapter 13": "chapter-13", "Chapter 14": "chapter-14",
  "Chapter 1": "chapter-1", "Chapter 2": "chapter-2", "Chapter 3": "chapter-3",
  "Chapter 4": "chapter-4", "Chapter 5": "chapter-5", "Chapter 6": "chapter-6",
  "Chapter 7": "chapter-7", "Chapter 8": "chapter-8", "Chapter 9": "chapter-9",
  "Introduction": "introduction", "Part One": "part-one", "Part Two": "part-two",
  "Part Three": "part-three", "Part Four": "part-four", "Conclusion": "conclusion",
  "Glossary": "glossary", "Your Wellness Blueprint at a Glance": "wellness-blueprint",
  "Supplementary Guide: Mitochondrial Health": "appendix-j",
};
const kbSortedKeys = Object.keys(kbHeadingIdMap).sort((a, b) => b.length - a.length);

interface KbSearchResult {
  lineIndex: number;
  context: string;
  heading: string;
  chapterId: string;
}

function buildKbResults(content: string, query: string): KbSearchResult[] {
  if (!query || query.length < 2) return [];
  const lines = content.split("\n");
  const results: KbSearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  let lastHeading = "Introduction";
  let lastChapterId = "introduction";
  lines.forEach((line, idx) => {
    if (/^#{1,3}\s/.test(line)) {
      const headingText = line.replace(/^#+\s*/, "").replace(/[*_`>]/g, "").trim();
      let matchedId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      for (const key of kbSortedKeys) {
        if (headingText.includes(key)) { matchedId = kbHeadingIdMap[key]; break; }
      }
      lastHeading = headingText;
      lastChapterId = matchedId;
    }
    if (line.toLowerCase().includes(lowerQuery)) {
      const contextStart = Math.max(0, idx - 1);
      const contextLines = lines.slice(contextStart, idx + 2)
        .map(l => l.replace(/^#+\s*/, "").replace(/[*_`>]/g, "").trim())
        .filter(Boolean).join(" ");
      results.push({
        lineIndex: idx,
        context: contextLines.slice(0, 130) + (contextLines.length > 130 ? "…" : ""),
        heading: lastHeading,
        chapterId: lastChapterId,
      });
    }
  });
  return results.slice(0, 40);
}

export default function Consult() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("choose");

  // Knowledge base search state
  const [kbSearchOpen, setKbSearchOpen] = useState(false);
  const [kbQuery, setKbQuery] = useState("");
  const [kbResults, setKbResults] = useState<KbSearchResult[]>([]);
  const [kbContent, setKbContent] = useState("");
  const [kbLoading, setKbLoading] = useState(false);
  const kbInputRef = useRef<HTMLInputElement>(null);

  // Lazy-load knowledge base content when search is opened
  const loadKbContent = () => {
    if (kbContent || kbLoading) return;
    setKbLoading(true);
    fetch(KB_CDN_URL)
      .then(r => r.text())
      .then(text => { setKbContent(text); setKbLoading(false); })
      .catch(() => setKbLoading(false));
  };

  const handleKbSearch = () => {
    if (!kbContent) return;
    setKbResults(buildKbResults(kbContent, kbQuery));
  };

  const openKbSearch = () => {
    setKbSearchOpen(true);
    loadKbContent();
    setTimeout(() => kbInputRef.current?.focus(), 100);
  };

  const closeKbSearch = () => {
    setKbSearchOpen(false);
    setKbQuery("");
    setKbResults([]);
  };
  const [consultType, setConsultType] = useState<"full_review" | "specific_conditions" | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState("");
  const [firstName, setFirstName] = useState("");

  const { data: conditions } = trpc.consult.getConditions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: evalStatus } = trpc.consult.checkEvaluation.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Check for active (incomplete) consultation
  const { data: activeConsult } = trpc.consult.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Check if user already has a first name saved
  const { data: meData } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const setFirstNameMutation = trpc.setFirstName.useMutation();

  const startMutation = trpc.consult.start.useMutation({
    onSuccess: (data) => {
      navigate(`/consult/session/${data.consultationId}`);
    },
    onError: (err) => {
      toast.error("Failed to start consultation: " + err.message);
      setStep("choose");
    },
  });

  const handleChooseType = (type: "full_review" | "specific_conditions") => {
    setConsultType(type);
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/consult");
      return;
    }
    if (type === "specific_conditions") {
      setStep("conditions");
    } else {
      setStep("prerequisite");
    }
  };

  const handleConditionsNext = () => {
    if (selectedConditions.length === 0) {
      toast.error("Please select at least one condition");
      return;
    }
    setStep("prerequisite");
  };

  const handleStartConsultation = async () => {
    // Save first name if provided and not already saved
    const nameToSave = firstName.trim();
    if (nameToSave && (!(meData as any)?.firstName || (meData as any)?.firstName !== nameToSave)) {
      try {
        await setFirstNameMutation.mutateAsync({ firstName: nameToSave });
      } catch (e) {
        // Non-blocking — continue even if save fails
      }
    }

    setStep("starting");
    const finalConditions = [...selectedConditions];
    if (otherCondition.trim() && selectedConditions.includes("other")) {
      finalConditions.push(`other: ${otherCondition.trim()}`);
    }
    startMutation.mutate({
      consultType: consultType!,
      selectedConditions: consultType === "specific_conditions" ? finalConditions : undefined,
    });
  };

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book a Wellness Consultation"
        description="Schedule a personalised 1-on-1 wellness consultation with Sarva. Evidence-based guidance on plant-based nutrition, lifestyle, and the 8 factors of health."
      canonicalPath="/consult"
      keywords="wellness consultation, plant-based nutrition coaching, health coaching, book consultation"
      jsonLd={{"@context":"https://schema.org","@type":"Service","name":"Wellness Consultation","provider":{"@type":"Person","name":"Sarva","url":"https://www.addlifetoyouryears.org"},"description":"Personalised 1-on-1 wellness consultation covering plant-based nutrition, lifestyle, and the 8 factors of health.","url":"https://www.addlifetoyouryears.org/consult"}}
      />
      <SiteNav />

      {/* Knowledge Base Search Bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container max-w-4xl">
          {!kbSearchOpen ? (
            <div className="flex items-center justify-between py-2">
              <p className="text-xs text-muted-foreground hidden sm:block">
                <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                Knowledge base search — find any topic from the book
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground ml-auto"
                onClick={openKbSearch}
              >
                <Search className="w-3.5 h-3.5" />
                Search knowledge base
                <span className="text-xs opacity-50 hidden sm:inline">Ctrl+K</span>
              </Button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 py-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  ref={kbInputRef}
                  value={kbQuery}
                  onChange={e => setKbQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleKbSearch();
                    if (e.key === "Escape") closeKbSearch();
                  }}
                  placeholder={kbLoading ? "Loading knowledge base…" : "Search the knowledge base… (Enter to search)"}
                  disabled={kbLoading}
                  className="flex-1 h-8 text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
                {kbResults.length > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                    {kbResults.length} result{kbResults.length !== 1 ? "s" : ""}
                  </span>
                )}
                {kbQuery && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleKbSearch}>
                    Search
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={closeKbSearch}>
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Results dropdown */}
              {kbResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-b-lg shadow-lg z-50 max-h-72 overflow-y-auto">
                  {kbResults.map((result, i) => (
                    <a
                      key={i}
                      href={`/book/read#${result.chapterId}`}
                      className="block px-4 py-2.5 hover:bg-primary/5 border-b border-border/50 last:border-0 group"
                      onClick={closeKbSearch}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-primary group-hover:text-primary/80 truncate">
                          {result.heading}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">→</span>
                        <span className="text-xs text-muted-foreground shrink-0">Open in book</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.context}</p>
                    </a>
                  ))}
                </div>
              )}

              {kbQuery.length >= 2 && kbResults.length === 0 && !kbLoading && kbContent && (
                <div className="absolute top-full left-0 right-0 bg-white border border-border rounded-b-lg shadow-lg z-50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">No results found for "{kbQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 gap-1.5 px-3 py-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Wellness Consultation
            </Badge>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              Your Personal Wellness Consultation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              An AI-guided consultation based on decades of wellness experience and the latest health science.
              Receive personalised recommendations tailored to your unique situation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose consultation type */}
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Resume active consultation prompt */}
                {activeConsult && (
                  <Card className="border-2 border-primary/40 bg-primary/5 mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                            You have an unfinished consultation
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {activeConsult.consultType === "full_review"
                              ? "Complete Wellness Review"
                              : "Specific Conditions"}
                            {" — "}
                            Phase {activeConsult.currentPhase} of 6
                            {" · "}
                            {activeConsult.messageCount} message{activeConsult.messageCount !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Started {new Date(activeConsult.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => navigate(`/consult/session/${activeConsult.id}`)}
                              className="gap-2"
                            >
                              <ArrowRight className="w-4 h-4" />
                              Continue Where You Left Off
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              onClick={() => {
                                // Could abandon the old one, but for now just let them start fresh
                                toast.info("You can start a new consultation below. Your previous session is saved in your history.");
                              }}
                            >
                              Start Fresh Instead
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    {activeConsult ? "Or start a new consultation" : "How would you like to begin?"}
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the type of consultation that best fits your needs
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Review Card */}
                  <Card
                    className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
                    onClick={() => handleChooseType("full_review")}
                  >
                    <CardHeader className="pb-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <ClipboardCheck className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="font-serif text-xl">
                        Complete Wellness Review
                      </CardTitle>
                      <CardDescription className="text-base">
                        A comprehensive review across all 8 health factors with personalised recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Full assessment of your health picture
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Personalised action plan with priorities
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Downloadable wellness report
                        </li>
                      </ul>
                      <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        Start Full Review <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specific Conditions Card */}
                  <Card
                    className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg"
                    onClick={() => handleChooseType("specific_conditions")}
                  >
                    <CardHeader className="pb-3">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <Stethoscope className="w-7 h-7 text-primary" />
                      </div>
                      <CardTitle className="font-serif text-xl">
                        Address Specific Conditions
                      </CardTitle>
                      <CardDescription className="text-base">
                        Focus on one or more specific health concerns for targeted guidance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Targeted advice for your condition(s)
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Root cause exploration
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          Specific lifestyle recommendations
                        </li>
                      </ul>
                      <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                        Choose Conditions <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Consultation history link */}
                {isAuthenticated && (
                  <div className="text-center pt-4">
                    <Button variant="ghost" onClick={() => navigate("/consult/history")} className="text-muted-foreground">
                      View your previous consultations
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Condition Selector */}
            {step === "conditions" && (
              <motion.div
                key="conditions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-foreground">
                      Select Your Health Concerns
                    </h2>
                    <p className="text-muted-foreground">
                      Choose one or more conditions you'd like to address
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {conditions?.map((condition) => (
                    <Card
                      key={condition.id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedConditions.includes(condition.id)
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-primary/30"
                      }`}
                      onClick={() => toggleCondition(condition.id)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <Checkbox
                          checked={selectedConditions.includes(condition.id)}
                          onCheckedChange={() => toggleCondition(condition.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm">{condition.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {condition.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedConditions.includes("other") && (
                  <div className="max-w-md">
                    <label className="text-sm font-medium mb-1.5 block">
                      Please describe your condition:
                    </label>
                    <Input
                      value={otherCondition}
                      onChange={(e) => setOtherCondition(e.target.value)}
                      placeholder="e.g., Hashimoto's thyroiditis, fibromyalgia..."
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedConditions.length} condition{selectedConditions.length !== 1 ? "s" : ""} selected
                  </p>
                  <Button onClick={handleConditionsNext} disabled={selectedConditions.length === 0}>
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Prerequisite check */}
            {step === "prerequisite" && (
              <motion.div
                key="prerequisite"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setStep(consultType === "specific_conditions" ? "conditions" : "choose")
                    }
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    Before We Begin
                  </h2>
                </div>

                {/* Self-evaluation status */}
                <Card className={`border-2 ${evalStatus?.hasEvaluation ? "border-primary/30" : "border-orange-300"}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {evalStatus?.hasEvaluation ? (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Self-Evaluation {evalStatus?.hasEvaluation ? "Complete" : "Required"}
                        </h3>
                        {evalStatus?.hasEvaluation ? (
                          <p className="text-sm text-muted-foreground">
                            Your self-evaluation (score: {evalStatus.overallScore}%) will be used to personalise your consultation.
                            The AI will reference your specific scores and focus areas.
                          </p>
                        ) : (
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">
                              You need to complete the self-evaluation before starting a consultation.
                              It gives the AI a clear picture of your health so it can provide truly personalised guidance.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate("/questionnaire?redirect=consult")}
                              className="gap-2"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              Take the Self-Evaluation Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Book recommendation */}
                <Card className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Leaf className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Read the Book (Optional)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          The consultation draws on the knowledge in "Add Life to Your Years."
                          Reading it beforehand will help you get even more from your consultation, but it's not required.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/book")}
                          className="gap-2 text-primary"
                        >
                          <ArrowRight className="w-4 h-4" />
                          View the Book
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* First name */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          What should I call you?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your first name helps me personalise your consultation and report.
                        </p>
                        <Input
                          value={firstName || (meData as any)?.firstName || ""}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Your first name"
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Medical disclaimer */}
                <Card className="border bg-muted/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Shield className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 text-sm">
                          Important Disclaimer
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          This consultation provides general wellness guidance only. It is not medical advice
                          and does not replace professional medical consultation. Always consult with a qualified
                          healthcare provider before making significant changes to your health routine.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Start button */}
                <div className="flex justify-center pt-4">
                  <Button
                    size="lg"
                    onClick={handleStartConsultation}
                    disabled={startMutation.isPending || !evalStatus?.hasEvaluation}
                    className="gap-2 px-8"
                    title={!evalStatus?.hasEvaluation ? "Please complete the self-evaluation first" : undefined}
                  >
                    {startMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Preparing your consultation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Begin Consultation
                      </>
                    )}
                  </Button>
                  {!evalStatus?.hasEvaluation && (
                    <p className="text-sm text-orange-600 mt-2">
                      Please complete the self-evaluation above before starting your consultation.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Starting (loading) */}
            {step === "starting" && (
              <motion.div
                key="starting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium text-foreground">Preparing your consultation...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Setting up your personalised session
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer info */}
      {step === "choose" && (
        <section className="pb-16">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Holistic Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Based on 8 health factors and 18 evidence-based recommendations
                </p>
              </div>
              <div className="text-center p-6">
                <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Personalised Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered consultation tailored to your unique health situation
                </p>
              </div>
              <div className="text-center p-6">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your consultation data is saved securely and only accessible to you
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

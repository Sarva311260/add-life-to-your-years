import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Send, Loader2, Sparkles, User, ArrowLeft, CheckCircle2,
  FileText, ChevronRight, Shield, Leaf,
} from "lucide-react";
import { motion } from "framer-motion";

const PHASE_LABELS = [
  "Welcome",
  "Health Snapshot",
  "Deep Dive",
  "Insights",
  "Recommendations",
  "Action Plan",
];

export default function ConsultSession() {
  const params = useParams<{ id: string }>();
  const consultationId = parseInt(params.id || "0", 10);
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch existing consultation data
  const { data: consultation, isLoading: loadingConsultation } = trpc.consult.getById.useQuery(
    { id: consultationId },
    { enabled: isAuthenticated && consultationId > 0 }
  );

  // Local messages state (initialized from server data)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (consultation) {
      setMessages(
        consultation.messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );
      setCurrentPhase(consultation.currentPhase);
      setIsComplete(consultation.status === "completed");
    }
  }, [consultation]);

  // Send message mutation
  const sendMutation = trpc.consult.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      setCurrentPhase(data.phase);
      if (data.isComplete) {
        setIsComplete(true);
        toast.success("Consultation complete! Your report is being generated.");
      }
      scrollToBottom();
    },
    onError: (err) => {
      toast.error("Failed to send message: " + err.message);
    },
  });

  const scrollToBottom = () => {
    setTimeout(() => {
      const viewport = scrollRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLDivElement;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending || isComplete) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    sendMutation.mutate({ consultationId, message: trimmed });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    window.location.href = getLoginUrl("/consult");
    return null;
  }

  if (loadingConsultation) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container max-w-2xl py-20 text-center">
          <p className="text-muted-foreground">Consultation not found.</p>
          <Button variant="outline" onClick={() => navigate("/consult")} className="mt-4">
            Start a New Consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />

      {/* Progress bar */}
      <div className="border-b bg-card">
        <div className="container py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/consult")}
              className="gap-1 text-muted-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {isComplete && (
              <Button
                size="sm"
                onClick={() => navigate(`/consult/report/${consultationId}`)}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                View Report
              </Button>
            )}
          </div>

          {/* Phase progress */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PHASE_LABELS.map((label, index) => {
              const phaseNum = index + 1;
              const isActive = phaseNum === currentPhase;
              const isDone = phaseNum < currentPhase || isComplete;
              return (
                <div key={label} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <span className="w-4 text-center">{phaseNum}</span>
                    )}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {index < PHASE_LABELS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col container max-w-3xl py-4" style={{ minHeight: 0 }}>
        <div ref={scrollRef} className="flex-1 overflow-hidden rounded-lg border bg-card">
          <ScrollArea className="h-full" style={{ height: "calc(100vh - 260px)" }}>
            <div className="flex flex-col space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user"
                      ? "justify-end items-start"
                      : "justify-start items-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {sendMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-2.5">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sarva is thinking...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input area */}
        {isComplete ? (
          <div className="mt-3 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
            <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="font-medium text-foreground text-sm">Consultation Complete</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Your personalised wellness report has been generated.
            </p>
            <Button
              size="sm"
              onClick={() => navigate(`/consult/report/${consultationId}`)}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              View Your Report
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mt-3 flex gap-2 items-end"
          >
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response..."
              className="flex-1 max-h-32 resize-none min-h-9"
              rows={1}
              disabled={sendMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sendMutation.isPending}
              className="shrink-0 h-[38px] w-[38px]"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        )}

        {/* Disclaimer */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
          <Shield className="w-3 h-3" />
          This is wellness guidance, not medical advice. Consult a healthcare professional for medical concerns.
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Video, ChevronDown, ChevronUp, ArrowLeft, ExternalLink, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import SiteNav from "@/components/SiteNav";
import { useAuth } from "@/_core/hooks/useAuth";

type VideoLink = { youtubeId: string; title: string };

function VideoDropdown({ videoLinks, entryId }: { videoLinks: VideoLink[]; entryId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (videoLinks.length === 0) {
    return (
      <Badge variant="default" className="text-xs opacity-50 cursor-default">
        Video
      </Badge>
    );
  }

  // Single video — just open directly
  if (videoLinks.length === 1) {
    return (
      <Badge
        variant="default"
        className="text-xs cursor-pointer hover:bg-primary/80 flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          window.open(`https://www.youtube.com/watch?v=${videoLinks[0].youtubeId}`, "_blank");
        }}
      >
        <Play className="w-3 h-3" />
        Watch
      </Badge>
    );
  }

  // Multiple videos — show dropdown
  return (
    <div className="relative" ref={ref}>
      <Badge
        variant="default"
        className="text-xs cursor-pointer hover:bg-primary/80 flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        <Play className="w-3 h-3" />
        {videoLinks.length} Videos
      </Badge>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[280px] max-w-[360px]">
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
            Open in new tab
          </div>
          {videoLinks.map((vl, i) => (
            <button
              key={`${entryId}-${vl.youtubeId}`}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://www.youtube.com/watch?v=${vl.youtubeId}`, "_blank");
                setOpen(false);
              }}
            >
              <Play className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="flex-1 min-w-0 truncate">{vl.title}</span>
              <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBase() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "video" | "condition">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: knowledgeData, isLoading } = trpc.knowledge.list.useQuery(undefined, {
    enabled: !!user,
  });

  const isOwner = user?.openId === import.meta.env.VITE_OWNER_OPEN_ID || user?.role === "admin";

  const allEntries = knowledgeData || [];

  // useMemo MUST be called before any conditional returns (React rules of hooks)
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allEntries.filter((entry: any) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "video" && entry.type === "video") ||
        (activeTab === "condition" && entry.type === "condition");
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q)
      );
    });
  }, [allEntries, searchQuery, activeTab]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">This page is restricted to the site owner.</p>
            <a href={getLoginUrl("/knowledge-base")}>
              <Button>Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">This page is only accessible to the site owner.</p>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Knowledge Base
          </h1>
          <p className="text-muted-foreground">
            All condition knowledge and video insights used by the AI consultation system. Owner-only view.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "video", "condition"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab === "all" ? `All (${allEntries.length})` : tab === "video" ? `Videos (${allEntries.filter((e: any) => e.type === "video").length})` : `Conditions (${allEntries.filter((e: any) => e.type === "condition").length})`}
            </Button>
          ))}
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* Entries */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No entries found{searchQuery ? ` for "${searchQuery}"` : ""}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((entry: any) => {
              const isExpanded = expandedId === entry.id;
              const videoLinks: VideoLink[] = entry.videoLinks || [];
              return (
                <Card
                  key={entry.id}
                  className="border border-border hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <CardHeader className="pb-2 pt-4 px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {entry.type === "video" ? (
                            <Video className="w-4 h-4 text-primary" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold leading-snug">
                            {entry.title}
                          </CardTitle>
                          {!isExpanded && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {entry.content.slice(0, 160)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.type === "video" ? (
                          <VideoDropdown videoLinks={videoLinks} entryId={entry.id} />
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Condition
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="px-5 pb-5">
                      <div className="mt-2 border-t pt-4">
                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                          {entry.content}
                        </pre>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

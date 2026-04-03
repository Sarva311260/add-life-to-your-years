import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Leaf,
  Play,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mic,
  Video,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoItem {
  youtubeId: string;
  title: string;
  description?: string;
}

interface RecommendationSection {
  id: string;
  number: number;
  title: string;
  description: string;
  videos: VideoItem[];
  color: string;
}

interface PodcastItem {
  title: string;
  host: string;
  description: string;
  url?: string;
  comingSoon?: boolean;
}

interface StandaloneVideo {
  youtubeId: string;
  title: string;
  description?: string;
  category?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const RECOMMENDATIONS: RecommendationSection[] = [
  {
    id: "rec-1",
    number: 1,
    title: "Whole Food Plant-Based Diet",
    description:
      "The foundation of cellular health — how a whole food plant-based diet reduces inflammation, supports the microbiome, and reverses chronic disease.",
    color: "bg-green-100 text-green-800 border-green-200",
    videos: [
      {
        youtubeId: "wb7L3t0ejdI",
        title: "Whole Food Plant-Based Diet & Health",
        description:
          "An in-depth look at how plant-based nutrition supports long-term vitality.",
      },
    ],
  },
  {
    id: "rec-2",
    number: 2,
    title: "Water & Hydration",
    description:
      "Why the quality and quantity of water you drink matters more than most people realise — and how to optimise your hydration.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    videos: [],
  },
  {
    id: "rec-3",
    number: 3,
    title: "Sleep & Melatonin",
    description:
      "Sleep is the body's most powerful repair mechanism. Learn how to optimise your sleep architecture and the role of melatonin.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    videos: [],
  },
  {
    id: "rec-4",
    number: 4,
    title: "Glycine",
    description:
      "The underappreciated amino acid that supports collagen synthesis, sleep quality, and metabolic health.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    videos: [],
  },
  {
    id: "rec-5",
    number: 5,
    title: "Five Seeds of Life",
    description:
      "Five powerhouse seeds — flax, chia, hemp, pumpkin, and sesame — and why they should be part of your daily nutrition.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    videos: [],
  },
  {
    id: "rec-6",
    number: 6,
    title: "Vitamin B12 & Vitamin D",
    description:
      "Two critical nutrients that are widely deficient — why they matter and how to supplement intelligently.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    videos: [],
  },
  {
    id: "rec-7",
    number: 7,
    title: "Six Movements",
    description:
      "The six fundamental movement patterns every body needs — and how to build them into your daily life regardless of fitness level.",
    color: "bg-red-100 text-red-800 border-red-200",
    videos: [],
  },
  {
    id: "rec-8",
    number: 8,
    title: "Breathing",
    description:
      "Breathing is the only autonomic function we can consciously control. Learn how nasal breathing and breath work transform health.",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    videos: [],
  },
  {
    id: "rec-9",
    number: 9,
    title: "PEMF & Earthing",
    description:
      "Pulsed Electromagnetic Field therapy and grounding — how reconnecting with the Earth's electromagnetic field supports redox signalling and recovery.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    videos: [],
  },
  {
    id: "rec-10",
    number: 10,
    title: "Meditation",
    description:
      "The neuroscience of meditation — how regular practice reshapes the brain, reduces cortisol, and builds emotional resilience.",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    videos: [],
  },
  {
    id: "rec-11",
    number: 11,
    title: "Time in Nature",
    description:
      "Why spending time in natural environments is a measurable health intervention — from forest bathing to sunlight exposure.",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    videos: [],
  },
  {
    id: "rec-12",
    number: 12,
    title: "Repairing Relationships",
    description:
      "Social connection is a primary determinant of longevity. Practical strategies for deepening relationships and reducing isolation.",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    videos: [],
  },
  {
    id: "rec-13",
    number: 13,
    title: "Second Income Stream",
    description:
      "Financial stress is a major driver of chronic disease. Building a second income stream reduces allostatic load and creates security.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    videos: [],
  },
  {
    id: "rec-14",
    number: 14,
    title: "Your Environment",
    description:
      "How your home and work environment shapes your health — from air quality and toxin reduction to light and sound.",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    videos: [],
  },
  {
    id: "rec-15",
    number: 15,
    title: "Methylene Blue & Photobiomodulation",
    description:
      "Emerging therapies at the frontier of mitochondrial medicine — the science behind methylene blue and red/near-infrared light therapy.",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    videos: [],
  },
];

const PODCASTS: PodcastItem[] = [
  {
    title: "Podcast episodes coming soon",
    host: "",
    description:
      "We are curating a selection of podcast episodes that explore the science behind the 15 Recommendations. Check back soon.",
    comingSoon: true,
  },
];

const STANDALONE_VIDEOS: StandaloneVideo[] = [];

// ─── Sub-components ───────────────────────────────────────────────────────────

function VideoEmbed({ video }: { video: VideoItem }) {
  return (
    <div className="space-y-3">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-md bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground text-sm">{video.title}</p>
          {video.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {video.description}
            </p>
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-3 h-3" />
            YouTube
          </Button>
        </a>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: RecommendationSection }) {
  const [expanded, setExpanded] = useState(rec.videos.length > 0);
  const hasVideos = rec.videos.length > 0;

  return (
    <motion.div
      id={rec.id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`border ${
          hasVideos ? "border-green-300 shadow-md" : "border-border/50"
        } overflow-hidden`}
      >
        <button
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${rec.color}`}
            >
              {rec.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">{rec.title}</h3>
                {hasVideos ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                    <Play className="w-2.5 h-2.5 mr-1" />
                    {rec.videos.length} video{rec.videos.length > 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {rec.description}
              </p>
            </div>
            <div className="shrink-0 text-muted-foreground">
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </CardContent>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border/40 pt-4">
                {hasVideos ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {rec.videos.map((v) => (
                      <VideoEmbed key={v.youtubeId} video={v} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 opacity-40 shrink-0" />
                      <p className="text-sm">
                        Videos for this recommendation are coming soon. Check
                        back regularly for new content.
                      </p>
                    </div>
                    <Link href={`/book/read#${rec.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-xs w-fit"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Read Recommendation {rec.number} in the Book
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = "recommendations" | "podcasts" | "videos";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Media() {
  const [activeTab, setActiveTab] = useState<Tab>("recommendations");
  const totalVideos = RECOMMENDATIONS.reduce(
    (sum, r) => sum + r.videos.length,
    0
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "recommendations",
      label: "Recommendations",
      icon: <BookOpen className="w-4 h-4" />,
      count: 15,
    },
    {
      id: "podcasts",
      label: "Podcasts",
      icon: <Mic className="w-4 h-4" />,
    },
    {
      id: "videos",
      label: "Videos",
      icon: <Video className="w-4 h-4" />,
      count: STANDALONE_VIDEOS.length || undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-green-50/60 to-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Media Library
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Learn, Watch &amp; Explore
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Videos, podcasts, and resources grouped by each of the 15
              Recommendations from the book. All free — no subscriptions.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">{totalVideos}</strong>{" "}
                video{totalVideos !== 1 ? "s" : ""} available
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">15</strong> recommendation
                sections
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container max-w-4xl">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-green-100 text-green-800"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? "bg-green-200 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="py-12">
        <div className="container max-w-4xl">
          <AnimatePresence mode="wait">
            {/* ── Recommendations Tab ── */}
            {activeTab === "recommendations" && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      The 15 Recommendations
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Videos linked directly from the book — one section per
                      recommendation.
                    </p>
                  </div>
                  <Link href="/book/read">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Read the Book
                    </Button>
                  </Link>
                </div>
                <div className="space-y-4">
                  {RECOMMENDATIONS.map((rec) => (
                    <RecommendationCard key={rec.id} rec={rec} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Podcasts Tab ── */}
            {activeTab === "podcasts" && (
              <motion.div
                key="podcasts"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Podcasts
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Curated podcast episodes exploring the science behind the
                    recommendations.
                  </p>
                </div>
                <div className="space-y-4">
                  {PODCASTS.map((podcast, i) =>
                    podcast.comingSoon ? (
                      <Card key={i} className="border-dashed border-border/60">
                        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                            <Mic className="w-6 h-6 text-muted-foreground opacity-50" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Podcast Episodes Coming Soon
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                              We are curating a selection of podcast episodes
                              that explore the science behind the 15
                              Recommendations. Check back soon.
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Coming Soon
                          </Badge>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card key={i}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <Mic className="w-4 h-4 text-green-700" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">
                                {podcast.title}
                              </h3>
                              {podcast.host && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {podcast.host}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {podcast.description}
                              </p>
                              {podcast.url && (
                                <a
                                  href={podcast.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-flex"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Listen
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Videos Tab ── */}
            {activeTab === "videos" && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    Videos
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    General health and wellness videos — interviews, lectures,
                    and documentaries.
                  </p>
                </div>

                {STANDALONE_VIDEOS.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {STANDALONE_VIDEOS.map((v) => (
                      <VideoEmbed key={v.youtubeId} video={v} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed border-border/60">
                    <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <Video className="w-6 h-6 text-muted-foreground opacity-50" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Videos Coming Soon
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          We are adding interviews, lectures, and documentaries
                          on health and wellness topics. Check back soon.
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        Coming Soon
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70 mt-16">
        <div className="container text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Add Life to Your Years. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

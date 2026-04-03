import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Leaf, ArrowLeft, Play, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Video {
  youtubeId: string;
  title: string;
  description?: string;
}

interface RecommendationSection {
  id: string;
  number: number;
  title: string;
  description: string;
  videos: Video[];
  color: string;
}

const RECOMMENDATIONS: RecommendationSection[] = [
  {
    id: "rec-1",
    number: 1,
    title: "Whole Food Plant-Based Diet",
    description: "The foundation of cellular health — how a whole food plant-based diet reduces inflammation, supports the microbiome, and reverses chronic disease.",
    color: "bg-green-100 text-green-800 border-green-200",
    videos: [
      {
        youtubeId: "wb7L3t0ejdI",
        title: "Whole Food Plant-Based Diet & Health",
        description: "An in-depth look at how plant-based nutrition supports long-term vitality.",
      },
    ],
  },
  {
    id: "rec-2",
    number: 2,
    title: "Water & Hydration",
    description: "Why the quality and quantity of water you drink matters more than most people realise — and how to optimise your hydration.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    videos: [],
  },
  {
    id: "rec-3",
    number: 3,
    title: "Sleep & Melatonin",
    description: "Sleep is the body's most powerful repair mechanism. Learn how to optimise your sleep architecture and the role of melatonin.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    videos: [],
  },
  {
    id: "rec-4",
    number: 4,
    title: "Glycine",
    description: "The underappreciated amino acid that supports collagen synthesis, sleep quality, and metabolic health.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    videos: [],
  },
  {
    id: "rec-5",
    number: 5,
    title: "Five Seeds of Life",
    description: "Five powerhouse seeds — flax, chia, hemp, pumpkin, and sunflower — and why they should be part of your daily nutrition.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    videos: [],
  },
  {
    id: "rec-6",
    number: 6,
    title: "Vitamin B12 & Vitamin D",
    description: "Two critical nutrients that are widely deficient — why they matter and how to supplement intelligently.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    videos: [],
  },
  {
    id: "rec-7",
    number: 7,
    title: "Six Movements",
    description: "The six fundamental movement patterns every body needs — and how to build them into your daily life regardless of fitness level.",
    color: "bg-red-100 text-red-800 border-red-200",
    videos: [],
  },
  {
    id: "rec-8",
    number: 8,
    title: "Breathing",
    description: "Breathing is the only autonomic function we can consciously control. Learn how nasal breathing and breath work transform health.",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    videos: [],
  },
  {
    id: "rec-9",
    number: 9,
    title: "PEMF & Earthing",
    description: "Pulsed Electromagnetic Field therapy and grounding — how reconnecting with the Earth's electromagnetic field supports redox signalling and recovery.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    videos: [],
  },
  {
    id: "rec-10",
    number: 10,
    title: "Meditation",
    description: "The neuroscience of meditation — how regular practice reshapes the brain, reduces cortisol, and builds emotional resilience.",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    videos: [],
  },
  {
    id: "rec-11",
    number: 11,
    title: "Time in Nature",
    description: "Why spending time in natural environments is a measurable health intervention — from forest bathing to sunlight exposure.",
    color: "bg-lime-100 text-lime-800 border-lime-200",
    videos: [],
  },
  {
    id: "rec-12",
    number: 12,
    title: "Repairing the Relationship",
    description: "Social connection is a primary determinant of longevity. Practical strategies for deepening relationships and reducing isolation.",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    videos: [],
  },
  {
    id: "rec-13",
    number: 13,
    title: "Second Income Stream",
    description: "Financial stress is a major driver of chronic disease. Building a second income stream reduces allostatic load and creates security.",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    videos: [],
  },
  {
    id: "rec-14",
    number: 14,
    title: "Your Environment",
    description: "How your home and work environment shapes your health — from air quality and toxin reduction to light and sound.",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    videos: [],
  },
  {
    id: "rec-15",
    number: 15,
    title: "Methylene Blue & Photobiomodulation",
    description: "Emerging therapies at the frontier of mitochondrial medicine — the science behind methylene blue and red/near-infrared light therapy.",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    videos: [],
  },
];

function VideoEmbed({ video }: { video: Video }) {
  return (
    <div className="space-y-3">
      <div className="relative w-full rounded-xl overflow-hidden shadow-md bg-black" style={{ paddingBottom: "56.25%" }}>
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
            <p className="text-xs text-muted-foreground mt-0.5">{video.description}</p>
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
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
      <Card className={`border ${hasVideos ? "border-green-300 shadow-md" : "border-border/50"} overflow-hidden`}>
        <button
          className="w-full text-left"
          onClick={() => setExpanded(!expanded)}
        >
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${rec.color}`}>
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
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
            </div>
            <div className="shrink-0 text-muted-foreground">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                  <div className="flex items-center gap-3 py-4 text-muted-foreground">
                    <Play className="w-5 h-5 opacity-40" />
                    <p className="text-sm">Videos for this recommendation are coming soon. Check back regularly for new content.</p>
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

export default function Media() {
  const totalVideos = RECOMMENDATIONS.reduce((sum, r) => sum + r.videos.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold text-foreground">Add Life to Your Years</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-green-50/60 to-white">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <Play className="w-4 h-4" />
              Media Library
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Learn, Watch & Explore
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-6">
              Videos grouped by each of the 15 Recommendations from the book. New content is added regularly — all free, no subscriptions.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">{totalVideos}</strong> video{totalVideos !== 1 ? "s" : ""} available
              </span>
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-green-600" />
                <strong className="text-foreground">15</strong> recommendation sections
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommendation Sections */}
      <section className="py-12">
        <div className="container max-w-4xl space-y-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              The 15 Recommendations
            </h2>
            <Link href="/book/read#rec-1">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Leaf className="w-3.5 h-3.5" />
                Read the Book
              </Button>
            </Link>
          </div>
          {RECOMMENDATIONS.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70 mt-16">
        <div className="container text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

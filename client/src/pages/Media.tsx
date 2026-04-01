import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import {
  Leaf, ArrowLeft, Play, Mic, Video, Film,
} from "lucide-react";
import { motion } from "framer-motion";

const MEDIA_CATEGORIES = [
  {
    title: "Videos",
    desc: "Wellness talks, cooking demonstrations, and guided practices to support your health journey.",
    icon: <Video className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Podcasts",
    desc: "In-depth conversations on nutrition, lifestyle, and the science behind whole food plant-based living.",
    icon: <Mic className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
  },
  {
    title: "Documentaries",
    desc: "Recommended films and series that explore health, food systems, and the power of prevention.",
    icon: <Film className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
  },
];

export default function Media() {
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
      <section className="py-20 bg-gradient-to-b from-green-50/50 to-white">
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
              Learn, Watch & Listen
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Free educational content to deepen your understanding of health, wellness, and vitality.
              New content is added regularly — check back often.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {MEDIA_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/60 hover:shadow-md transition-shadow group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-3">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Featured Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="max-w-3xl mx-auto">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6 text-center">
                Featured Video
              </h3>
              <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/AOvV9m7feKo"
                  title="Featured wellness video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="text-muted-foreground text-center mt-6">
                More videos, podcasts, and curated resources are on the way. All media content
                will be freely available — no subscriptions, no paywalls.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70 mt-12">
        <div className="container text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

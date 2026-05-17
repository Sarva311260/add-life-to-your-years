import { useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { Leaf, ArrowLeft, BookOpen, CheckCircle2, User, Star, X } from "lucide-react";
import { motion } from "framer-motion";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/AddLifeToYourYears-v6_abfc567f.pdf";
const MD_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_fe9e4e96.md";

const CONTENTS = [
  "Introduction — The Wellness Ecosystem",
  "Part One: How Our Body Works (Chapters 1–4)",
  "Part Two: The 8 Factors of Health and Disease",
  "Part Three: Wellness Strategies (Chapters 5–14)",
  "Part Four: John's Path Forward — A Healing Story",
  "All 18 Recommendations with Clinical Evidence (incl. Methylene Blue)",
  "9 Supplementary Guides: Diet, Cold Showers, Off-Label Pharmaceuticals, Brazil Nuts, Floor Lying, Gut-Brain Axis, Blackstrap Molasses, Coherence Breathing & Lavender Oil",
  "Chapter Notes and References",
  "Glossary — 42 Key Terms Defined",
];

const COMPETENCIES = [
  { area: "Nutrition & Diet", detail: "Whole food plant-based, vegetarian & vegan culinary arts, product formulation" },
  { area: "Energy Medicine", detail: "PEMF therapy (Papimi device, Olylife International), redox signalling, earthing" },
  { area: "Water & Detoxification", detail: "Water filtration and treatment, cellular detox protocols" },
  { area: "Coaching & Education", detail: "Freelance wellness coaching, self-evaluation frameworks, lifestyle transformation" },
  { area: "Network Marketing", detail: "Health product distribution, brand partnership, café management" },
  { area: "Bioenergetics", detail: "ASEA redox signalling, PEMF therapy, cellular health optimisation" },
];

const EXPERIENCE = [
  { period: "2016 – Present", role: "Freelance Wellness Coach", org: "Independent Practice", desc: "Provides personalised one-on-one wellness coaching delivering the Add Life to Your Years programme — an 18-recommendation whole food plant-based wellness framework — supported by a self-evaluation platform, AI-assisted consultation tools, and a comprehensive educational book." },
  { period: "Ongoing", role: "Platinum Brand Partner", org: "ASEA Global", desc: "Achieved Platinum-level partnership with ASEA Global, a leading company in redox signalling technology. Educates clients on the science of cellular health and redox signalling molecules." },
  { period: "2010 – 2012", role: "Guest Chef", org: "Madre Tierra Health Resort, Vilcabamba, Ecuador", desc: "Served as guest chef at one of South America's premier holistic health retreats, preparing plant-based cuisine aligned with the resort's detoxification and rejuvenation programmes." },
  { period: "2004 – 2009", role: "Director", org: "ECOSmart Australasia", desc: "Directed operations for a water filtration and treatment company, overseeing product sourcing, client consultations, and distribution of residential and commercial water purification systems." },
  { period: "2006 / Current", role: "Certified PEMF Practitioner", org: "Papimi Device · Olylife International", desc: "Certified operator of the Papimi PEMF therapy device since 2006. Currently practises with Olylife International PEMF technology, supporting clients with pain management, cellular regeneration, and energetic rebalancing." },
  { period: "2001 – 2004", role: "Product Formulator", org: "Health Food Industry", desc: "Formulated a range of health food products including the Wunderbar energy bars, applying expertise in whole-food ingredients, nutritional balance, and natural flavour profiles." },
  { period: "1999 – 2001", role: "Owner & Operator", org: "Jagannath's Café, Kuranda QLD", desc: "Founded and operated a vegetarian café in the Kuranda rainforest village, serving a community-focused menu rooted in Vedic culinary traditions." },
  { period: "1983 – 1989", role: "Head Cook & Vegetarian/Vegan Chef", org: "Hare Krishna Temple, Sydney", desc: "Served as Head Cook preparing large-scale vegetarian and vegan meals in accordance with Vedic dietary principles. This foundational role established a lifelong commitment to plant-based nutrition." },
];

const CERTIFICATIONS = [
  "Certified PEMF Practitioner — Papimi Device (2006) & Olylife International (current)",
  "Platinum Brand Partner — ASEA Global (Redox Signalling Technology)",
  "Top Performer — Sunrider International (Whole-food Nutrition)",
  "Extensive self-directed study in plant-based nutrition, functional medicine, naturopathy, and holistic lifestyle coaching",
];

function AuthorBioModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background border-b border-border px-8 py-5 flex flex-row items-center justify-between">
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">About the Author</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="px-8 py-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/sarva_0909cc87.jpg"
              alt="Peter Sarva Keller"
              className="w-28 h-28 rounded-full object-cover shadow-lg shrink-0 ring-4 ring-green-200"
            />
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-3">
                <User className="w-4 h-4" />
                About the Author
              </span>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-1">Peter Sarva Keller</h2>
              <p className="text-muted-foreground text-sm">
                Wellness Coach · Plant-Based Nutrition Specialist · Holistic Health Practitioner
              </p>
            </div>
          </div>

          {/* Intro */}
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Peter Sarva Keller was born in Hungary and trained as a classical musician before an early interest in Eastern philosophy set him on a different path. Now 66, he moved to Australia 46 years ago and has spent most of his working life in the wellness field — as a vegetarian chef, restaurant owner, health product marketer, product formulator, health food manufacturer, and wellness coach.
            </p>
            <p>
              As the author of the <em>Add Life to Your Years</em> book and the founder of the wellness ecosystem built around it, he has developed a comprehensive 18-step framework grounded in whole-food plant-based principles, empowering clients to take measurable, lasting control of their health.
            </p>
            <p>
              For years, people asked him to write a concise book drawing on his decades of accumulated experience. He spent the last three years doing further research into the latest science on health, wellness, and longevity. This book is the result.
            </p>
          </div>

          {/* Core Competencies */}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">Core Competencies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPETENCIES.map((item) => (
                <div key={item.area} className="bg-green-50/60 rounded-xl p-4 border border-green-100">
                  <h4 className="font-semibold text-foreground mb-1 text-sm uppercase tracking-wide">{item.area}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Timeline */}
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-5">Professional Experience</h3>
            <div className="space-y-5">
              {EXPERIENCE.map((item) => (
                <div key={item.role} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="w-0.5 bg-border flex-1 mt-2" />
                  </div>
                  <div className="pb-4">
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">{item.period}</span>
                    <h4 className="font-semibold text-foreground mt-0.5 text-sm">{item.role}</h4>
                    <p className="text-sm text-muted-foreground font-medium mb-1">{item.org}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-green-50/60 rounded-2xl p-6 border border-green-100">
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">Certifications & Partnerships</h3>
            <ul className="space-y-3">
              {CERTIFICATIONS.map((cert) => (
                <li key={cert} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Book() {
  const [bioOpen, setBioOpen] = useState(false);

  return (
    <>
    <SEO
      title="The Book — Add Life to Your Years"
      description="Read the full evidence-based book on health, wellness and vitality. Covers 8 health factors, 18 recommendations, and 9 supplementary guides."
      canonicalPath="/book"
      keywords="wellness book, health strategies, evidence-based health, plant-based, PEMF, longevity"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Book",
        name: "Add Life to Your Years",
        url: "https://www.addlifetoyouryears.org/book",
        description: "A comprehensive, evidence-based guide to health, wellness and vitality.",
        author: { "@type": "Person", name: "Sarva" },
        genre: "Health & Wellness",
        inLanguage: "en"
      }}
    />
    <div className="min-h-screen bg-background">
      <AuthorBioModal open={bioOpen} onClose={() => setBioOpen(false)} />

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
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="shrink-0"
            >
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/book-cover-sarva-keller_87f4edbe.png"
                alt="Add Life to Your Years book cover"
                className="w-52 md:w-64 rounded-xl shadow-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                Free to Read
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Add Life to Your Years
              </h1>
              <p className="text-xl text-muted-foreground mb-2 font-medium">
                Proven Strategies for Health, Wellness and Vitality
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                by Peter Sarva Keller
              </p>
              <p className="text-muted-foreground max-w-2xl text-base mt-4">
                A comprehensive, evidence-based guide to understanding how your body works, what
                drives chronic disease, and the practical strategies that can help you reclaim your
                health — starting today.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download Cards */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {/* Read Online */}
            <Card className="border-2 border-emerald-300 shadow-lg hover:shadow-xl transition-shadow md:col-span-2">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-8 h-8 text-emerald-700" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1">Read Online</h2>
                  <p className="text-muted-foreground text-sm">
                    Read the full book directly on this website — with chapter navigation. No download required.
                  </p>
                </div>
                <Link href="/book/read">
                  <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 px-8" size="lg">
                    <BookOpen className="w-4 h-4" />
                    Read Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* What's Inside */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6 text-center">
              What's Inside
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-12">
              {CONTENTS.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-green-50/60 border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="text-center p-6 rounded-2xl bg-muted/40 border border-border/50 mb-16">
              <p className="text-muted-foreground text-sm leading-relaxed">
                <strong className="text-foreground">This book is completely free.</strong> It is part of a broader wellness
                ecosystem — a set of interconnected resources designed to help you move from understanding to lasting change.
                If you find value in it, please share it with someone who might benefit.
              </p>
            </div>

            {/* About the Author */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 rounded-2xl bg-green-50/60 border border-green-100"
            >
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/sarva_0909cc87.jpg"
                alt="Peter Sarva Keller"
                className="w-32 h-32 rounded-full object-cover shadow-lg shrink-0 ring-4 ring-green-200"
              />
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-1">About the Author</h2>
                <p className="text-primary font-semibold mb-4">Peter Sarva Keller</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  Peter Sarva Keller was born in Hungary and trained as a classical musician before an early interest in Eastern philosophy set him on a different path. Now 66, he moved to Australia 46 years ago and has spent most of his working life in the wellness field — as a vegetarian chef, restaurant owner, health product marketer, product formulator, health food manufacturer, and wellness coach.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  For years, people asked him to write a concise book drawing on his decades of accumulated experience. He spent the last three years doing further research into the latest science on health, wellness, and longevity. This book is the result.
                </p>
                <button
                  onClick={() => setBioOpen(true)}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline"
                >
                  Read full bio →
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
}

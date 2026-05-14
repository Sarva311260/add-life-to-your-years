import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Leaf, ArrowLeft, BookOpen, Download, FileText, CheckCircle2 } from "lucide-react";
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
  "Appendices A–G: Diet, Cold Showers, Off-Label Pharmaceuticals, Brazil Nuts, Floor Lying, Gut-Brain Axis & Blackstrap Molasses",
  "Chapter Notes and References",
  "Glossary — 42 Key Terms Defined",
];

export default function Book() {
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
                by Sarva Keller
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
                alt="Sarva Keller"
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
                <a href="/#about-author" className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline">
                  Read full bio →
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

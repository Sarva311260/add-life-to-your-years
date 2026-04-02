import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Leaf, ArrowLeft, BookOpen, Download, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_e8d0da6f.pdf";
const MD_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_4932d2fb.md";

const CONTENTS = [
  "Introduction — The Wellness Ecosystem",
  "Part One: How Our Body Works (Chapters 1–4)",
  "Part Two: The 8 Factors of Health and Disease",
  "Part Three: Wellness Strategies (Chapters 5–14)",
  "Part Four: John's Path Forward — A Healing Story",
  "All 15 Recommendations with Clinical Evidence (incl. Methylene Blue)",
  "Chapter Notes and References",
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
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Free Download
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Add Life to Your Years
            </h1>
            <p className="text-xl text-muted-foreground mb-2 font-medium">
              Proven Strategies for Health, Wellness and Vitality
            </p>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base mt-4">
              A comprehensive, evidence-based guide to understanding how your body works, what
              drives chronic disease, and the practical strategies that can help you reclaim your
              health — starting today.
            </p>
          </motion.div>
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

            {/* PDF Download */}
            <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Download className="w-8 h-8 text-green-700" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1">
                    Download PDF
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Best for reading on screen, printing, or sharing. Opens in any PDF viewer.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">118 pages · ~3.5 MB</p>
                <a href={PDF_URL} download="AddLifeToYourYears.pdf" className="w-full">
                  <Button className="w-full bg-green-700 hover:bg-green-800 text-white gap-2" size="lg">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Markdown Download */}
            <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground mb-1">
                    Download Markdown
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Editable format. Open in Word, Google Docs, Notion, or any text editor. Easy to convert.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Plain text · ~220 KB</p>
                <a href={MD_URL} download="AddLifeToYourYears.md" className="w-full">
                  <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white gap-2" size="lg">
                    <FileText className="w-4 h-4" />
                    Download Markdown
                  </Button>
                </a>
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
            <div className="text-center p-6 rounded-2xl bg-muted/40 border border-border/50">
              <p className="text-muted-foreground text-sm leading-relaxed">
                <strong className="text-foreground">This book is completely free.</strong> It is part of a broader wellness
                ecosystem — a set of interconnected resources designed to help you move from understanding to lasting change.
                If you find value in it, please share it with someone who might benefit.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

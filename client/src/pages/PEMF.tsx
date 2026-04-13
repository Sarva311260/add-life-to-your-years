import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteNav from "@/components/SiteNav";
import { Link } from "wouter";
import {
  Zap, Heart, Brain, Moon, Shield, Activity, Bone, Sparkles,
  ArrowRight, BookOpen, Play, ChevronDown, ExternalLink
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

/* ── Product Data ─────────────────────────────────────────── */
const PRODUCTS = [
  {
    name: "OlyLife THZ Tera-P90+",
    tagline: "All-in-One PEMF Wellness Device",
    description:
      "The flagship P90+ combines PEMF, terahertz, and far-infrared technologies in an elegant foot-pad design with interchangeable wand attachments. Designed for daily home use, it delivers therapeutic electromagnetic pulses at the Schumann resonance frequency (7.83 Hz) — the same frequency as the Earth's natural electromagnetic field.",
    features: [
      "PEMF + Terahertz + Far Infrared",
      "Multiple wand attachments included",
      "Adjustable timer and intensity",
      "Schumann resonance frequency (7.83 Hz)",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/p90plus-clean_87a41dc7.jpg",
    accent: "bg-emerald-50 border-emerald-200",
  },
  {
    name: "OlyLife Shaken Massager",
    tagline: "7-in-1 Body Shaping & Recovery",
    description:
      "A versatile belt-style device combining PEMF therapy with ultrasound, heat therapy, and vibration massage. Targets the core and waist area for deep tissue stimulation, circulation support, and muscle recovery — ideal for post-exercise recovery and daily wellness maintenance.",
    features: [
      "PEMF + Ultrasound + Heat therapy",
      "7 integrated technologies",
      "Targeted core and waist application",
      "Portable belt-style design",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/shaken-massager_fced25a9.jpg",
    accent: "bg-teal-50 border-teal-200",
  },
  {
    name: "OlyLife Galaxy G-One",
    tagline: "Smart Eye Massager with PEMF",
    description:
      "A foldable smart eye massager integrating PEMF technology with 7 eye-care modes. Designed for relief from digital eye strain, tension headaches, and sleep preparation — combining gentle electromagnetic stimulation with heat and compression therapy in a compact, travel-friendly form.",
    features: [
      "PEMF-enhanced eye therapy",
      "7 eye care modes",
      "Foldable & travel-friendly",
      "One-button simple control",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/galaxy-gone_917c4ce8.png",
    accent: "bg-green-50 border-green-200",
  },
];

/* ── Clinical Evidence ────────────────────────────────────── */
const EVIDENCE = [
  {
    icon: <Bone className="w-5 h-5" />,
    title: "Bone Healing",
    text: "FDA-approved since 1979 for non-union fractures. PEMF significantly accelerates bone healing and improves bone density in osteoporosis.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Pain & Inflammation",
    text: "Multiple RCTs demonstrate reductions in pain and inflammatory markers in osteoarthritis, rheumatoid arthritis, fibromyalgia, and post-surgical pain.",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Depression",
    text: "A 2016 meta-analysis found repetitive transcranial magnetic stimulation significantly more effective than sham treatment for major depressive disorder.",
  },
  {
    icon: <Moon className="w-5 h-5" />,
    title: "Sleep Quality",
    text: "PEMF at Schumann resonance frequencies improves sleep quality, reduces sleep latency, and increases slow-wave (deep) sleep.",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Wound Healing",
    text: "Accelerates soft tissue injury healing, reduces post-surgical inflammation, and has been used in sports medicine for decades.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Redox Signalling",
    text: "PEMF modulates reactive oxygen species at the mitochondrial level, recalibrating the cellular redox environment and stimulating the Nrf2 antioxidant pathway.",
  },
];

/* ── References ───────────────────────────────────────────── */
const REFERENCES = [
  "Markov MS. Expanding use of pulsed electromagnetic field therapies. Electromagnetic Biology and Medicine. 2007;26(3):257–274.",
  "Elshiwi AM, et al. Effect of pulsed electromagnetic field on nonspecific low back pain patients: a randomized controlled trial. Brazilian Journal of Physical Therapy. 2019;23(3):244–249.",
  "Funk RH. Endogenous electric fields as guiding cue for cell migration. Frontiers in Physiology. 2015;6:143.",
  "Chevalier G, et al. Earthing: health implications of reconnecting the human body to the Earth's surface electrons. Journal of Environmental and Public Health. 2012;2012:291541.",
  "Oschman JL, et al. The effects of grounding (earthing) on inflammation, the immune response, wound healing, and prevention and treatment of chronic inflammatory and autoimmune diseases. Journal of Inflammation Research. 2015;8:83–96.",
];

/* ── Fade-in animation wrapper ────────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PEMF Page
   ══════════════════════════════════════════════════════════════ */
export default function PEMF() {
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SiteNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)" }} />

        <div className="relative container py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn>
              <Badge className="bg-emerald-700/50 text-emerald-100 border-emerald-600/50 mb-6 text-xs tracking-widest uppercase px-4 py-1.5">
                Evidence-Based Wellness Technology
              </Badge>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                PEMF Therapy
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed max-w-2xl mx-auto mb-8">
                Pulsed Electromagnetic Field therapy uses externally applied electromagnetic pulses to stimulate cellular repair and regeneration — a technology used in clinical medicine since the 1970s.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#science">
                  <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 gap-2 font-medium">
                    <BookOpen className="w-4 h-4" />
                    The Science
                  </Button>
                </a>
                <a href="#products">
                  <Button size="lg" variant="outline" className="border-emerald-400/40 text-white hover:bg-emerald-800/50 gap-2 font-medium">
                    <Zap className="w-4 h-4" />
                    View Devices
                  </Button>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── What is PEMF? ─────────────────────────────────── */}
      <section id="science" className="py-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Understanding the Technology</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">What is PEMF Therapy?</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Pulsed Electromagnetic Field (PEMF) therapy uses externally applied electromagnetic pulses to stimulate cellular repair and regeneration. The technology has been used in clinical medicine since the 1970s — it was first approved by the FDA in 1979 for the treatment of non-union bone fractures, and has since accumulated a substantial evidence base across a range of applications.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The mechanism is consistent with what we know about cellular electrical signalling: PEMF pulses interact with the cell membrane's electrical potential, stimulating ion channels, improving cellular energy production (ATP synthesis), reducing inflammation, and promoting tissue repair. The frequencies used in therapeutic PEMF devices typically fall within the range of the Earth's natural Schumann resonances — suggesting that PEMF therapy may in part be restoring the electromagnetic environment that the body evolved within.
              </p>
            </div>
          </FadeIn>

          {/* Key mechanism highlight */}
          <FadeIn delay={0.2}>
            <div className="mt-12 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">PEMF and Redox Signalling</h3>
                  <p className="text-gray-700 leading-relaxed">
                    One of the most important mechanisms of PEMF therapy is its direct influence on cellular redox biochemistry. Research has demonstrated that PEMF exposure modulates the production and balance of reactive oxygen species (ROS) within cells, particularly at the mitochondrial level. Rather than simply suppressing oxidative stress, PEMF appears to <em>recalibrate</em> the redox environment — reducing excessive ROS production in damaged tissue while simultaneously stimulating the Nrf2 antioxidant pathway, the master regulator of the body's endogenous antioxidant defences.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Book reference */}
          <FadeIn delay={0.3}>
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>
                From <em className="text-gray-700">Add Life to Your Years</em> by Sarva Keller — Chapter 9: PEMF & Earthing
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Video Section ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Watch & Learn</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">See PEMF in Action</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-black aspect-video">
              <iframe
                src="https://player.vimeo.com/video/1087945115?h=f74d1d4ce7"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title="PEMF Therapy Overview"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Clinical Evidence ─────────────────────────────── */}
      <section id="evidence" className="py-20 bg-white">
        <div className="container max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Peer-Reviewed Research</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">Clinical Evidence</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto mb-6" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                PEMF therapy has been studied extensively across multiple clinical applications, with evidence published in peer-reviewed medical journals.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVIDENCE.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="h-full p-6 bg-gray-50/80 border border-gray-100 rounded-xl hover:border-emerald-200/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────── */}
      <section id="products" className="py-20 bg-gradient-to-b from-emerald-50/40 to-white">
        <div className="container max-w-5xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">Recommended Devices</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">OlyLife PEMF Devices</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto mb-6" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                We have researched the available options and recommend these quality, evidence-based devices for home use.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {PRODUCTS.map((product, i) => (
              <FadeIn key={product.name} delay={i * 0.1}>
                <Card className={`overflow-hidden border ${product.accent} shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-2/5 bg-white flex items-center justify-center p-8">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full max-w-xs h-auto object-contain"
                          style={{ maxHeight: "280px" }}
                        />
                      </div>
                      {/* Content */}
                      <div className="md:w-3/5 p-8 flex flex-col justify-center">
                        <Badge className="w-fit bg-emerald-100 text-emerald-800 border-emerald-200 mb-3 text-xs">
                          {product.tagline}
                        </Badge>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                        <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {product.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Contact CTA */}
          <FadeIn delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Interested in learning more about these devices?</p>
              <Link href="/contact">
                <Button size="lg" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2">
                  Get in Touch
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works (simplified) ─────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-sm font-medium text-emerald-700 tracking-widest uppercase mb-3">The Mechanism</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">How PEMF Works</h2>
              <div className="w-16 h-0.5 bg-emerald-600 mx-auto" />
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Electromagnetic Pulses",
                desc: "Low-frequency electromagnetic waves replicate the Earth's natural Schumann resonance (7.83 Hz), penetrating deep into the body's tissues.",
              },
              {
                step: "02",
                title: "Cellular Stimulation",
                desc: "Pulses interact with cell membranes, stimulating ion channels, improving ATP energy production, and restoring cellular voltage to optimal levels.",
              },
              {
                step: "03",
                title: "Healing Response",
                desc: "Enhanced cellular function triggers the body's natural repair mechanisms — reducing inflammation, accelerating tissue repair, and supporting immune function.",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 font-serif text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── References ────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container max-w-4xl">
          <FadeIn>
            <h3 className="font-serif text-xl font-semibold text-gray-900 mb-6">References</h3>
            <ol className="space-y-3">
              {REFERENCES.map((ref, i) => (
                <li key={i} className="text-sm text-gray-500 leading-relaxed pl-6 relative">
                  <span className="absolute left-0 text-gray-400">{i + 1}.</span>
                  {ref}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-center gap-3 text-sm text-gray-500">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>
                For a comprehensive discussion of PEMF therapy and its role in holistic wellness, see{" "}
                <Link href="/book" className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2">
                  <em>Add Life to Your Years</em>
                </Link>{" "}
                — Chapter 9: PEMF & Earthing.
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container max-w-4xl">
          <p className="text-xs text-gray-400 leading-relaxed text-center">
            <strong className="text-gray-500">Medical Disclaimer:</strong> PEMF technology has been studied for decades, with some applications receiving FDA clearance for specific indications. The devices featured on this page are marketed as wellness devices, not medical devices. They are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before beginning any new therapy or wellness programme.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-8 bg-emerald-900 text-emerald-200/70">
        <div className="container text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

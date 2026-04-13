import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap, Heart, Brain, Moon, Shield, Activity, Bone, Sparkles,
  ArrowRight, BookOpen, Play, ChevronDown, ExternalLink,
  Leaf, X, Eye, Waves, Dumbbell, Battery, Sun, Droplets,
  Phone, Mail, User, MessageSquare, CheckCircle, Send,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/* ── Product Data (same as PEMF.tsx) ─────────────────────── */
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
    detail: {
      subtitle: "3-in-1 PEMF & Terahertz Wellness System",
      overview:
        "The OlyLife THZ Tera-P90+ is the world's first device to integrate PEMF technology with Terahertz wave therapy. It combines three precision wellness tools into a single unified platform: the Main PEMF & Terahertz Device, the Frost Age Beauty Device, and the Revitaluxe Massager.",
      components: [
        {
          name: "Main Device — PEMF & Terahertz",
          desc: "Combines calibrated electromagnetic pulses with Terahertz wave technology that resonates at the natural frequency range of healthy human cells. Features 20 intensity levels, wireless infrared remote control, and an upgraded foot pedal (up to US 13 / EU 47).",
        },
        {
          name: "Frost Age Beauty Device — RF & EMS",
          desc: "A dedicated anti-aging attachment using Radio Frequency technology to stimulate collagen production and tighten skin, combined with Electrical Muscle Stimulation for facial and body toning. Ideal for fine lines, wrinkles, and skin elasticity.",
        },
        {
          name: "Revitaluxe Massager — 3-in-1 Magnetic Fusion",
          desc: "The most advanced attachment combining pulsed, static, and rotating magnetic fields with EMS/TENS pain relief and Red Light Therapy (photobiomodulation) for hair regrowth, scalp health, and deep tissue recovery.",
        },
      ],
      specs: [
        { label: "Core Technology", value: "PEMF + Terahertz Wave" },
        { label: "Beauty Technology", value: "RF + EMS" },
        { label: "Massage Technology", value: "3-in-1 Magnetic Fusion + EMS + TENS + Red Light" },
        { label: "Intensity Levels", value: "20 (fully adjustable)" },
        { label: "Control", value: "Infrared Wireless Remote" },
        { label: "Foot Pedal", value: "Up to US Size 13 / EU Size 47" },
        { label: "Safety", value: "Built-in Fuse Protection" },
        { label: "Warranty", value: "1 Year" },
      ],
    },
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
    detail: {
      subtitle: "7-in-1 Smart Wellness Belt",
      overview:
        "The OlyLife Shaken Massager is a wearable waist massage belt designed for body wellness, muscle relaxation, and core massage. It uses a 7.8 Hz ultra-low frequency PEMF field that penetrates up to 20 cm deep, combined with six additional therapeutic technologies for comprehensive body support.",
      components: [
        {
          name: "PEMF Therapy (7.8 Hz)",
          desc: "Ultra-low frequency pulsed electromagnetic field penetrates up to 20 cm deep, improving microcirculation, enhancing cellular metabolism, and supporting the body's natural repair processes at the tissue level.",
        },
        {
          name: "Heat & Red Light Therapy",
          desc: "Targeted heat therapy combined with red light for deep tissue warming, increased blood flow, and photobiomodulation — promoting relaxation and accelerating recovery in the core and waist area.",
        },
        {
          name: "Vibration & Ultrasound Massage",
          desc: "9-speed powerful vibration with 4 professional massage heads delivers rhythmic oscillation and ultrasound stimulation. Targets neck, shoulder, back, waist, and legs for comprehensive muscle relief.",
        },
      ],
      specs: [
        { label: "Core Technology", value: "PEMF (7.8 Hz ultra-low frequency)" },
        { label: "Penetration Depth", value: "Up to 20 cm" },
        { label: "Technologies", value: "7 integrated (PEMF, ultrasound, heat, vibration, red light, EMS, infrared)" },
        { label: "Vibration Speeds", value: "9 levels" },
        { label: "Massage Heads", value: "4 professional attachments" },
        { label: "Charging", value: "USB Type-C rechargeable" },
        { label: "Target Areas", value: "Neck, shoulder, back, waist, legs" },
        { label: "Warranty", value: "1 Year" },
      ],
    },
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
    detail: {
      subtitle: "PEMF Smart Eye Massager",
      overview:
        "The OlyLife Galaxy G-One is an advanced smart eye massager that integrates low-frequency PEMF technology with 3D airbag kneading, graphene heat therapy, and intermittent vibration. Featuring 4 unique technologies and 7 eye care modes, it delivers professional-grade eye therapy in a compact, foldable design.",
      components: [
        {
          name: "Six-Zone 3D Airbag Kneading",
          desc: "Precision airbag compression across six zones around the eyes delivers gentle, rhythmic kneading that relieves tension, reduces puffiness, and stimulates acupressure points around the orbital area.",
        },
        {
          name: "Graphene 42°C Warm Compress",
          desc: "Constant-temperature graphene heating at 42°C provides soothing warmth that improves blood circulation around the eyes, relieves dryness, and helps relax the delicate muscles surrounding the eye area.",
        },
        {
          name: "PEMF + Low-Frequency Vibration",
          desc: "Intermittent low-frequency PEMF pulses combined with gentle vibration stimulate cellular activity, reduce inflammation, and support overall eye health — particularly beneficial for those experiencing digital eye strain.",
        },
      ],
      specs: [
        { label: "Core Technology", value: "Low-frequency PEMF" },
        { label: "Massage System", value: "Six-Zone 3D Airbag Kneading" },
        { label: "Heat Therapy", value: "Graphene 42°C Constant Temperature" },
        { label: "Unique Technologies", value: "4 (Bionic Ultra Vision, Portable PEMF, Graphene, 3D Airbag)" },
        { label: "Eye Care Modes", value: "7 modes" },
        { label: "Design", value: "Foldable & travel-friendly" },
        { label: "Control", value: "One-button simple operation" },
        { label: "Warranty", value: "1 Year" },
      ],
    },
  },
];

/* ── Clinical Evidence ────────────────────────────────────── */
const EVIDENCE = [
  { icon: <Bone className="w-5 h-5" />, title: "Bone Healing", text: "FDA-approved since 1979 for non-union fractures. PEMF significantly accelerates bone healing and improves bone density in osteoporosis." },
  { icon: <Shield className="w-5 h-5" />, title: "Pain & Inflammation", text: "Multiple RCTs demonstrate reductions in pain and inflammatory markers in osteoarthritis, rheumatoid arthritis, fibromyalgia, and post-surgical pain." },
  { icon: <Brain className="w-5 h-5" />, title: "Depression", text: "A 2016 meta-analysis found repetitive transcranial magnetic stimulation significantly more effective than sham treatment for major depressive disorder." },
  { icon: <Moon className="w-5 h-5" />, title: "Sleep Quality", text: "PEMF at Schumann resonance frequencies improves sleep quality, reduces sleep latency, and increases slow-wave (deep) sleep." },
  { icon: <Heart className="w-5 h-5" />, title: "Wound Healing", text: "Accelerates soft tissue injury healing, reduces post-surgical inflammation, and has been used in sports medicine for decades." },
  { icon: <Sparkles className="w-5 h-5" />, title: "Redox Signalling", text: "PEMF modulates reactive oxygen species at the mitochondrial level, recalibrating the cellular redox environment and stimulating the Nrf2 antioxidant pathway." },
];

/* ── References ───────────────────────────────────────────── */
const REFERENCES = [
  "Markov MS. Expanding use of pulsed electromagnetic field therapies. Electromagnetic Biology and Medicine. 2007;26(3):257–274.",
  "Elshiwi AM, et al. Effect of pulsed electromagnetic field on nonspecific low back pain patients: a randomized controlled trial. Brazilian Journal of Physical Therapy. 2019;23(3):244–249.",
  "Funk RH. Endogenous electric fields as guiding cue for cell migration. Frontiers in Physiology. 2015;6:143.",
  "Chevalier G, et al. Earthing: health implications of reconnecting the human body to the Earth's surface electrons. Journal of Environmental and Public Health. 2012;2012:291541.",
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

/* ── Product Detail Modal ─────────────────────────────────── */
function ProductDetailModal({
  product,
  open,
  onClose,
}: {
  product: (typeof PRODUCTS)[number];
  open: boolean;
  onClose: () => void;
}) {
  const d = product.detail;
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-gray-900 pr-6">{product.name}</DialogTitle>
          <DialogDescription className="text-emerald-700 font-medium">{d.subtitle}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4 bg-gray-50 rounded-lg mb-4">
          <img src={product.image} alt={product.name} className="h-48 w-auto object-contain" />
        </div>
        <p className="text-gray-700 leading-relaxed text-sm mb-6">{d.overview}</p>
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Key Technologies</h4>
          {d.components.map((c) => (
            <div key={c.name} className="border border-emerald-100 bg-emerald-50/40 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 text-sm mb-1">{c.name}</h5>
              <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Specifications</h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {d.specs.map((s, i) => (
              <div key={s.label} className={`flex text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <div className="w-2/5 px-4 py-2.5 font-medium text-gray-700 border-r border-gray-200">{s.label}</div>
                <div className="w-3/5 px-4 py-2.5 text-gray-600">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Contact Form Modal ───────────────────────────────────── */
function ContactFormModal({
  open,
  onClose,
  affiliateSlug,
  affiliateName,
}: {
  open: boolean;
  onClose: () => void;
  affiliateSlug: string;
  affiliateName: string;
}) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const enquiryMutation = trpc.pemfAffiliate.submitEnquiry.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Your enquiry has been sent!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    enquiryMutation.mutate({
      affiliateSlug,
      visitorName: visitorName.trim(),
      visitorEmail: visitorEmail.trim(),
      visitorPhone: visitorPhone.trim() || undefined,
      message: message.trim() || undefined,
    });
  };

  const handleClose = () => {
    setSubmitted(false);
    setVisitorName("");
    setVisitorEmail("");
    setVisitorPhone("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-gray-900">
            {submitted ? "Thank You!" : "Get in Touch"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {submitted
              ? `${affiliateName} will be in touch with you shortly.`
              : `Enquire about PEMF devices through ${affiliateName}.`}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-gray-600 mb-4">
              Your enquiry has been sent to {affiliateName}. They will contact you soon.
            </p>
            <Button onClick={handleClose} className="bg-emerald-700 hover:bg-emerald-800 text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={visitorPhone}
                onChange={(e) => setVisitorPhone(e.target.value)}
                placeholder="+61 400 000 000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'd like to learn more about..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={enquiryMutation.isPending}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
            >
              {enquiryMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Enquiry
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ══════════════════════════════════════════════════════════════
   Personalised Affiliate PEMF Page
   ══════════════════════════════════════════════════════════════ */
export default function PEMFAffiliate() {
  const [, params] = useRoute("/pemf/:slug");
  const slug = params?.slug || "";

  const { data: affiliate, isLoading, error } = trpc.pemfAffiliate.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="font-serif text-2xl text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-500">This brand partner page doesn't exist or is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Affiliate Header ─────────────────────────────────── */}
      {/* Logo left | Nav centered | Affiliate name + phone right */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-emerald-900/95 backdrop-blur-md shadow-sm border-b border-emerald-700/40">
        <div className="container flex items-center justify-between h-14">
          {/* Left: Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Leaf className="w-5 h-5 text-emerald-300" />
            <span className="font-serif text-sm font-semibold text-white hidden sm:block">
              Add Life to Your Years
            </span>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-1">
            <a href="#science">
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Science
              </Button>
            </a>
            <a href="#evidence">
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Evidence
              </Button>
            </a>
            <a href="#products">
              <Button variant="ghost" size="sm" className="text-emerald-200 hover:text-white hover:bg-emerald-800/50 text-xs">
                Devices
              </Button>
            </a>
          </nav>

          {/* Right: Affiliate name & phone */}
          <div className="flex-shrink-0 text-right">
            <div className="text-white text-sm font-medium leading-tight">
              {affiliate.name}
              <span className="text-emerald-300 font-normal"> — Brand Partner</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-emerald-300/80 text-xs">
              <Phone className="w-3 h-3" />
              <span>{affiliate.phone}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
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
          <FadeIn delay={0.2}>
            <div className="mt-12 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-gray-900 mb-2">PEMF and Redox Signalling</h3>
                  <p className="text-gray-700 leading-relaxed">
                    One of the most important mechanisms of PEMF therapy is its direct influence on cellular redox biochemistry. Research has demonstrated that PEMF exposure modulates the production and balance of reactive oxygen species (ROS) within cells, particularly at the mitochondrial level. Rather than simply suppressing oxidative stress, PEMF appears to <em>recalibrate</em> the redox environment — reducing excessive ROS while preserving the beneficial signalling functions that reactive species play in immune defence, apoptosis, and tissue repair.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
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
                      <div className="md:w-2/5 bg-white flex items-center justify-center p-8">
                        <img src={product.image} alt={product.name} className="w-full max-w-xs h-auto object-contain" style={{ maxHeight: "280px" }} />
                      </div>
                      <div className="md:w-3/5 p-8 flex flex-col justify-center">
                        <Badge className="w-fit bg-emerald-100 text-emerald-800 border-emerald-200 mb-3 text-xs">{product.tagline}</Badge>
                        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                        <p className="text-gray-600 leading-relaxed mb-5">{product.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                          {product.features.map((f) => (
                            <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="w-fit border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 gap-2"
                          onClick={() => setSelectedProduct(i)}
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>

          {/* Contact CTA — opens contact form modal */}
          <FadeIn delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Interested in learning more about these devices?</p>
              <Button
                size="lg"
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
                onClick={() => setContactOpen(true)}
              >
                Get in Touch with {affiliate.name}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
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
              { step: "01", title: "Electromagnetic Pulses", desc: "Low-frequency electromagnetic waves replicate the Earth's natural Schumann resonance (7.83 Hz), penetrating deep into the body's tissues." },
              { step: "02", title: "Cellular Stimulation", desc: "Pulses interact with cell membranes, stimulating ion channels, improving ATP energy production, and restoring cellular voltage to optimal levels." },
              { step: "03", title: "Healing Response", desc: "Enhanced cellular function triggers the body's natural repair mechanisms — reducing inflammation, accelerating tissue repair, and supporting immune function." },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 font-serif text-xl font-bold">{item.step}</div>
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
                <em className="text-emerald-700">Add Life to Your Years</em> — Chapter 9: PEMF & Earthing.
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

      {/* ── Product Detail Modal ──────────────────────────── */}
      {selectedProduct !== null && (
        <ProductDetailModal
          product={PRODUCTS[selectedProduct]}
          open={selectedProduct !== null}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ── Contact Form Modal ────────────────────────────── */}
      <ContactFormModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        affiliateSlug={slug}
        affiliateName={affiliate.name}
      />
    </div>
  );
}

/**
 * RedoxAffiliate — personalised Redox Signaling product page for each brand partner.
 * Route: /redox/:slug
 *
 * Features:
 * - Hero section introducing Redox Signaling science
 * - ASEA REDOX Supplement product card with key benefits
 * - RENU 28 Gel product card with clinical results
 * - Affiliate's personal ASEA shopping cart (iframe or link)
 * - Contact / enquiry form
 * - Social links
 */
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dna, Sparkles, ShieldCheck, Activity, Heart, Droplets,
  ExternalLink, Phone, Mail, User, MessageSquare, Send,
  CheckCircle, ChevronDown, ChevronUp, ShoppingCart,
  Facebook, Instagram, Linkedin, Youtube,
  ArrowRight, Zap, Star,
} from "lucide-react";

const ASEA_REDOX_IMAGE = "/manus-storage/asea-redox-bottles_b681b865.jpg";
const RENU28_IMAGE = "/manus-storage/renu28-gel_86e1cd0a.jpg";

const REDOX_BENEFITS = [
  { icon: Dna, label: "Gene Signaling", desc: "Activates 5 key genetic pathways affecting immune, cardiovascular, digestive, hormonal, and inflammatory health" },
  { icon: ShieldCheck, label: "Immune Support", desc: "Enhances your body's natural defence mechanisms at the cellular level" },
  { icon: Heart, label: "Cardiovascular Health", desc: "Supports healthy heart function and circulation through redox signalling" },
  { icon: Activity, label: "Hormonal Balance", desc: "Helps modulate hormone signalling for energy, mood, and vitality" },
  { icon: Sparkles, label: "Cellular Renewal", desc: "Replenishes redox signalling molecules that decline with age, stress, and toxin exposure" },
  { icon: Zap, label: "Energy & Vitality", desc: "Supports mitochondrial function for sustained energy and mental clarity" },
];

const RENU28_RESULTS = [
  { stat: "21%", label: "Reduction in wrinkle depth" },
  { stat: "23%", label: "Improvement in overall wrinkles" },
  { stat: "20%", label: "Improvement in skin elasticity" },
  { stat: "22%", label: "Improvement in skin texture" },
  { stat: "16%", label: "Improvement in cellular renewal" },
  { stat: "50%", label: "Improvement in skin blood flow" },
];

const EXPERT_QUOTES = [
  {
    quote: "ASEA Redox is a cellular health product that is a breakthrough for humanity. I don't know of anything else in my career that has made this big of a difference in helping people to improve their health.",
    name: "Dr. Richard Walker MD",
    title: "Emergency & Internal Medicine",
  },
  {
    quote: "Extraordinary health is your birthright. In my humble opinion, ASEA Redox is the most powerful lifestyle supplement on the planet, which harnesses the power of your own body to keep it well.",
    name: "Ann Louise Gittleman",
    title: "Best Selling Author, 30+ Books on Nutrition & Wellness",
  },
  {
    quote: "RENU 28 is as potent as stem cell treatments combined with premium creams that sell for $600–$700 a month. I think these products are awesome.",
    name: "Dr. Ahvie Herskowitz",
    title: "Clinical Professor of Medicine, University of California",
  },
];

function SocialIcon({ platform, url }: { platform: string; url: string }) {
  const icons: Record<string, React.ElementType> = {
    facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube,
  };
  const Icon = icons[platform] || ExternalLink;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
      <Icon className="w-4 h-4 text-white" />
    </a>
  );
}

export default function RedoxAffiliate() {
  const [, params] = useRoute("/redox/:slug");
  const slug = params?.slug ?? "";

  const { data: affiliate, isLoading } = trpc.pemfAffiliate.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formSent, setFormSent] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState<number | null>(null);

  const submitEnquiry = trpc.pemfAffiliate.submitEnquiry.useMutation({
    onSuccess: () => {
      setFormSent(true);
      toast.success("Message sent! We'll be in touch shortly.");
    },
    onError: (err) => toast.error(err.message || "Failed to send message."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please enter your name and email.");
      return;
    }
    submitEnquiry.mutate({
      affiliateSlug: slug,
      visitorName: formData.name,
      visitorEmail: formData.email,
      visitorPhone: formData.phone || undefined,
      message: formData.message || undefined,
      sourcePage: "redox",
    });
  };

  // Set affiliate cookie for attribution
  useEffect(() => {
    if (slug) {
      const farFuture = new Date();
      farFuture.setFullYear(farFuture.getFullYear() + 100);
      document.cookie = `affiliate_slug=${encodeURIComponent(slug)}; expires=${farFuture.toUTCString()}; path=/; SameSite=Lax`;
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Page not found.</p>
          <a href="/" className="text-cyan-400 underline">Return to home</a>
        </div>
      </div>
    );
  }

  const socials = [
    { platform: "facebook", url: affiliate.facebook },
    { platform: "instagram", url: affiliate.instagram },
    { platform: "linkedin", url: affiliate.linkedin },
    { platform: "youtube", url: affiliate.youtube },
  ].filter(s => s.url);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1a35] to-[#071428]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.15)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.1)_0%,_transparent_60%)]" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="flex flex-col items-center text-center">
            <Badge className="mb-3 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-4 py-1.5 text-sm font-medium">
              Presented by {affiliate.name}
            </Badge>
            <p className="mb-7 text-cyan-200/60 text-xs font-semibold tracking-[0.2em] uppercase">
              ASEA Brand Partner
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The World's First{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Redox Signaling
              </span>{" "}
              Supplement
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-10 leading-relaxed">
              After 2 decades, multiple patents and millions of dollars of research, scientists achieved the impossible —
              creating and stabilising Redox Signalling Molecules outside the body. Now we can refuel our cells and
              help them signal like they did when we were younger.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#products" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20">
                Explore the Products <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all">
                Talk to {affiliate.name.split(" ")[0]}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCIENCE INTRO ────────────────────────────────────── */}
      <section className="py-16 bg-[#060c1a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Are Redox Signalling Molecules?</h2>
            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Every cell in your body produces Redox Signalling Molecules — the communication network that tells cells
              to protect, repair, or replace themselves. As we age, production declines. ASEA is the only company in
              the world to have stabilised these molecules outside the body, backed by 7 patents and over 1,000 trade secrets.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {REDOX_BENEFITS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{label}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ─────────────────────────────────────────── */}
      <section id="products" className="py-20 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">The ASEA Product Range</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Two clinically studied products. One for inside your body, one for your skin.
            </p>
          </div>

          {/* ASEA REDOX */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
            <div className="order-2 md:order-1">
              <Badge className="mb-4 bg-blue-500/10 text-blue-300 border border-blue-500/30">Internal Supplement</Badge>
              <h3 className="text-3xl font-bold mb-4">ASEA REDOX Cell Signalling Supplement</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                The world's first and only Redox Signalling supplement. ASEA REDOX contains high-energy Redox Signalling
                Molecules that are ready to donate their signalling energy to your cells — helping them work like they
                did when you were younger.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Backed by 7 patents and 1,000+ trade secrets",
                  "Increases genetic signalling up to 31%",
                  "Activates 5 critical gene signalling pathways",
                  "Safe, native to the body — no detoxification needed",
                  "Recommended: 4 oz (120 ml) per day",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 italic">
                Ingredients: Water, sodium chloride. Processed through a proprietary electrolytic process.
              </p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-3xl blur-2xl" />
                <img
                  src={ASEA_REDOX_IMAGE}
                  alt="ASEA REDOX Cell Signalling Supplement"
                  className="relative w-72 h-72 object-contain rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* RENU 28 */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-3xl blur-2xl" />
                <img
                  src={RENU28_IMAGE}
                  alt="ASEA RENU 28 Revitalising Redox Gel"
                  className="relative w-64 h-72 object-contain rounded-2xl"
                />
              </div>
            </div>
            <div>
              <Badge className="mb-4 bg-purple-500/10 text-purple-300 border border-purple-500/30">Topical Gel</Badge>
              <h3 className="text-3xl font-bold mb-4">RENU 28 Revitalising Redox Gel</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                The world's first Redox Signalling Gel for topical use. When we are young, skin cells renew every 28 days.
                With age and stress, this slows to 90+ days. RENU 28 has been clinically proven to improve skin cell
                renewal rate by 16% in just 4 weeks.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {RENU28_RESULTS.map(({ stat, label }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-purple-300">{stat}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic">
                Clinically tested by Stephens & Associates (North America) and Dermatest (Europe).
                Results from independent 4-week studies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOPPING CART ────────────────────────────────────── */}
      <section id="shop" className="py-20 bg-[#060c1a]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Order directly through {affiliate.name}'s personal ASEA store below.
              Your purchase supports {affiliate.name.split(" ")[0]} and helps fund their wellness mission.
            </p>
          </div>

          {affiliate.aseaCartUrl ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-white/5">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <span className="font-semibold text-white">{affiliate.name}'s ASEA Store</span>
                <a
                  href={affiliate.aseaCartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Open in new tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="p-4">
                <iframe
                  src={affiliate.aseaCartUrl}
                  title="ASEA Shopping Cart"
                  className="w-full rounded-xl border-0"
                  style={{ minHeight: "600px" }}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Store Coming Soon</h3>
              <p className="text-gray-500 text-sm mb-6">
                {affiliate.name} is setting up their personal ASEA store. In the meantime, reach out directly to place an order.
              </p>
              <a href="#contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-all">
                Contact {affiliate.name.split(" ")[0]} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── EXPERT QUOTES ────────────────────────────────────── */}
      <section className="py-16 bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">What Health Experts Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {EXPERT_QUOTES.map((q, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                  "{expandedQuote === i ? q.quote : q.quote.slice(0, 120) + (q.quote.length > 120 ? "…" : "")}"
                </p>
                {q.quote.length > 120 && (
                  <button
                    onClick={() => setExpandedQuote(expandedQuote === i ? null : i)}
                    className="text-cyan-400 text-xs flex items-center gap-1 mb-3 hover:text-cyan-300"
                  >
                    {expandedQuote === i ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                  </button>
                )}
                <div className="border-t border-white/10 pt-3">
                  <p className="font-semibold text-white text-sm">{q.name}</p>
                  <p className="text-gray-500 text-xs">{q.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-[#060c1a]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Talk to {affiliate.name.split(" ")[0]}</h2>
            <p className="text-gray-400">
              Have questions about ASEA products? {affiliate.name.split(" ")[0]} is here to help.
            </p>
          </div>

          {formSent ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-10 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-300 mb-2">Message Sent!</h3>
              <p className="text-gray-400">
                {affiliate.name.split(" ")[0]} will be in touch with you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Jane Smith"
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="jane@example.com"
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 555 000 0000"
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Message (optional)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us about your health goals or questions about ASEA products…"
                    rows={4}
                    className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm resize-none"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={submitEnquiry.isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {submitEnquiry.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="bg-[#040810] border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-semibold text-white">{affiliate.name}</p>
            <p className="text-gray-500 text-sm">ASEA Brand Partner · Add Life To Your Years</p>
          </div>
          {socials.length > 0 && (
            <div className="flex gap-3">
              {socials.map(s => (
                <SocialIcon key={s.platform} platform={s.platform} url={s.url!} />
              ))}
            </div>
          )}
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} Add Life To Your Years · All rights reserved
            </p>
            <a href="/" className="text-cyan-500 text-xs hover:text-cyan-400">
              addlifetoyouryears.org
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

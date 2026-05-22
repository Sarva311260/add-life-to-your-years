import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Heart, Building2, Dna, Shield, Brain, Compass, Users, Activity,
  BookOpen, ArrowRight, Star, Leaf, ChevronDown, Menu, X, LogOut, User,
  Play, Gift, HeartHandshake, ExternalLink, ShoppingBag, MessageCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

// Helper to read affiliate_slug cookie
function getAffiliateCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)affiliate_slug=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : "";
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  lifestyle: <Heart className="w-6 h-6" />,
  environmental: <Building2 className="w-6 h-6" />,
  genetic: <Dna className="w-6 h-6" />,
  structural: <Shield className="w-6 h-6" />,
  stress: <Brain className="w-6 h-6" />,
  purpose: <Compass className="w-6 h-6" />,
  relationships: <Users className="w-6 h-6" />,
  physical_trauma: <Activity className="w-6 h-6" />,
};

const BOOK_LINK = "/book";

const CATEGORIES = [
  {
    id: "lifestyle", name: "Lifestyle Choices", desc: "Diet, exercise, sleep, and daily habits", color: "bg-green-100 text-green-700",
    detail: "The choices you make every day \u2014 what you eat, how much you move, and the habits you keep \u2014 have the greatest influence on your long-term health. A whole food plant-based diet, regular physical activity, adequate hydration, and avoiding harmful substances like tobacco and alcohol form the foundation of wellness and disease prevention.",
  },
  {
    id: "environmental", name: "Environmental Factors", desc: "Air, water, housing, and neighbourhood", color: "bg-blue-100 text-blue-700",
    detail: "Your surroundings shape your health more than you might realise. Air and water quality, exposure to chemicals and pollutants, the safety of your neighbourhood, and even access to green spaces all play a role. Understanding and improving your environment is a practical step toward better wellbeing.",
  },
  {
    id: "genetic", name: "Genetic & Epigenetic", desc: "Family history and gene expression", color: "bg-orange-100 text-orange-700",
    detail: "Your genes provide a blueprint, but they are not your destiny. While hereditary factors can predispose you to certain conditions, lifestyle and environment determine whether those genes are expressed. Epigenetics shows us that healthy choices can influence gene behaviour across generations.",
  },
  {
    id: "structural", name: "Structural Barriers", desc: "Income, access, and systemic factors", color: "bg-green-100 text-green-700",
    detail: "The systems and structures around you \u2014 healthcare access, education, employment, housing, and social policy \u2014 directly affect your ability to live a healthy life. These broader conditions create the context in which personal health choices are made, and recognising them is the first step toward change.",
  },
  {
    id: "stress", name: "Stress Management", desc: "Coping, boundaries, and resilience", color: "bg-blue-100 text-blue-700",
    detail: "Chronic stress is one of the most underestimated threats to health. It disrupts sleep, weakens immunity, and contributes to conditions ranging from heart disease to mental health challenges. Learning to manage stress through mindfulness, connection, and purposeful living is essential for lasting vitality.",
  },
  {
    id: "purpose", name: "Purpose & Direction", desc: "Meaning, values, and motivation", color: "bg-orange-100 text-orange-700",
    detail: "Having a clear sense of meaning \u2014 whether through work, relationships, creativity, or service \u2014 is strongly linked to better health outcomes and longer life. People who feel purposeful tend to make healthier choices, recover faster from illness, and experience greater resilience.",
  },
  {
    id: "relationships", name: "Relationships", desc: "Social bonds and community", color: "bg-green-100 text-green-700",
    detail: "Strong social connections are as vital to health as nutrition and exercise. Loneliness and isolation carry health risks comparable to smoking, while supportive relationships reduce stress, boost immunity, and promote emotional wellbeing. Quality matters more than quantity.",
  },
  {
    id: "physical_trauma", name: "Physical Trauma", desc: "Injuries, pain, and recovery", color: "bg-blue-100 text-blue-700",
    detail: "Past injuries, surgeries, dental work such as amalgam fillings or root canals, and structural differences in the body can have lasting effects on overall health. Recognising and addressing these physical factors \u2014 including the impact of implants and accumulated trauma \u2014 is an important part of the wellness picture.",
  },
];

const COACHING_STEPS = [
  { step: "01", title: "Assessment", desc: "Complete the 8-factor self-evaluation to establish your baseline wellness profile." },
  { step: "02", title: "Action Plan", desc: "Receive a personalised action plan based on your results, prioritised by urgency." },
  { step: "03", title: "Ongoing Support", desc: "Regular check-ins and progress tracking to keep you on course." },
  { step: "04", title: "Plant-Based Guidance", desc: "Expert guidance on whole food plant-based nutrition for optimal health." },
];

const STATS = [
  { value: "8", label: "Factors" },
  { value: "52", label: "Questions" },
  { value: "1:1", label: "Coaching" },
  { value: "100%", label: "Plant-Based" },
];

function RichProductCard({ product, buyUrl, delay }: { product: any; buyUrl: string; delay: number }) {
  const [expanded, setExpanded] = useState(false);
  const accentBadgeColors = ["bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-sky-100 text-sky-700", "bg-violet-100 text-violet-700"];
  const badgeColor = accentBadgeColors[Math.abs(product.name.charCodeAt(0)) % accentBadgeColors.length];
  const hasFullDesc = product.description && product.description !== product.shortDescription && product.description.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full border-border/60 hover:shadow-lg transition-shadow group overflow-hidden flex flex-col">
        {/* Product Image */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden" style={{ minHeight: 200 }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full object-contain"
              style={{ maxHeight: 220 }}
            />
          ) : (
            <div className="flex items-center justify-center w-full" style={{ height: 200 }}>
              <ShoppingBag className="w-16 h-16 text-emerald-200" />
            </div>
          )}
          {product.category && (
            <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
              {product.category}
            </span>
          )}
        </div>
        {/* Card Body */}
        <CardContent className="p-6 flex flex-col flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-2 leading-snug">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {product.shortDescription || product.description}
          </p>
          {hasFullDesc && (
            <div className="mb-4">
              {expanded && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{product.description}</p>
              )}
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            </div>
          )}
          <div className="mt-auto pt-2">
            {buyUrl !== "#" ? (
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                  Shop Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            ) : (
              <Button variant="outline" className="w-full gap-2" disabled>
                Coming Soon
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [affiliateSlug] = useState(() => getAffiliateCookie());

  // Fetch recommended products with affiliate-specific links
  const { data: recommendedProducts = [] } = trpc.recommendedProducts.list.useQuery(
    { affiliateSlug: affiliateSlug || undefined },
    { retry: false }
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <SEO
      title="Proven Strategies for Health, Wellness & Vitality"
      description="Assess your wellbeing across 8 key factors, uncover your strengths, and receive personalised, evidence-based recommendations to add life to your years."
      canonicalPath="/"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Add Life to Your Years",
        url: "https://www.addlifetoyouryears.org",
        description: "Proven, evidence-based strategies for health, wellness and vitality.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.addlifetoyouryears.org/blog?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }}
    />
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/manus-storage/logo-favicon_d30c3a72.png" alt="Add Life to Your Years" className="w-10 h-10 object-contain rounded-full border-2 border-primary/60 p-0.5 bg-white/80" />
            <span className={`font-serif text-lg font-semibold ${scrolled ? "text-gray-900" : "text-white"}`}>Add Life to Your Years</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-6">
            <a href="#about" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>About</a>
            <Link href="/book" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>The Book</Link>
            <a href="#coaching" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Coaching</a>
            <a href="#products" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Products</a>
            <Link href="/media" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Media</Link>
            <Link href="/blog" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>The Wellness Files</Link>
            <Link href="/consult" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Consult</Link>
            <Link href="/shop" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Shop</Link>
            <Link href="/contact" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Contact</Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Dashboard</Link>
                <Link href="/questionnaire" className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/90 hover:text-white"}`}>Self-Evaluation</Link>
              </>
            )}
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className={`gap-2 ${!scrolled ? "border-white/70 text-white hover:bg-white/20 hover:text-white bg-transparent" : ""}`}>
                    <User className="w-4 h-4" />
                    {user?.name || "Dashboard"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className={`gap-2 ${!scrolled ? "text-white/80 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-700"}`}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" className={`gap-2 ${!scrolled ? "bg-white text-green-900 hover:bg-white/90" : ""}`}>Sign In or Register</Button>
              </a>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="xl:hidden p-2 rounded-lg bg-white/90 text-gray-900 shadow-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-white border-t"
            >
              <nav className="container py-4 flex flex-col gap-3">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">About</a>
                <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">The Book</Link>
                <a href="#coaching" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Coaching</a>
                <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Products</a>
                <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Media</Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">The Wellness Files</Link>
                <Link href="/consult" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Consult</Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Shop</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Contact</Link>
                {isAuthenticated && (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Dashboard</Link>
                    <Link href="/questionnaire" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Self-Evaluation</Link>
                  </>
                )}
                {isAuthenticated ? (
                  <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>Sign Out</Button>
                ) : (
                  <a href={getLoginUrl()}><Button size="sm" className="w-full">Sign In or Register</Button></a>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Splash background image */}
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-bg_f28c1a34.webp"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
        </div>

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Your Personal Blueprint
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Proven Strategies for<br />
                <span className="text-emerald-300">Health, Wellness & Vitality</span>
              </h1>
              <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl mx-auto leading-relaxed">
                Assess your wellbeing across 8 key areas, uncover your strengths,
                and receive personalised, evidence-based recommendations to add life to your years.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/questionnaire">
                  <Button size="lg" className="gap-2 text-base px-8 py-6 shadow-lg shadow-primary/20">
                    Start Your Evaluation
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#about">
                  <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6 border-white text-white hover:bg-white/20 hover:text-white bg-transparent">
                    Learn More
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-border/50">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why This Site */}
      <section id="about" className="py-20 bg-gradient-to-b from-white to-green-50/40">
        <div className="container max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Why This Site
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Problem Isn't a Lack of Information
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-5">
              We live in an age of information abundance. The internet and platforms like YouTube have placed more health knowledge at our fingertips than any library in history. And yet, despite all of that access, people are more confused, more overwhelmed, and more unwell than ever before.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-5">
              The problem is no longer a shortage of information. The problem is the opposite: too much of it, scattered across too many sources, often contradictory, frequently driven by commercial interests, and almost never organised into something a real person can actually use in their daily life.
            </p>
            <p className="text-foreground font-medium text-lg leading-relaxed">
              That is the purpose of this ecosystem — this website, the book, and the resources connected to them. Not to add more noise, but to do the hard work of filtering, organising, and translating the best available evidence into a clear, practical framework for health and vitality. One that respects your intelligence, honours the complexity of the human body, and gives you something you can actually act on.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About the Author / Resume Section */}
      <section id="about-author" className="py-20 bg-white">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <User className="w-4 h-4" />
                About the Author
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Peter Sarva Keller
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Wellness Coach &middot; Plant-Based Nutrition Specialist &middot; Holistic Health Practitioner
              </p>
            </div>

            {/* Bio */}
            <div className="mb-12">
              <p className="text-lg leading-relaxed mb-5 text-muted-foreground">
                Peter Sarva Keller is a seasoned wellness coach with over two decades of hands-on experience spanning plant-based culinary arts, holistic health coaching, water purification technology, and advanced energy medicine. Drawing on a rich background that bridges Vedic dietary traditions, functional nutrition, and cutting-edge bioenergetic therapies, Sarva brings a uniquely integrative approach to individual wellness.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                As the author of the <em>Add Life to Your Years</em> book and the founder of the wellness ecosystem built around it, he has developed a comprehensive 18-step framework grounded in whole-food plant-based principles, empowering clients to take measurable, lasting control of their health.
              </p>
            </div>

            {/* Core Competencies */}
            <div className="mb-12">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Core Competencies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { area: "Nutrition & Diet", detail: "Whole food plant-based, vegetarian & vegan culinary arts, product formulation" },
                  { area: "Energy Medicine", detail: "PEMF therapy (Papimi device, Olylife International), redox signalling, earthing" },
                  { area: "Water & Detoxification", detail: "Water filtration and treatment, cellular detox protocols" },
                  { area: "Coaching & Education", detail: "Freelance wellness coaching, self-evaluation frameworks, lifestyle transformation" },
                  { area: "Network Marketing", detail: "Health product distribution, brand partnership, caf\u00e9 management" },
                  { area: "Bioenergetics", detail: "ASEA redox signalling, PEMF therapy, cellular health optimisation" },
                ].map((item) => (
                  <div key={item.area} className="bg-green-50/60 rounded-xl p-5 border border-green-100">
                    <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wide">{item.area}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Timeline */}
            <div className="mb-12">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Professional Experience</h3>
              <div className="space-y-6">
                {[
                  { period: "2016 \u2013 Present", role: "Freelance Wellness Coach", org: "Independent Practice", desc: "Provides personalised one-on-one wellness coaching delivering the Add Life to Your Years programme \u2014 an 18-recommendation whole food plant-based wellness framework \u2014 supported by a self-evaluation platform, AI-assisted consultation tools, and a comprehensive educational book." },
                  { period: "Ongoing", role: "Platinum Brand Partner", org: "ASEA Global", desc: "Achieved Platinum-level partnership with ASEA Global, a leading company in redox signalling technology. Educates clients on the science of cellular health and redox signalling molecules." },
                  { period: "2010 \u2013 2012", role: "Guest Chef", org: "Madre Tierra Health Resort, Vilcabamba, Ecuador", desc: "Served as guest chef at one of South America's premier holistic health retreats, preparing plant-based cuisine aligned with the resort's detoxification and rejuvenation programmes." },
                  { period: "2004 \u2013 2009", role: "Director", org: "ECOSmart Australasia", desc: "Directed operations for a water filtration and treatment company, overseeing product sourcing, client consultations, and distribution of residential and commercial water purification systems." },
                  { period: "2006 / Current", role: "Certified PEMF Practitioner", org: "Papimi Device \u00b7 Olylife International", desc: "Certified operator of the Papimi PEMF therapy device since 2006. Currently practises with Olylife International PEMF technology, supporting clients with pain management, cellular regeneration, and energetic rebalancing." },
                  { period: "2001 \u2013 2004", role: "Product Formulator", org: "Health Food Industry", desc: "Formulated a range of health food products including the Wunderbar energy bars, applying expertise in whole-food ingredients, nutritional balance, and natural flavour profiles." },
                  { period: "1999 \u2013 2001", role: "Owner & Operator", org: "Jagannath's Caf\u00e9, Kuranda QLD", desc: "Founded and operated a vegetarian caf\u00e9 in the Kuranda rainforest village, serving a community-focused menu rooted in Vedic culinary traditions." },
                  { period: "1983 \u2013 1989", role: "Head Cook & Vegetarian/Vegan Chef", org: "Hare Krishna Temple, Sydney", desc: "Served as Head Cook preparing large-scale vegetarian and vegan meals in accordance with Vedic dietary principles. This foundational role established a lifelong commitment to plant-based nutrition." },
                ].map((item) => (
                  <div key={item.role} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="w-0.5 bg-border flex-1 mt-2" />
                    </div>
                    <div className="pb-6">
                      <span className="text-xs font-medium text-primary uppercase tracking-wide">{item.period}</span>
                      <h4 className="font-semibold text-foreground mt-0.5">{item.role}</h4>
                      <p className="text-sm text-muted-foreground font-medium mb-1">{item.org}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-green-50/60 rounded-2xl p-8 border border-green-100">
              <h3 className="font-serif text-2xl font-bold text-foreground mb-5">Certifications & Partnerships</h3>
              <ul className="space-y-3">
                {[
                  "Certified PEMF Practitioner \u2014 Papimi Device (2006) & Olylife International (current)",
                  "Platinum Brand Partner \u2014 ASEA Global (Redox Signalling Technology)",
                  "Top Performer \u2014 Sunrider International (Whole-food Nutrition)",
                  "Extensive self-directed study in plant-based nutrition, functional medicine, naturopathy, and holistic lifestyle coaching",
                ].map((cert) => (
                  <li key={cert} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8 Health Factors */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              8 Health Factors
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your health and vitality are influenced by many areas of life, often in ways you might not expect. Our evaluation explores each one to reveal a complete picture of your wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, i) => (
              <Dialog key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <DialogTrigger asChild>
                    <button className="w-full text-left" aria-label={`Learn more about ${cat.name}`}>
                    <Card className="h-full hover:shadow-md transition-shadow border-border/60 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          {CATEGORY_ICONS[cat.id]}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.desc}</p>
                      </CardContent>
                    </Card>
                    </button>
                  </DialogTrigger>
                </motion.div>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                        {CATEGORY_ICONS[cat.id]}
                      </div>
                      <DialogTitle className="font-serif text-xl">{cat.name}</DialogTitle>
                    </div>
                  </DialogHeader>
                  <DialogDescription className="text-muted-foreground leading-relaxed text-[0.95rem]">
                    {cat.detail}
                  </DialogDescription>
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      There is much more detail on this topic in the{" "}
                      <a
                        href={BOOK_LINK}
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        Add Life to Your Years
                        <ExternalLink className="w-3 h-3" />
                      </a>{" "}
                      book.
                    </p>
                    <Link href={`/factor/${cat.id}`}>
                      <Button className="w-full gap-2">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </section>

      {/* The Book Section */}
      <section id="book" className="py-20 bg-gradient-to-b from-green-50/50 to-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center">
                <div className="relative bg-gradient-to-br from-primary/10 to-emerald-100 rounded-2xl p-6 md:p-10 inline-block">
                  <Link href="/book">
                    <img
                      src="/manus-storage/book-cover_22986510.webp"
                      alt="Add Life to Your Years book cover"
                      className="w-56 md:w-72 rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-pointer block"
                    />
                  </Link>
                  <div className="absolute -bottom-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                    270 Pages
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-4">
                <BookOpen className="w-4 h-4" />
                The Book
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Add Life to Your Years
              </h2>
              <p className="text-sm text-muted-foreground mb-4 font-medium">by Sarva Keller</p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Did you know your body is home to 30–37 trillion cells — and roughly the same number of
                microbial organisms? You are a <em>holobiont</em>, an ecological unit where human and microbial
                cells work together. This book explores how that partnership shapes your health.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                From the gut-brain axis and serotonin production to cellular communication, self-repair,
                and neuroplasticity — discover why healthspan matters more than lifespan, and how a whole
                food plant-based approach can address the root causes that a 15-minute GP consultation cannot.
              </p>
              <ul className="space-y-3 mb-8">
                {["Part 1: How Our Body Works — Cells, Microbiome & Communication", "Part 2: The 8 Health Factors", "Part 3: Solutions for Health, Wellness & Vitality"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <Star className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/book">
                <Button size="lg" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Click to Read
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wellness Coaching Section */}
      <section id="coaching" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Wellness Coaching
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A structured, personalised approach to transforming your health through evidence-based
              guidance and ongoing support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {COACHING_STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-3xl font-bold text-primary/20 mb-3">{step.step}</div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" className="gap-2" onClick={() => window.open("mailto:contact@example.com", "_blank")}>
              Enquire About Coaching
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section id="products" className="py-20 bg-gradient-to-b from-green-50/50 to-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recommended Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Carefully selected resources to support your wellness journey.
            </p>
          </div>

          {recommendedProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Product recommendations coming soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {(recommendedProducts as any[]).map((product: any, i: number) => {
                const buyUrl = product.affiliateUrl || product.defaultAffiliateUrl || product.productUrl || "#";
                return (
                  <RichProductCard key={product.id} product={product} buyUrl={buyUrl} delay={i * 0.1} />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Free Access & Donations */}
      <section className="py-20 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <HeartHandshake className="w-4 h-4" />
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Freely Given, Freely Shared
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                We believe that access to good health information should never depend on your
                ability to pay. That is why our self-evaluation, educational content, media library,
                and digital resources are completely free — no subscriptions, no paywalls, no
                hidden fees.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Physical products and in-person consultations are offered separately, but
                everything you need to begin understanding and improving your health is
                available to you right now, at no cost.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-5">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">Free Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Self-evaluation, personalised results, educational articles, videos,
                    and the full media library — all free, always.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-5">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-3">Support Our Work</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    If this platform has been helpful to you, a voluntary donation helps us
                    keep it running and reach more people. Every contribution is appreciated.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => { import("sonner").then(m => m.toast.info("Donation page coming soon — thank you for your generosity!")); }}>
                    <Gift className="w-4 h-4" />
                    Make a Donation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white relative overflow-hidden" style={{backgroundImage: 'url(/manus-storage/cta-bg_6daa03ec.webp)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="container text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Health?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto text-lg mb-8">
              Take the first step toward understanding your complete wellness picture.
              Your personalised evaluation takes about 15 minutes.
            </p>
            <Link href="/questionnaire">
              <Button size="lg" variant="secondary" className="gap-2 text-base px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg">
                Start Your Evaluation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/manus-storage/logo-favicon_d30c3a72.png" alt="Add Life to Your Years" className="w-8 h-8 object-contain" />
                <span className="font-serif font-semibold text-white">Add Life to Your Years</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering individuals to take control of their health through evidence-based
                assessment and whole food plant-based wellness coaching.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#book" className="hover:text-white transition-colors">The Book</a></li>
                <li><a href="#coaching" className="hover:text-white transition-colors">Coaching</a></li>
                <li><a href="#products" className="hover:text-white transition-colors">Products</a></li>
                <li><Link href="/media" className="hover:text-white transition-colors">Media</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">The Wellness Files</Link></li>
                <li><Link href="/consult" className="hover:text-white transition-colors">Consult</Link></li>
                <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/questionnaire" className="hover:text-white transition-colors">Self-Evaluation</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
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
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className={`font-serif text-lg font-semibold ${scrolled ? "text-foreground" : "text-white"}`}>Add Life to Your Years</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>About</a>
            <Link href="/book" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>The Book</Link>
            <a href="#coaching" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Coaching</a>
            <a href="#products" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Products</a>
            <Link href="/media" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Media</Link>
            <Link href="/store" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Store</Link>
            <Link href="/contact" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Contact</Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Dashboard</Link>
                <Link href="/questionnaire" className={`text-sm font-medium transition-colors ${scrolled ? "text-muted-foreground hover:text-foreground" : "text-white/90 hover:text-white"}`}>Self-Evaluation</Link>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className={`gap-2 ${!scrolled ? "border-white/70 text-white hover:bg-white/20 hover:text-white bg-transparent" : ""}`}>
                    <User className="w-4 h-4" />
                    {user?.name || "Dashboard"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className={`gap-2 ${!scrolled ? "text-white/80 hover:text-white hover:bg-white/10" : "text-muted-foreground"}`}>
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
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              className="md:hidden bg-white border-t"
            >
              <nav className="container py-4 flex flex-col gap-3">
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">About</a>
                <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">The Book</Link>
                <a href="#coaching" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Coaching</a>
                <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Products</a>
                <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Media</Link>
                <Link href="/store" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Store</Link>
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
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/homepage_splash_hero-k75ERSHXrCb53wbbii2uGm.webp"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
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
                  <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6 border-white/70 text-white hover:bg-white/20 hover:text-white bg-transparent">
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

      {/* 8 Health Factors */}
      <section id="about" className="py-20 bg-white">
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
                    <Card className="h-full hover:shadow-md transition-shadow border-border/60 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          {CATEGORY_ICONS[cat.id]}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.desc}</p>
                      </CardContent>
                    </Card>
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
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/book-cover-UsuL2YkEq9DNQMFM4uAv7v.webp"
                      alt="Add Life to Your Years book cover"
                      className="w-56 md:w-72 rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-pointer block"
                    />
                  </Link>
                  <div className="absolute -bottom-3 -right-3 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
                    128 Pages
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

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Supplements",
                desc: "High-quality, plant-based supplements to fill nutritional gaps and support optimal health.",
                icon: <Leaf className="w-6 h-6" />,
                color: "bg-green-100 text-green-700",
              },
              {
                title: "Kitchen Essentials",
                desc: "Tools and equipment to make whole food plant-based cooking easy, enjoyable, and efficient.",
                icon: <Star className="w-6 h-6" />,
                color: "bg-orange-100 text-orange-700",
              },
              {
                title: "Educational Resources",
                desc: "Books, courses, and guides to deepen your understanding of health, nutrition, and wellness.",
                icon: <BookOpen className="w-6 h-6" />,
                color: "bg-blue-100 text-blue-700",
              },
            ].map((product, i) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/60 hover:shadow-md transition-shadow group">
                  <CardContent className="p-8 text-center">
                    <div className={`w-14 h-14 rounded-xl ${product.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                      {product.icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-3">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{product.desc}</p>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => { import("sonner").then(m => m.toast.info("Product listings coming soon!")); }}>
                      Browse
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
      <section className="py-20 bg-gradient-to-br from-primary to-emerald-600 text-white">
        <div className="container text-center">
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
                <Leaf className="w-5 h-5 text-primary" />
                <span className="font-serif font-semibold text-white">Add Life to Your Years</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering individuals to take control of their health through evidence-based
                assessment and whole food plant-based wellness coaching.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#book" className="hover:text-white transition-colors">The Book</a></li>
                <li><a href="#coaching" className="hover:text-white transition-colors">Coaching</a></li>
                <li><a href="#products" className="hover:text-white transition-colors">Products</a></li>
                <li><Link href="/media" className="hover:text-white transition-colors">Media</Link></li>
                <li><Link href="/store" className="hover:text-white transition-colors">Store</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Get Started</h4>
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
  );
}

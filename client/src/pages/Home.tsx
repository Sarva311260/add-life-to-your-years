import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Heart, Building2, Dna, Shield, Brain, Compass, Users, Activity,
  BookOpen, ArrowRight, Star, Leaf, ChevronDown, Menu, X, LogOut, User
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

const CATEGORIES = [
  { id: "lifestyle", name: "Lifestyle Choices", desc: "Diet, exercise, sleep, and daily habits", color: "bg-green-100 text-green-700" },
  { id: "environmental", name: "Environmental Factors", desc: "Air, water, housing, and neighbourhood", color: "bg-blue-100 text-blue-700" },
  { id: "genetic", name: "Genetic & Epigenetic", desc: "Family history and gene expression", color: "bg-orange-100 text-orange-700" },
  { id: "structural", name: "Structural Barriers", desc: "Income, access, and systemic factors", color: "bg-green-100 text-green-700" },
  { id: "stress", name: "Stress Management", desc: "Coping, boundaries, and resilience", color: "bg-blue-100 text-blue-700" },
  { id: "purpose", name: "Purpose & Direction", desc: "Meaning, values, and motivation", color: "bg-orange-100 text-orange-700" },
  { id: "relationships", name: "Relationships", desc: "Social bonds and community", color: "bg-green-100 text-green-700" },
  { id: "physical_trauma", name: "Physical Trauma", desc: "Injuries, pain, and recovery", color: "bg-blue-100 text-blue-700" },
];

const COACHING_STEPS = [
  { step: "01", title: "Assessment", desc: "Complete the 8-dimension self-evaluation to establish your baseline wellness profile." },
  { step: "02", title: "Action Plan", desc: "Receive a personalised action plan based on your results, prioritised by urgency." },
  { step: "03", title: "Ongoing Support", desc: "Regular check-ins and progress tracking to keep you on course." },
  { step: "04", title: "Plant-Based Guidance", desc: "Expert guidance on whole food plant-based nutrition for optimal health." },
];

const STATS = [
  { value: "8", label: "Dimensions" },
  { value: "50", label: "Questions" },
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
            <span className="font-serif text-lg font-semibold text-foreground">Health, Wellness & Vitality</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#book" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">The Book</a>
            <a href="#coaching" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Coaching</a>
            <a href="#products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Products</a>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
                <Link href="/questionnaire" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Self-Evaluation</Link>
              </>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.name || "Dashboard"}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2 text-muted-foreground">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" className="gap-2">Sign In or Register</Button>
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
                <a href="#book" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">The Book</a>
                <a href="#coaching" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Coaching</a>
                <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Products</a>
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
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/50 to-white" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />

        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                Whole Food Plant-Based Wellness
              </span>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Transform Your Health,{" "}
                <span className="text-primary">Naturally</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Assess your wellbeing across 8 key dimensions, uncover your strengths and challenges,
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
                  <Button variant="outline" size="lg" className="gap-2 text-base px-8 py-6">
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

      {/* 8 Health Challenge Categories */}
      <section id="about" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              8 Health Challenge Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your wellbeing is shaped by multiple interconnected factors. Our evaluation assesses each dimension
              to give you a complete picture of your health landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow border-border/60 group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {CATEGORY_ICONS[cat.id]}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
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
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-emerald-100 rounded-2xl p-8 md:p-12 flex items-center justify-center">
                  <div className="bg-white rounded-lg shadow-xl p-6 w-56 md:w-64 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-md p-4 mb-4 text-white text-center">
                      <Leaf className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-serif text-sm font-bold leading-tight">Add Life to<br />Your Years</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">A Guide to</div>
                      <div className="font-serif text-sm font-semibold text-foreground leading-tight">Health, Wellness<br />& Vitality</div>
                    </div>
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
                {["Part 1: How Our Body Works — Cells, Microbiome & Communication", "Part 2: The 8 Categories of Health Challenges", "Part 3: Solutions for Health, Wellness & Vitality"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <Star className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="gap-2" disabled>
                Coming Soon
              </Button>
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
                <span className="font-serif font-semibold text-white">Health, Wellness & Vitality</span>
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
            <p>&copy; {new Date().getFullYear()} Health, Wellness & Vitality. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

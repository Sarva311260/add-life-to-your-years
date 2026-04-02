import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="font-serif text-lg font-semibold text-foreground">Add Life to Your Years</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl py-16">
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-orange-100">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
            Medical Disclaimer
          </h1>
        </div>

        <div className="prose prose-green max-w-none space-y-6 text-foreground">

          {/* Callout box */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <p className="text-orange-800 font-semibold text-base leading-relaxed m-0">
              The information provided on this website, in the book <em>Add Life to Your Years</em>, and through any associated coaching, media, or educational materials is intended for general informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment.
            </p>
          </div>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Not a Substitute for Professional Medical Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nothing on this website or in any associated content should be interpreted as a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always seek the advice of your physician, general practitioner, or other qualified health professional with any questions you may have regarding a medical condition, symptom, or health concern.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Never disregard professional medical advice or delay seeking it because of something you have read on this website, in this book, or in any associated materials. If you think you may have a medical emergency, call your doctor, local emergency services, or go to the nearest emergency room immediately.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Educational Purpose Only</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content — including articles, book chapters, videos, podcasts, self-evaluation tools, and coaching materials — is provided for educational and informational purposes only. The aim is to share evidence-based research and practical wellness strategies to support informed decision-making, not to diagnose, treat, cure, or prevent any disease or health condition.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              References to specific research studies, clinical trials, or scientific literature are provided for context and transparency. These references do not imply endorsement of any particular treatment, product, or approach, nor do they constitute a claim that any specific outcome will be achieved.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Individual Results May Vary</h2>
            <p className="text-muted-foreground leading-relaxed">
              Health and wellness outcomes are highly individual. Factors including genetics, existing medical conditions, medications, lifestyle, and personal circumstances all influence how any given approach may affect a particular individual. Case studies, testimonials, and examples shared in this content reflect individual experiences and should not be taken as typical or guaranteed results.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Dietary and Nutritional Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nutritional recommendations, dietary strategies, and supplement information provided on this platform are general in nature. Before making significant changes to your diet, beginning a new supplement regimen, or undertaking any nutritional protocol, please consult with a qualified healthcare professional or registered dietitian — particularly if you have a pre-existing medical condition, are pregnant or breastfeeding, or are taking prescription medications.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Self-Evaluation Tool</h2>
            <p className="text-muted-foreground leading-relaxed">
              The self-evaluation questionnaire available on this platform is a wellness awareness tool designed to help you reflect on key areas of your health and identify potential areas for improvement. It is not a clinical assessment, diagnostic instrument, or substitute for professional evaluation. Scores and recommendations generated by this tool are indicative only and should be discussed with a qualified healthcare provider before acting upon them.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Wellness Coaching</h2>
            <p className="text-muted-foreground leading-relaxed">
              Wellness coaching services offered through this platform are educational and supportive in nature. Coaching is not a regulated health profession in all jurisdictions and does not constitute medical, psychological, or therapeutic treatment. Coaching is intended to complement — not replace — the care of qualified medical and mental health professionals.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Third-Party References and Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              This website may reference or link to third-party websites, research publications, products, or services. These references are provided for convenience and informational purposes only. We do not endorse, warrant, or assume responsibility for the accuracy, completeness, or suitability of any third-party content, products, or services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, the author, website owner, and any associated contributors, coaches, or collaborators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or reliance on, any information provided through this platform, the book <em>Add Life to Your Years</em>, or any associated services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-foreground mb-3">Consult Your Healthcare Provider</h2>
            <p className="text-muted-foreground leading-relaxed">
              Before beginning any new health, wellness, dietary, exercise, or supplement programme, we strongly encourage you to consult with your qualified healthcare provider. This is especially important if you have a diagnosed medical condition, are currently taking prescription medications, are pregnant or breastfeeding, are recovering from illness or surgery, or have any other health concern that may be relevant.
            </p>
          </section>

          {/* Last updated */}
          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-muted-foreground">
              Last updated: April 2026. This disclaimer applies to all content published on this website and in the book <em>Add Life to Your Years</em> by Sarva.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-8">
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Add Life to Your Years · Sarva ·{" "}
            <Link href="/disclaimer" className="underline hover:text-foreground transition-colors">
              Medical Disclaimer
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Leaf, ArrowLeft, ShoppingBag, Package, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const STORE_ITEMS = [
  {
    title: "Add Life to Your Years — The Book",
    desc: "A comprehensive guide to health, wellness, and vitality through whole food plant-based living. Covers the 8 health factors, how your body works, and practical wellness strategies.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-green-100 text-green-700",
    price: "Coming Soon",
  },
  {
    title: "Wellness Starter Kit",
    desc: "A curated collection of resources to help you begin your journey toward better health, including guides, checklists, and recommended products.",
    icon: <Package className="w-6 h-6" />,
    color: "bg-orange-100 text-orange-700",
    price: "Coming Soon",
  },
  {
    title: "Coaching Packages",
    desc: "One-on-one personalised wellness coaching sessions to help you implement changes, stay accountable, and achieve your health goals.",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-blue-100 text-blue-700",
    price: "Coming Soon",
  },
];

export default function Store() {
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
              <ShoppingBag className="w-4 h-4" />
              Store
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Products & Services
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Resources and services to support your wellness journey. All digital content
              on this site remains free — these are optional products for those who want to go deeper.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {STORE_ITEMS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="h-full border-border/60 hover:shadow-md transition-shadow group">
                  <CardContent className="p-8 text-center flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-3">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">{item.desc}</p>
                    <div className="mt-auto">
                      <span className="text-sm font-medium text-primary mb-3 block">{item.price}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => toast.info("This product will be available soon — check back later!")}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Notify Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-white/70 mt-12">
        <div className="container text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Add Life to Your Years. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

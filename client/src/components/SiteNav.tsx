import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

/**
 * SiteNav — shared top navigation bar for all non-home pages.
 * Uses a solid light background (no scroll-based transparency) since
 * these pages don't have a full-bleed hero image behind the header.
 */
export default function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [currentLocation] = useLocation();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-border/40">
      <div className="container flex items-center justify-between h-16">
        {/* Logo / Home */}
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="font-serif text-base font-semibold text-foreground hidden sm:block">
            Add Life to Your Years
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/book" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            The Book
          </Link>
          <Link href="/media" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Media
          </Link>
          <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            The Wellness Files
          </Link>
          <Link href="/consult" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Consult
          </Link>
          <Link href="/shop" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/questionnaire" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Self-Evaluation
              </Link>
            </>
          )}
        </nav>

        {/* Auth buttons (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
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
            <a href={getLoginUrl(currentLocation)}>
              <Button size="sm">Sign In or Register</Button>
            </a>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-foreground"
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
            className="md:hidden bg-white border-t border-border/40"
          >
            <nav className="container py-4 flex flex-col gap-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Home</Link>
              <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">The Book</Link>
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
                <Button variant="outline" size="sm" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                  Sign Out
                </Button>
              ) : (
                <a href={getLoginUrl(currentLocation)}>
                  <Button size="sm" className="w-full">Sign In or Register</Button>
                </a>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

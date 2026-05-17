import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

/**
 * SiteNav — shared top navigation bar for all non-home pages.
 * Solid white background. Switches to hamburger at <lg to avoid overflow.
 */
export default function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [currentLocation] = useLocation();

  const linkClass =
    "text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap";

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="container flex items-center justify-between h-14">
        {/* Logo / Home */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="font-serif text-sm font-semibold text-gray-900 hidden sm:block">
            Add Life to Your Years
          </span>
        </Link>

        {/* Desktop Nav — visible at lg+ */}
        <nav className="hidden lg:flex items-center gap-4 flex-1 justify-center">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/book" className={linkClass}>The Book</Link>
          <Link href="/media" className={linkClass}>Media</Link>
          <Link href="/blog" className={linkClass}>The Wellness Files</Link>
          <Link href="/consult" className={linkClass}>Consult</Link>
          <Link href="/shop" className={linkClass}>Shop</Link>
          <Link href="/contact" className={linkClass}>Contact</Link>
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className={linkClass}>Dashboard</Link>
              <Link href="/questionnaire" className={linkClass}>Self-Evaluation</Link>
            </>
          )}
        </nav>

        {/* Auth buttons (desktop) */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-3 text-gray-800 border-gray-400 font-semibold">
                  <User className="w-3.5 h-3.5 text-gray-800" />
                  <span className="max-w-[80px] truncate">{user?.name || "Account"}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="gap-1.5 text-gray-600 h-8 w-8 p-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <a href={getLoginUrl(currentLocation)}>
              <Button size="sm" className="text-xs h-8 px-3">Sign In</Button>
            </a>
          )}
        </div>

        {/* Mobile / tablet menu toggle — visible below lg */}
        <button
          className="lg:hidden p-2 text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile / tablet Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <nav className="container py-4 flex flex-col gap-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Home</Link>
              <Link href="/book" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">The Book</Link>
              <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Media</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">The Wellness Files</Link>
              <Link href="/consult" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Consult</Link>
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Shop</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Contact</Link>
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Dashboard</Link>
                  <Link href="/questionnaire" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-700 py-1.5">Self-Evaluation</Link>
                </>
              )}
              <div className="pt-2 border-t border-gray-100">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-700"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <a href={getLoginUrl(currentLocation)} className="block">
                    <Button size="sm" className="w-full">Sign In or Register</Button>
                  </a>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

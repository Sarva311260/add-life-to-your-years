import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, ArrowLeft, Search, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SynergyInfographic from "@/components/SynergyInfographic";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/AddLifeToYourYears-v6_abfc567f.pdf";
const MD_CDN_URL = "/manus-storage/book-content_23c60cd2.md";

const chapters = [
  { id: "introduction", label: "Introduction" },
  { id: "part-one", label: "Part One: How Our Body Works" },
  { id: "chapter-1", label: "Ch 1: A Universe of Cells" },
  { id: "chapter-2", label: "Ch 2: The Microbiome" },
  { id: "chapter-3", label: "Ch 3: Cell Communication" },
  { id: "chapter-4", label: "Ch 4: Redox Biochemistry" },
  { id: "part-two", label: "Part Two: The 8 Factors" },
  { id: "part-three", label: "Part Three: Wellness Strategies" },
  { id: "chapter-5", label: "Ch 5: Air" },
  { id: "chapter-6", label: "Ch 6: Water" },
  { id: "chapter-7", label: "Ch 7: Sleep" },
  { id: "chapter-8", label: "Ch 8: Food" },
  { id: "chapter-9", label: "Ch 9: Shelter" },
  { id: "chapter-10", label: "Ch 10: Security & Stability" },
  { id: "chapter-11", label: "Ch 11: Financial Safety" },
  { id: "chapter-12", label: "Ch 12: Meaningful Connection" },
  { id: "chapter-13", label: "Ch 13: Self-Respect" },
  { id: "chapter-14", label: "Ch 14: Purpose & Meaning" },
  { id: "conclusion", label: "Conclusion" },
  { id: "part-four", label: "Part Four: John's Path Forward" },
  { id: "rec-1", label: "Rec 1: Whole Food Plant-Based" },
  { id: "rec-2", label: "Rec 2: Water" },
  { id: "rec-3", label: "Rec 3: Cellular Detoxification" },
  { id: "rec-4", label: "Rec 4: Redox Signalling (ASEA)" },
  { id: "rec-5", label: "Rec 5: Sleep & Melatonin" },
  { id: "rec-6", label: "Rec 6: Glycine" },
  { id: "rec-7", label: "Rec 7: Five Seeds of Life" },
  { id: "rec-8", label: "Rec 8: Gut Health & Microbiome" },
  { id: "rec-9", label: "Rec 9: Vitamin B12 & D" },
  { id: "rec-10", label: "Rec 10: Six Movements" },
  { id: "rec-11", label: "Rec 11: Breathing" },
  { id: "rec-12", label: "Rec 12: PEMF & Earthing" },
  { id: "rec-13", label: "Rec 13: Meditation" },
  { id: "rec-14", label: "Rec 14: Time in Nature" },
  { id: "rec-15", label: "Rec 15: Repairing the Relationship" },
  { id: "rec-16", label: "Rec 16: Second Income Stream" },
  { id: "rec-17", label: "Rec 17: Your Environment" },
  { id: "rec-18", label: "Rec 18: Methylene Blue" },
  { id: "john-6-months", label: "John, Six Months Later" },
  { id: "john-12-months", label: "John, Twelve Months Later" },
  { id: "a-note", label: "A Note on the Journey" },
  { id: "glossary", label: "Glossary" },
  { id: "appendix-a", label: "Appendix A: Diet Comparison" },
  { id: "appendix-b", label: "Appendix B: Cold Showers" },
  { id: "appendix-c", label: "Appendix C: Off-Label Pharmaceuticals" },
  { id: "appendix-d", label: "Appendix D: Brazil Nuts & Selenium" },
  { id: "wellness-blueprint", label: "Your Wellness Blueprint at a Glance" },
];

// Map heading text to anchor IDs — longer keys first to prevent false prefix matches
const headingIdMap: Record<string, string> = {
  "Recommendation 10": "rec-10",
  "Recommendation 11": "rec-11",
  "Recommendation 12": "rec-12",
  "Recommendation 13": "rec-13",
  "Recommendation 14": "rec-14",
  "Recommendation 15": "rec-15",
  "Recommendation 16": "rec-16",
  "Recommendation 17": "rec-17",
  "Recommendation 18": "rec-18",
  "Recommendation 1": "rec-1",
  "Recommendation 2": "rec-2",
  "Recommendation 3": "rec-3",
  "Recommendation 4": "rec-4",
  "Recommendation 5": "rec-5",
  "Recommendation 6": "rec-6",
  "Recommendation 7": "rec-7",
  "Recommendation 8": "rec-8",
  "Recommendation 9": "rec-9",
  "Chapter 10": "chapter-10",
  "Chapter 11": "chapter-11",
  "Chapter 12": "chapter-12",
  "Chapter 13": "chapter-13",
  "Chapter 14": "chapter-14",
  "Chapter 1": "chapter-1",
  "Chapter 2": "chapter-2",
  "Chapter 3": "chapter-3",
  "Chapter 4": "chapter-4",
  "Chapter 5": "chapter-5",
  "Chapter 6": "chapter-6",
  "Chapter 7": "chapter-7",
  "Chapter 8": "chapter-8",
  "Chapter 9": "chapter-9",
  "Introduction": "introduction",
  "Part One": "part-one",
  "Part Two": "part-two",
  "Part Three": "part-three",
  "Part Four": "part-four",
  "Conclusion": "conclusion",
  "John, Six Months Later": "john-6-months",
  "John, Twelve Months Later": "john-12-months",
  "A Note on the Journey": "a-note",
  "Glossary": "glossary",
  "Your Wellness Blueprint at a Glance": "wellness-blueprint",
  "Appendix C": "appendix-c",
  "Appendix D": "appendix-d",
  "Appendix B": "appendix-b",
  "Appendix A": "appendix-a",
};

// Sort keys by length descending so longer keys match first
const sortedHeadingKeys = Object.keys(headingIdMap).sort((a, b) => b.length - a.length);

function getHeadingId(children: React.ReactNode): string {
  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node && typeof node === "object" && "props" in (node as React.ReactElement)) {
      return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
    }
    return "";
  };
  const text = extractText(children);
  for (const key of sortedHeadingKeys) {
    if (text.includes(key)) return headingIdMap[key];
  }
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Highlight search terms in text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 search-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

interface SearchResult {
  lineIndex: number;
  lineText: string;
  context: string;
  matchIndex: number;
}

function buildSearchResults(content: string, query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const lines = content.split("\n");
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase();
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(lowerQuery)) {
      // Get surrounding context (strip markdown markers)
      const clean = line.replace(/^#+\s*/, "").replace(/[*_`>]/g, "");
      const contextStart = Math.max(0, idx - 1);
      const contextLines = lines.slice(contextStart, idx + 2)
        .map(l => l.replace(/^#+\s*/, "").replace(/[*_`>]/g, "").trim())
        .filter(Boolean)
        .join(" ");
      results.push({
        lineIndex: idx,
        lineText: clean,
        context: contextLines.slice(0, 120) + (contextLines.length > 120 ? "…" : ""),
        matchIndex: results.length,
      });
    }
  });
  return results.slice(0, 50); // cap at 50 results
}

// Video entries for each recommendation (supports YouTube and Rumble)
type VideoEntry = { youtubeId?: string; rumbleUrl?: string; title: string };
const REC_VIDEOS: Record<string, VideoEntry[]> = {
  "rec-1": [
    { youtubeId: "wb7L3t0ejdI", title: "Whole Food Plant-Based Diet" },
    { youtubeId: "ztIZoaKTeqk", title: "Whole Food Plant-Based Living" },
  ],
  "rec-2": [
    { youtubeId: "VRzjoIgHNb0", title: "Water & Hydration — Quality, Purity & Health" },
    { youtubeId: "KcYV0Wjx_2k", title: "Water & Hydration — The Science of Staying Hydrated" },
  ],
  "rec-3": [{ rumbleUrl: "https://rumble.com/embed/v6zz56g/", title: "Dr. Robert Young Speaks On MasterPeace" }, { rumbleUrl: "https://rumble.com/embed/v75is4o/", title: "Why Is MasterPeace So Powerful Yet Gentle?" }],
  "rec-4": [],
  "rec-5": [{ youtubeId: "tcwVfUAqWiY", title: "Sleep & Melatonin" }],
  "rec-6": [{ youtubeId: "o2Kc1Iaow40", title: "Glycine" }],
  "rec-7": [{ youtubeId: "YckoR3hLL9E", title: "Five Seeds of Life" }],
  "rec-8": [{ youtubeId: "ndqvqAOsFtQ", title: "Gut Health & Microbiome" }],
  "rec-9": [
    { youtubeId: "wY4vEBilWN4", title: "Vitamin B12" },
    { youtubeId: "qiR4yBymtwY", title: "Vitamin D3 — Dr. Michael Holick" },
    { youtubeId: "iotnggfP9Yk", title: "Vitamin D3" },
    { youtubeId: "uxWARJ4s95Y", title: "Vitamin D3 (Part 2)" },
  ],
  "rec-10": [{ youtubeId: "qu3ixTQmpl0", title: "Six Movements" }],
  "rec-11": [
    { youtubeId: "8vN08IuParo", title: "Bhramari Pranayama — Bee Breath" },
    { youtubeId: "QVoGbaq8xos", title: "Breathing — The Power of Conscious Breath" },
  ],
  "rec-12": [
    { youtubeId: "byinppKR9LY", title: "PEMF Therapy & Redox Signalling" },
    { youtubeId: "LKOli-nNALM", title: "PEMF & Earthing — Reconnecting with the Earth's Field" },
  ],
  "rec-13": [{ youtubeId: "wXsxwIJnUJk", title: "Meditation" }],
  "rec-14": [{ youtubeId: "UHv3SCUioQU", title: "Time in Nature" }],
  "rec-15": [{ youtubeId: "rgQvqi6aYD8", title: "Repairing the Relationship" }],
  "rec-16": [{ youtubeId: "eD0N8wXjNSs", title: "Second Income Stream" }],
  "rec-17": [{ youtubeId: "foBnfBX4YKQ", title: "Your Environment" }],
  "rec-18": [{ youtubeId: "KvASX2yp0zU", title: "Methylene Blue & Photobiomodulation" }],
  "rec-appendix-cold-showers": [
    { youtubeId: "xTVMGyJ8cZU", title: "Cold Showers — Hormesis, Inflammation & Cognitive Benefits" },
    { youtubeId: "may_PlDfNRE", title: "The Science Behind Cold Showers — 5 Evidence-Based Benefits" },
  ],
  "rec-appendix-off-label": [
    { youtubeId: "QBnT8es28WY", title: "Fenbendazole — The Joe Tippens Protocol & Cancer Research" },
    { youtubeId: "5Q5QjEPGNNg", title: "Fenbendazole & Ivermectin — Stanford Case Series & Mechanisms" },
    { youtubeId: "Ck4_fX1xaaw", title: "Largest Real-World Study: Ivermectin + Mebendazole in 197 Cancer Patients — 84.4% Clinical Benefit" },
  ],
  "rec-appendix-diet": [
    { youtubeId: "Weg9GUnH24E", title: "What Humans Are Designed to Eat" },
    { youtubeId: "nEjuZsP8o7g", title: "The Ketogenic Diet — Is It Healthy?" },
    { youtubeId: "MJVSD0hggZE", title: "The Ketogenic Diet is a Scam" },
    { youtubeId: "uVGpTLMN6w4", title: "Mediterranean Diet vs WFPB" },
    { youtubeId: "dpyz-AumCUk", title: "Is a Plant-Based Diet Always Healthy?" },
  ],
};

const SCROLL_STORAGE_KEY = "book-reader-scroll";

// Product map: product ID → { name, defaultUrl }
const PRODUCT_MAP: Record<number, { name: string; defaultUrl: string }> = {
  1: { name: "MasterPeace Nano-Zeolite", defaultUrl: "https://mphcs.com/760a4938d9449080" },
  30001: { name: "PEMF Therapy Devices", defaultUrl: "https://addlifetoyouryears.org/pemf" },
};

function getAffiliateCookie(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)affiliate_slug=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getProductUrl(productId: number, affiliateSlug: string | null): string {
  if (affiliateSlug) return `/go/${affiliateSlug}/${productId}`;
  return PRODUCT_MAP[productId]?.defaultUrl || "#";
}

export default function BookReader() {
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [highlightQuery, setHighlightQuery] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<VideoEntry[] | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);
  const [blueprintScrollPos, setBlueprintScrollPos] = useState<number | null>(null);
  const [affiliateSlug] = useState<string | null>(() => getAffiliateCookie());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(MD_CDN_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.text();
      })
      .then((text) => {
        setBookContent(text);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Restore scroll position when returning from a video modal
  useEffect(() => {
    if (!loading && bookContent) {
      const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (saved) {
        const scrollY = parseInt(saved, 10);
        sessionStorage.removeItem(SCROLL_STORAGE_KEY);
        // Small delay to let the content render before scrolling
        setTimeout(() => window.scrollTo({ top: scrollY, behavior: "instant" }), 150);
      }
    }
  }, [loading, bookContent]);

  // Intercept clicks on media links to open video modal instead of navigating away
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href") || "";
      // Check if this is a media link with a rec or appendix hash
      const mediaMatch = href.match(/media#((?:rec|appendix)-[\w-]+)/);
      if (mediaMatch) {
        e.preventDefault();
        const hashId = mediaMatch[1];
        // Try direct match first, then with rec- prefix for appendix links
        const videos = REC_VIDEOS[hashId] || REC_VIDEOS[`rec-${hashId}`];
        if (videos) {
          setVideoModal(videos);
        }
        return;
      }
      if (href.includes("from=reader")) {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+F / Cmd+F to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setHighlightQuery("");
        setSearchResults([]);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearch = useCallback(() => {
    const results = buildSearchResults(bookContent, searchQuery);
    setSearchResults(results);
    setCurrentResultIndex(0);
    setHighlightQuery(searchQuery);
    // Scroll to first result
    if (results.length > 0) {
      setTimeout(() => {
        const highlights = document.querySelectorAll(".search-highlight");
        if (highlights[0]) {
          highlights[0].scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [bookContent, searchQuery]);

  const navigateResult = (direction: "next" | "prev") => {
    const highlights = document.querySelectorAll(".search-highlight");
    if (highlights.length === 0) return;
    let next = direction === "next"
      ? (currentResultIndex + 1) % highlights.length
      : (currentResultIndex - 1 + highlights.length) % highlights.length;
    setCurrentResultIndex(next);
    highlights[next]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    setSidebarOpen(false);
    const HEADER_OFFSET = 72;

    // First pass: instant scroll to approximate position
    const doScroll = () => {
      const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    };

    doScroll();

    // Second pass: wait for lazy images above the target to finish loading,
    // then re-scroll to the now-stable position.
    // We observe the document body for size changes and re-scroll up to ~800ms.
    let settled = false;
    const resizeObserver = new ResizeObserver(() => {
      if (settled) return;
      doScroll();
    });
    resizeObserver.observe(document.body);
    setTimeout(() => {
      settled = true;
      resizeObserver.disconnect();
      // Final authoritative scroll after layout has stabilised
      doScroll();
    }, 800);
  };

  // Wrap text renderer to highlight search matches
  const makeTextRenderer = (query: string) => {
    if (!query || query.length < 2) return undefined;
    return ({ children }: { children: React.ReactNode }) => {
      if (typeof children === "string") return <>{highlightText(children, query)}</>;
      return <>{children}</>;
    };
  };

  const totalHighlights = document.querySelectorAll(".search-highlight").length;

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Link href="/book">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <span className="font-serif font-semibold text-foreground text-sm sm:text-base">
              Add Life to Your Years
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="text-stone-600 hover:text-stone-900"
              title="Search (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </Button>

          </div>
        </div>

        {/* Search bar — slides down below header */}
        {searchOpen && (
          <div className="border-t border-stone-200 bg-white px-4 py-2 flex items-center gap-2">
            <Search className="h-4 w-4 text-stone-400 shrink-0" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setHighlightQuery("");
                  setSearchResults([]);
                  setSearchQuery("");
                }
              }}
              placeholder="Search the book… (Enter to search)"
              className="flex-1 h-8 text-sm border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />
            {searchResults.length > 0 && (
              <span className="text-xs text-stone-500 shrink-0 whitespace-nowrap">
                {totalHighlights > 0 ? `${currentResultIndex + 1} / ${totalHighlights}` : `${searchResults.length} results`}
              </span>
            )}
            {searchResults.length > 0 && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateResult("prev")}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateResult("next")}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </>
            )}
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-stone-500"
                onClick={handleSearch}
              >
                Search
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-stone-400"
              onClick={() => {
                setSearchOpen(false);
                setHighlightQuery("");
                setSearchResults([]);
                setSearchQuery("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Search results dropdown */}
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-stone-200 shadow-lg z-50 max-h-64 overflow-y-auto">
            {searchResults.map((result, i) => (
              <button
                key={i}
                className="w-full text-left px-4 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-0"
                onClick={() => {
                  setCurrentResultIndex(i);
                  const highlights = document.querySelectorAll(".search-highlight");
                  // Find the i-th group of highlights
                  if (highlights[i]) {
                    highlights[i].scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  setSearchOpen(false);
                }}
              >
                <p className="text-xs text-stone-500 mb-0.5 truncate">{result.context}</p>
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:sticky top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] overflow-y-auto bg-white border-r border-stone-200 transition-transform duration-200 shrink-0`}
        >
          <nav className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3 px-2">
              Contents
            </p>
            <div className="space-y-0.5">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => scrollToChapter(ch.id)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition-colors leading-snug"
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 py-10 lg:px-12">
          {loading && (
            <div className="flex items-center justify-center py-32">
              <p className="text-stone-400">Loading book…</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <p className="text-stone-500">Could not load the book content.</p>
              <Button onClick={() => window.location.reload()} className="bg-green-700 hover:bg-green-800 text-white gap-2">
                Try Again
              </Button>
            </div>
          )}
          {!loading && !error && (
            <div ref={contentRef} className="max-w-3xl mx-auto book-content">
              {/* Book cover at the top of the reader */}
              <div className="flex flex-col items-center mb-12 pb-10 border-b border-stone-200">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/book-cover-sarva-keller_87f4edbe.png"
                  alt="Add Life to Your Years book cover"
                  className="w-48 md:w-64 rounded-xl shadow-2xl mb-6"
                />
                <h2 className="font-serif text-2xl font-bold text-stone-800 text-center mb-1">Add Life to Your Years</h2>
                <p className="text-stone-500 text-sm text-center">Proven Strategies for Health, Wellness and Vitality</p>
                <div className="mt-4 flex gap-3">
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">226 Pages</span>
                  <span className="text-xs bg-stone-100 text-stone-600 px-3 py-1 rounded-full font-medium">Free to Read</span>
                </div>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                urlTransform={(url) => url}
                components={{
                  h1: ({ children }) => {
                    const id = getHeadingId(children);
                    return (
                      <h1
                        id={id}
                        className="font-serif text-3xl font-bold text-stone-900 mt-12 mb-6 pb-3 border-b border-stone-200 scroll-mt-20"
                      >
                        {highlightQuery ? highlightText(
                          typeof children === "string" ? children :
                          Array.isArray(children) ? children.join("") : String(children),
                          highlightQuery
                        ) : children}
                      </h1>
                    );
                  },
                  h2: ({ children }) => {
                    const id = getHeadingId(children);
                    return (
                      <h2
                        id={id}
                        className="font-serif text-2xl font-bold text-stone-800 mt-10 mb-4 scroll-mt-20"
                      >
                        {highlightQuery ? highlightText(
                          typeof children === "string" ? children :
                          Array.isArray(children) ? children.join("") : String(children),
                          highlightQuery
                        ) : children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => (
                    <h3 className="font-serif text-xl font-semibold text-stone-800 mt-8 mb-3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-lg font-bold text-green-800 mt-8 mb-3 border-l-4 border-green-500 pl-3">{children}</h4>
                  ),
                  p: ({ children }) => {
                    if (highlightQuery && typeof children === "string") {
                      return <p className="text-stone-700 leading-relaxed mb-4 text-base">{highlightText(children, highlightQuery)}</p>;
                    }
                    return <p className="text-stone-700 leading-relaxed mb-4 text-base">{children}</p>;
                  },
                  a: ({ href, children }) => {
                    // Intercept product: links and render a styled View Product button
                    if (href && href.startsWith("product:")) {
                      const productId = parseInt(href.replace("product:", ""), 10);
                      const product = PRODUCT_MAP[productId];
                      if (!product) return null;
                      const url = getProductUrl(productId, affiliateSlug);
                      return (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 no-underline my-2"
                        >
                          🛒 {typeof children === "string" ? children : product.name}
                        </a>
                      );
                    }
                    // Regular links with smooth scroll for hash links
                    return (
                      <a
                        href={href}
                        className="text-green-700 underline underline-offset-2 font-medium hover:text-green-900 transition-colors"
                        onClick={(e) => {
                          if (href && href.startsWith('#')) {
                            e.preventDefault();
                            const blueprintEl = document.getElementById('wellness-blueprint');
                            if (blueprintEl) {
                              const bpTop = blueprintEl.getBoundingClientRect().top + window.scrollY;
                              if (window.scrollY >= bpTop - 200) {
                                setBlueprintScrollPos(window.scrollY);
                              }
                            }
                            const el = document.getElementById(href.slice(1));
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {children}
                      </a>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-semibold text-stone-900">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-stone-700">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-green-400 pl-4 my-4 text-stone-600 italic bg-green-50/50 py-2 pr-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 rounded-lg border border-stone-200 shadow-sm">
                      <table className="w-full text-sm text-left">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-green-700 text-white">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-3 font-semibold text-sm">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-stone-700 align-top" style={{borderTop: '1px solid #e7e5e4', verticalAlign: 'top'}}>{children}</td>
                  ),
                  tr: ({ children }) => (
                    <tr style={{borderBottom: '2px solid #a8a29e'}}>{children}</tr>
                  ),
                  ul: ({ children }) => (
                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 my-4">
                      <ul className="list-disc list-outside ml-5 space-y-1.5 text-stone-700">
                        {children}
                      </ul>
                    </div>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-stone-700">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  hr: () => <hr className="my-10 border-stone-200" />,
                  code: ({ children }) => (
                    <code className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  img: ({ src, alt }) => {
                    // Hide the home page QR code in the online reader (it's for PDF use only)
                    if (src && src.includes("qr-home")) return null;
                    // QR codes should be small
                    const isQR = src && (src.includes("qr-rec") || src.includes("qr-community") || src.includes("qr-self-eval") || src.includes("qr_code"));
                    // Infographics should be larger and clickable to zoom
                    const isInfographic = src && (src.includes("infographic") || src.includes("human_microbial"));
                    let imgClass = "max-w-full mx-auto rounded-lg shadow-md";
                    if (isQR) {
                      imgClass = "max-w-[160px] mx-auto rounded-lg shadow-md";
                    } else if (isInfographic) {
                      imgClass = "max-w-[700px] w-full mx-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity";
                    }
                    return (
                      <figure className="my-8 text-center">
                        <img
                          src={src}
                          alt={alt || ""}
                          className={imgClass}
                          loading="lazy"
                          onClick={isInfographic ? () => setZoomedImage(src || null) : undefined}
                        />
                        {alt && (
                          <figcaption className="mt-2 text-sm text-stone-500 italic">
                            {alt}{isInfographic && <span className="ml-1 text-green-700">(tap to zoom)</span>}
                          </figcaption>
                        )}
                      </figure>
                    );
                  },
                }}
              >
                {bookContent && bookContent.indexOf("\n# Glossary") !== -1
                  ? bookContent.substring(0, bookContent.indexOf("\n# Glossary"))
                  : bookContent}
              </ReactMarkdown>
              {/* Interactive Synergy Infographic - inserted before Glossary */}
              {bookContent && bookContent.indexOf("\n# Glossary") !== -1 && (
                <div id="synergy-infographic">
                  <SynergyInfographic />
                </div>
              )}
              {/* Render Glossary and everything after it */}
              {bookContent && bookContent.indexOf("\n# Glossary") !== -1 && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) => url}
                  components={{
                    h1: ({ children }) => {
                      const id = getHeadingId(children);
                      return (
                        <h1 id={id} className="font-serif text-3xl font-bold text-stone-900 mt-12 mb-6 pb-3 border-b border-stone-200 scroll-mt-20">
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ children }) => {
                      const id = getHeadingId(children);
                      return (
                        <h2 id={id} className="font-serif text-2xl font-bold text-stone-800 mt-10 mb-4 scroll-mt-20">
                          {children}
                        </h2>
                      );
                    },
                    p: ({ children }) => <p className="text-stone-700 leading-relaxed mb-4 text-base">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-green-700 underline underline-offset-2 font-medium hover:text-green-900 transition-colors"
                        onClick={(e) => {
                          if (href && href.startsWith('#')) {
                            e.preventDefault();
                            const blueprintEl = document.getElementById('wellness-blueprint');
                            if (blueprintEl) {
                              const bpTop = blueprintEl.getBoundingClientRect().top + window.scrollY;
                              if (window.scrollY >= bpTop - 200) {
                                setBlueprintScrollPos(window.scrollY);
                              }
                            }
                            const el = document.getElementById(href.slice(1));
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {children}
                      </a>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6 rounded-lg border border-stone-200 shadow-sm">
                        <table className="w-full text-sm text-left">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-green-700 text-white">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 font-semibold text-sm">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-stone-700 align-top" style={{borderTop: '1px solid #e7e5e4', verticalAlign: 'top'}}>{children}</td>
                    ),
                    tr: ({ children }) => (
                      <tr style={{borderBottom: '2px solid #a8a29e'}}>{children}</tr>
                    ),
                  }}
                >
                  {bookContent.substring(bookContent.indexOf("\n# Glossary"))}
                </ReactMarkdown>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Return to Blueprint floating button */}
      {blueprintScrollPos !== null && (
        <button
          onClick={() => {
            window.scrollTo({ top: blueprintScrollPos, behavior: 'smooth' });
            setBlueprintScrollPos(null);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-all"
          title="Return to Your Wellness Blueprint at a Glance"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return to Blueprint
        </button>
      )}
      {/* Zoom modal for infographics */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-stone-300 text-sm font-medium"
              onClick={() => setZoomedImage(null)}
            >
              ✕ Close
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed infographic"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      {/* Video modal — opens when clicking QR codes or media links in the book */}
      {videoModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => { setVideoModal(null); setVideoIndex(0); }}
        >
          <div
            className="relative w-full max-w-3xl bg-stone-900 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => { setVideoModal(null); setVideoIndex(0); }}
            >
              <X className="w-5 h-5" />
            </button>
            {videoModal.length > 1 && (
              <div className="flex gap-2 px-4 pt-4 pb-2">
                {videoModal.map((video, idx) => (
                  <button
                    key={video.youtubeId}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      idx === videoIndex
                        ? "bg-green-600 text-white"
                        : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                    }`}
                    onClick={() => setVideoIndex(idx)}
                  >
                    {video.title}
                  </button>
                ))}
              </div>
            )}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                key={videoModal[videoIndex].youtubeId || videoModal[videoIndex].rumbleUrl}
                className="absolute inset-0 w-full h-full"
                src={
                  videoModal[videoIndex].youtubeId
                    ? `https://www.youtube.com/embed/${videoModal[videoIndex].youtubeId}?rel=0`
                    : videoModal[videoIndex].rumbleUrl || ""
                }
                title={videoModal[videoIndex].title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

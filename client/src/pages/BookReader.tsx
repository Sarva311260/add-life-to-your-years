import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Menu, X, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PDF_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_e8d0da6f.pdf";
const MD_CDN_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_5bf0e728.md";

const chapters = [
  { id: "introduction", label: "Introduction" },
  { id: "part-one", label: "Part One: How Our Body Works" },
  { id: "chapter-1", label: "Ch 1: A Universe of Cells" },
  { id: "chapter-2", label: "Ch 2: The Microbiome" },
  { id: "chapter-3", label: "Ch 3: Cell Communication" },
  { id: "part-two", label: "Part Two: The 8 Factors" },
  { id: "part-three", label: "Part Three: Wellness Strategies" },
  { id: "chapter-4", label: "Ch 4: Air" },
  { id: "chapter-5", label: "Ch 5: Water" },
  { id: "chapter-6", label: "Ch 6: Sleep" },
  { id: "chapter-7", label: "Ch 7: Food" },
  { id: "chapter-8", label: "Ch 8: Shelter" },
  { id: "chapter-9", label: "Ch 9: Security & Stability" },
  { id: "chapter-11", label: "Ch 11: Financial Safety" },
  { id: "chapter-12", label: "Ch 12: Meaningful Connection" },
  { id: "chapter-13", label: "Ch 13: Self-Respect" },
  { id: "chapter-14", label: "Ch 14: Purpose & Meaning" },
  { id: "conclusion", label: "Conclusion" },
  { id: "part-four", label: "Part Four: John's Path Forward" },
  { id: "rec-1", label: "Rec 1: Whole Food Plant-Based" },
  { id: "rec-2", label: "Rec 2: Water" },
  { id: "rec-3", label: "Rec 3: Sleep & Melatonin" },
  { id: "rec-4", label: "Rec 4: Glycine" },
  { id: "rec-5", label: "Rec 5: Five Seeds of Life" },
  { id: "rec-6", label: "Rec 6: Vitamin B12 & D" },
  { id: "rec-7", label: "Rec 7: Six Movements" },
  { id: "rec-8", label: "Rec 8: Breathing" },
  { id: "rec-9", label: "Rec 9: PEMF & Earthing" },
  { id: "rec-10", label: "Rec 10: Meditation" },
  { id: "rec-11", label: "Rec 11: Time in Nature" },
  { id: "rec-12", label: "Rec 12: Repairing the Relationship" },
  { id: "rec-13", label: "Rec 13: Second Income Stream" },
  { id: "rec-14", label: "Rec 14: Your Environment" },
  { id: "rec-15", label: "Rec 15: Methylene Blue" },
  { id: "john-6-months", label: "John, Six Months Later" },
  { id: "john-12-months", label: "John, Twelve Months Later" },
  { id: "a-note", label: "A Note on the Journey" },
];

// Map heading text to anchor IDs
const headingIdMap: Record<string, string> = {
  "Introduction": "introduction",
  "Part One: How Our Body Works": "part-one",
  "Chapter 1": "chapter-1",
  "Chapter 2": "chapter-2",
  "Chapter 3": "chapter-3",
  "Part Two": "part-two",
  "Part Three": "part-three",
  "Chapter 4": "chapter-4",
  "Chapter 5": "chapter-5",
  "Chapter 6": "chapter-6",
  "Chapter 7": "chapter-7",
  "Chapter 8": "chapter-8",
  "Chapter 9": "chapter-9",
  "Chapter 11": "chapter-11",
  "Chapter 12": "chapter-12",
  "Chapter 13": "chapter-13",
  "Chapter 14": "chapter-14",
  "Conclusion": "conclusion",
  "Part Four": "part-four",
  "Recommendation 1": "rec-1",
  "Recommendation 2": "rec-2",
  "Recommendation 3": "rec-3",
  "Recommendation 4": "rec-4",
  "Recommendation 5": "rec-5",
  "Recommendation 6": "rec-6",
  "Recommendation 7": "rec-7",
  "Recommendation 8": "rec-8",
  "Recommendation 9": "rec-9",
  "Recommendation 10": "rec-10",
  "Recommendation 11": "rec-11",
  "Recommendation 12": "rec-12",
  "Recommendation 13": "rec-13",
  "Recommendation 14": "rec-14",
  "Recommendation 15": "rec-15",
  "John, Six Months Later": "john-6-months",
  "John, Twelve Months Later": "john-12-months",
  "A Note on the Journey": "a-note",
};

function getHeadingId(children: React.ReactNode): string {
  // Flatten all child text recursively
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
  for (const [key, id] of Object.entries(headingIdMap)) {
    if (text.includes(key)) return id;
  }
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BookReader() {
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

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
          <a href={PDF_URL} download="Add-Life-to-Your-Years.pdf">
            <Button size="sm" className="gap-2 bg-green-700 hover:bg-green-800 text-white">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </a>
        </div>
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
              <a href={PDF_URL} download>
                <Button className="bg-green-700 hover:bg-green-800 text-white gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF instead
                </Button>
              </a>
            </div>
          )}
          {!loading && !error && (
            <div className="max-w-3xl mx-auto book-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => {
                    const id = getHeadingId(children);
                    return (
                      <h1
                        id={id}
                        className="font-serif text-3xl font-bold text-stone-900 mt-12 mb-6 pb-3 border-b border-stone-200 scroll-mt-20"
                      >
                        {children}
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
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => (
                    <h3 className="font-serif text-xl font-semibold text-stone-800 mt-8 mb-3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="font-semibold text-stone-700 mt-6 mb-2">{children}</h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-stone-700 leading-relaxed mb-4 text-base">{children}</p>
                  ),
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
                    <td className="px-4 py-3 border-t border-stone-100 text-stone-700">{children}</td>
                  ),
                  tr: ({ children }) => (
                    <tr className="even:bg-stone-50">{children}</tr>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-stone-700">
                      {children}
                    </ul>
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
                }}
              >
                {bookContent}
              </ReactMarkdown>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

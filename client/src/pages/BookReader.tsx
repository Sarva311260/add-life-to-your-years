import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Menu, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const PDF_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/Version3-AddLifeToYourYears_bcb0898c.pdf";

const chapters = [
  { id: "intro", title: "Introduction", line: 4 },
  { id: "part1", title: "Part One: How Our Body Works", line: 124 },
  { id: "ch1", title: "Chapter 1: The Human Body — A Universe of Cells", line: 134 },
  { id: "ch2", title: "Chapter 2: The Microbiome — Our Microbial Partners", line: 204 },
  { id: "ch3", title: "Chapter 3: Cell Communication", line: 265 },
  { id: "part2", title: "Part Two: The 8 Factors of Health and Disease", line: 359 },
  { id: "part3", title: "Part Three: Wellness Strategies", line: 1153 },
  { id: "ch4", title: "Chapter 4: Air — The First Breath", line: 1179 },
  { id: "ch5", title: "Chapter 5: Water — The Medium of Life", line: 1274 },
  { id: "ch6", title: "Chapter 6: Sleep — The Master Repair Phase", line: 1365 },
  { id: "ch7", title: "Chapter 7: Food — Building the Body from the Inside Out", line: 1507 },
  { id: "ch8", title: "Chapter 8: Shelter — The Environment We Come Home To", line: 1631 },
  { id: "ch9", title: "Chapter 9: Security and Stability", line: 1702 },
  { id: "ch11", title: "Chapter 11: Financial Safety", line: 1819 },
  { id: "ch12", title: "Chapter 12: Meaningful Connection", line: 1878 },
  { id: "ch13", title: "Chapter 13: Self-Respect and Autonomy", line: 1948 },
  { id: "ch14", title: "Chapter 14: Purpose, Meaning, and the Fullest Expression", line: 1996 },
  { id: "conclusion", title: "Conclusion: Adding Life to Your Years", line: 2055 },
  { id: "part4", title: "Part Four: John's Path Forward", line: 2092 },
  { id: "rec1", title: "Recommendation 1: Whole Food Plant-Based Lifestyle", line: 2128 },
  { id: "rec2", title: "Recommendation 2: Distilled or RO Water", line: 2195 },
  { id: "rec3", title: "Recommendation 3: Sleep and Melatonin", line: 2235 },
  { id: "rec4", title: "Recommendation 4: Glycine", line: 2292 },
  { id: "rec5", title: "Recommendation 5: The Five Seeds of Life", line: 2336 },
  { id: "rec6", title: "Recommendation 6: Vitamin B12 and D", line: 2495 },
  { id: "rec7", title: "Recommendation 7: The Six Movements", line: 2537 },
  { id: "rec8", title: "Recommendation 8: Breathing", line: 2609 },
  { id: "rec9", title: "Recommendation 9: PEMF Therapy and Earthing", line: 2650 },
  { id: "rec10", title: "Recommendation 10: Meditation and Relaxation", line: 2707 },
  { id: "rec11", title: "Recommendation 11: Time in Nature", line: 2753 },
  { id: "rec12", title: "Recommendation 12: Repairing the Relationship", line: 2792 },
  { id: "rec13", title: "Recommendation 13: Second Stream of Income", line: 2832 },
  { id: "rec14", title: "Recommendation 14: Consider Your Environment", line: 2870 },
  { id: "john6", title: "John, Six Months Later", line: 2908 },
  { id: "john12", title: "John, Twelve Months Later", line: 2944 },
  { id: "note", title: "A Note on the Journey", line: 2968 },
];

export default function BookReader() {
  const [bookContent, setBookContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch the markdown content
    fetch("/book-content.md")
      .then((res) => res.text())
      .then((text) => {
        setBookContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load book:", err);
        setLoading(false);
      });
  }, []);

  const scrollToChapter = (chapterId: string) => {
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading book...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-semibold">Add Life to Your Years</h1>
          </div>
          <Button asChild>
            <a href={PDF_URL} download="Add-Life-to-Your-Years.pdf">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
        </div>
      </header>

      <div className="container flex gap-8 py-8">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block fixed lg:sticky top-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] overflow-y-auto bg-background border-r lg:border-r-0 p-4 lg:p-0`}
        >
          <nav className="space-y-1">
            <h2 className="font-semibold text-sm text-muted-foreground mb-3 px-3">
              Table of Contents
            </h2>
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => scrollToChapter(chapter.id)}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {chapter.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-3xl mx-auto">
          <Card className="p-8 lg:p-12 prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children, ...props }) => {
                  const text = children?.toString() || "";
                  const id = chapters.find((ch) => text.includes(ch.title.split(":")[0]))?.id || "";
                  return <h1 id={id} {...props}>{children}</h1>;
                },
                h2: ({ children, ...props }) => {
                  const text = children?.toString() || "";
                  const id = chapters.find((ch) => ch.title === text)?.id || "";
                  return <h2 id={id} {...props}>{children}</h2>;
                },
              }}
            >
              {bookContent}
            </ReactMarkdown>
          </Card>
        </main>
      </div>
    </div>
  );
}

import { useParams, Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import SEO from "@/components/SEO";
import { Streamdown } from "streamdown";
import { Calendar, ArrowLeft, BookOpen, Clock, User, Play } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";

const AUTHOR_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663488485220/2Y96gvwURj9QkkDN4hXary/sarva_0909cc87.jpg";

// Map from media page anchor → array of YouTube IDs + titles
const MEDIA_VIDEO_MAP: Record<string, { youtubeId: string; title: string }[]> = {
  "rec-appendix-diet": [
    { youtubeId: "Weg9GUnH24E", title: "What Humans Are Designed to Eat" },
    { youtubeId: "nEjuZsP8o7g", title: "The Ketogenic Diet — Is It Healthy?" },
    { youtubeId: "MJVSD0hggZE", title: "The Ketogenic Diet is a Scam" },
    { youtubeId: "uVGpTLMN6w4", title: "Mediterranean Diet vs WFPB" },
    { youtubeId: "dpyz-AumCUk", title: "Is a Plant-Based Diet Always Healthy?" },
  ],
  "appendix-cold-showers": [
    { youtubeId: "xTVMGyJ8cZU", title: "Cold Showers — Hormesis, Inflammation & Cognitive Benefits" },
    { youtubeId: "may_PlDfNRE", title: "The Science Behind Cold Showers — 5 Evidence-Based Benefits" },
  ],
  "appendix-off-label": [
    { youtubeId: "QBnT8es28WY", title: "Fenbendazole — The Joe Tippens Protocol & Cancer Research" },
    { youtubeId: "5Q5QjEPGNNg", title: "Fenbendazole & Ivermectin — Stanford Case Series & Mechanisms" },
    { youtubeId: "Ck4_fX1xaaw", title: "Largest Real-World Study: Ivermectin + Mebendazole in 197 Cancer Patients" },
  ],
  "appendix-brazil-nuts": [
    { youtubeId: "YckoR3hLL9E", title: "Five Seeds of Life — Brazil Nuts & Selenium" },
  ],
  "appendix-floor-lying": [
    { youtubeId: "YcmpJZrdqiI", title: "Floor Lying — The 5-Minute Protocol for Spinal Decompression" },
  ],
  "appendix-gut-brain": [
    { youtubeId: "Hywi0rDLtJA", title: "The Fiber That Calms You — Feeding Your Gut to Heal Your Mind" },
  ],
  "appendix-blackstrap-molasses": [
    { youtubeId: "IqRo8gGbFuo", title: "Blackstrap Molasses — Dr. Eric Berg" },
    { youtubeId: "dtSeM5mb41o", title: "Blackstrap Molasses for Sleep and Blood Sugar" },
  ],
  "appendix-coherence-breathing": [
    { youtubeId: "vCf2GWI4dfw", title: "Coherence Breathing — The 10-Second Cycle That Rewires Your Nervous System" },
  ],
  "appendix-lavender-oil": [
    { youtubeId: "q3kXbYMgBnE", title: "Lavender Oil — Nature's Answer to Anxiety" },
  ],
};

// Strip the first H1 from content (already shown as page title)
function stripFirstH1(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^#\s+.+\n?/, "");
}


// Standalone video section rendered from DB videoIds field
function VideoSection({ videos }: { videos: { youtubeId: string; title: string }[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = videos[activeIndex];

  return (
    <div className="my-10 rounded-2xl overflow-hidden border border-[#1f3520] bg-[#0f2410]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f3520]">
        <Play className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
        <span className="text-white font-semibold text-sm">
          {videos.length > 1 ? `Watch (${videos.length} videos)` : "Watch"}
        </span>
      </div>

      {/* Video title */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-gray-300 text-sm font-medium">{current.title}</p>
      </div>

      {/* 16:9 iframe */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          key={current.youtubeId}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${current.youtubeId}?rel=0`}
          title={current.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      {/* Playlist tabs */}
      {videos.length > 1 && (
        <div className="px-4 py-3 border-t border-[#1f3520] flex flex-wrap gap-2">
          {videos.map((v, i) => (
            <button
              key={v.youtubeId}
              onClick={() => setActiveIndex(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === activeIndex
                  ? "bg-[#4ade80] text-[#0a1a0c]"
                  : "bg-[#1a2e1c] text-gray-300 hover:bg-[#1f3520] hover:text-white"
              }`}
            >
              <Play className="w-3 h-3" />
              {i + 1}. {v.title.length > 45 ? v.title.slice(0, 45) + "\u2026" : v.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function tagColor(tag: string): string {
  const map: Record<string, string> = {
    "Nutrition": "bg-green-900/60 text-green-300 border border-green-700/40",
    "Diet": "bg-green-900/60 text-green-300 border border-green-700/40",
    "Mental Wellness": "bg-purple-900/60 text-purple-300 border border-purple-700/40",
    "Anxiety": "bg-purple-900/60 text-purple-300 border border-purple-700/40",
    "Sleep": "bg-indigo-900/60 text-indigo-300 border border-indigo-700/40",
    "Cold Therapy": "bg-sky-900/60 text-sky-300 border border-sky-700/40",
    "Pharmaceuticals": "bg-orange-900/60 text-orange-300 border border-orange-700/40",
    "Minerals": "bg-amber-900/60 text-amber-300 border border-amber-700/40",
    "Movement": "bg-teal-900/60 text-teal-300 border border-teal-700/40",
    "Gut Health": "bg-lime-900/60 text-lime-300 border border-lime-700/40",
    "Breathing": "bg-cyan-900/60 text-cyan-300 border border-cyan-700/40",
    "Natural Remedies": "bg-emerald-900/60 text-emerald-300 border border-emerald-700/40",
  };
  return map[tag] || "bg-gray-800/60 text-gray-300 border border-gray-700/40";
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const proseClasses = `prose prose-invert prose-green max-w-none
  prose-headings:text-white prose-headings:font-bold
  prose-h1:text-3xl prose-h1:mt-12 prose-h1:mb-5
  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#1f3520] prose-h2:pb-2
  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#4ade80]
  prose-p:text-gray-300 prose-p:leading-[1.85] prose-p:mb-5 prose-p:text-[1.05rem]
  prose-strong:text-white prose-strong:font-semibold
  prose-a:text-[#4ade80] prose-a:no-underline hover:prose-a:underline
  prose-blockquote:border-l-4 prose-blockquote:border-[#4ade80] prose-blockquote:bg-[#0f2410] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic
  prose-blockquote:text-gray-200 prose-blockquote:text-[1.05rem]
  prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-1
  prose-ul:my-5 prose-ol:my-5
  prose-table:text-sm prose-th:text-white prose-th:bg-[#1a2e1c] prose-td:text-gray-300 prose-td:border-[#1f3520] prose-th:border-[#1f3520]
  prose-hr:border-[#1f3520] prose-hr:my-10
  prose-code:text-[#4ade80] prose-code:bg-[#0f2410] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
  prose-img:hidden`;

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery({ slug: slug ?? "" }, {
    enabled: !!slug,
  });
  const { data: allPosts } = trpc.blog.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1a0c] text-white">
        <SiteNav />
        <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-[#1a2e1c] rounded w-24 mb-8" />
            <div className="h-96 bg-[#1a2e1c] rounded-2xl mb-8" />
            <div className="h-10 bg-[#1a2e1c] rounded w-3/4" />
            <div className="h-4 bg-[#1a2e1c] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a1a0c] text-white">
        <SiteNav />
        <div className="max-w-3xl mx-auto px-4 pt-28 pb-24 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold mb-2">Guide not found</h1>
          <p className="text-gray-400 mb-6">This guide may have been moved or doesn't exist.</p>
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 text-[#4ade80] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to all guides
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const date = new Date(post.publishedAt).toLocaleDateString("en-AU", {
    year: "numeric", month: "long", day: "numeric",
  });
  const mins = readingTime(post.content);

  // Related posts: same tags, exclude current
  const related = (allPosts ?? [])
    .filter((p) => p.slug !== post.slug && p.tags && tags.some((t) => p.tags?.includes(t)))
    .slice(0, 3);

  // Parse video IDs from the database field, with fallback to MEDIA_VIDEO_MAP
  type VideoEntry = { youtubeId: string; title: string };
  let postVideos: VideoEntry[] = [];
  try {
    const raw = (post as Record<string, unknown>).videoIds as string | null | undefined;
    if (raw && typeof raw === 'string' && raw.trim().startsWith("[")) {
      const parsed = JSON.parse(raw.trim()) as VideoEntry[];
      if (Array.isArray(parsed) && parsed.length > 0) postVideos = parsed;
    }
  } catch {
    postVideos = [];
  }
  // Fallback: use MEDIA_VIDEO_MAP keyed by bookAnchorId
  if (postVideos.length === 0 && post.bookAnchorId) {
    postVideos = MEDIA_VIDEO_MAP[post.bookAnchorId] ?? [];
  }

  // Strip the leading H1 (already shown as the page title above)
  const transformed = stripFirstH1(post.content);

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        ogImage={post.coverImageUrl ?? undefined}
        canonicalPath={`/blog/${post.slug}`}
        keywords={post.tags ?? undefined}
        publishedAt={new Date(post.publishedAt).toISOString()}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImageUrl,
          datePublished: new Date(post.publishedAt).toISOString(),
          author: { "@type": "Person", name: "Sarva Keller" },
          publisher: {
            "@type": "Organization",
            name: "Add Life to Your Years",
            url: "https://www.addlifetoyouryears.org"
          },
          url: `https://www.addlifetoyouryears.org/blog/${post.slug}`
        }}
      />

      <div className="min-h-screen bg-[#0a1a0c] text-white">
        <SiteNav />

        {/* Hero image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-[55vh] min-h-[340px] max-h-[520px] overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0c] via-[#0a1a0c]/40 to-transparent" />
            <div className="absolute top-6 left-6">
              <Link href="/blog">
                <button className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors border border-white/20">
                  <ArrowLeft className="w-3.5 h-3.5" /> All Guides
                </button>
              </Link>
            </div>
          </div>
        )}

        <article
          className="max-w-3xl mx-auto px-4 pb-24"
          style={{ marginTop: post.coverImageUrl ? "-2rem" : "6rem", paddingTop: post.coverImageUrl ? "2.5rem" : "0" }}
        >
          {!post.coverImageUrl && (
            <Link href="/blog">
              <button className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#4ade80] text-sm mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> The Wellness Files
              </button>
            </Link>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((tag) => (
                <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${tagColor(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-white">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-gray-300 leading-relaxed mb-6 border-l-2 border-[#4ade80]/50 pl-4">
            {post.excerpt}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-10 pb-6 border-b border-[#1f3520]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#4ade80]/70" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#4ade80]/70" />
              {mins} min read
            </span>
            {post.bookAnchorId && (
              <Link href={`/book/read#${post.bookAnchorId}`}>
                <span className="flex items-center gap-1.5 text-[#4ade80] hover:underline cursor-pointer">
                  <BookOpen className="w-4 h-4" />
                  Read in the book
                </span>
              </Link>
            )}
          </div>

          {/* Main content */}
          <div className={proseClasses}>
            <Streamdown>{transformed}</Streamdown>
          </div>

          {/* Video section — rendered from DB videoIds field */}
          {postVideos.length > 0 && (
            <VideoSection videos={postVideos} />
          )}

          {/* Author bio card */}
          <div className="mt-14 p-6 bg-[#0f2410] rounded-2xl border border-[#1f3520] flex gap-5 items-start">
            <img
              src={AUTHOR_PHOTO}
              alt="Sarva Keller"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-[#4ade80]/30"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-[#4ade80]" />
                <span className="font-semibold text-white">Sarva Keller</span>
                <span className="text-xs text-gray-500">· Wellness Coach & Author</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Author of <em>Add Life to Your Years</em> and founder of a whole-food, plant-based wellness ecosystem. Sarva has developed an 18-step evidence-based framework empowering clients to take measurable, lasting control of their health.
              </p>
              <Link href="/book">
                <span className="text-[#4ade80] text-xs hover:underline mt-2 inline-block">View the book →</span>
              </Link>
            </div>
          </div>

          {/* Newsletter signup */}
          <NewsletterSignup sourceSlug={post.slug} />

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="text-xl font-bold mb-6 text-white">You might also enjoy</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => {
                  const rTags = r.tags ? r.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
                  return (
                    <Link key={r.slug} href={`/blog/${r.slug}`}>
                      <div className="group bg-[#0f2410] rounded-xl border border-[#1f3520] overflow-hidden hover:border-[#4ade80]/40 transition-colors cursor-pointer">
                        {r.coverImageUrl && (
                          <div className="h-32 overflow-hidden">
                            <img
                              src={r.coverImageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          {rTags[0] && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${tagColor(rTags[0])}`}>
                              {rTags[0]}
                            </span>
                          )}
                          <p className="text-sm font-semibold text-white leading-snug group-hover:text-[#4ade80] transition-colors">
                            {r.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 p-8 bg-gradient-to-br from-[#0f2410] to-[#0a1a0c] rounded-2xl border border-[#1f3520] text-center">
            <h3 className="text-xl font-bold text-white mb-2">Ready to transform your health?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This guide is part of <em>Add Life to Your Years</em> — a comprehensive,
              evidence-based guide covering 8 health factors and 18 actionable recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/book">
                <button className="inline-flex items-center gap-2 bg-[#4ade80] text-[#0a1a0c] font-semibold px-6 py-3 rounded-xl hover:bg-[#22c55e] transition-colors">
                  <BookOpen className="w-4 h-4" />
                  Read the Full Book
                </button>
              </Link>
              <Link href="/self-evaluation">
                <button className="inline-flex items-center gap-2 border border-[#4ade80]/50 text-[#4ade80] font-semibold px-6 py-3 rounded-xl hover:bg-[#4ade80]/10 transition-colors">
                  Take the Self-Assessment
                </button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

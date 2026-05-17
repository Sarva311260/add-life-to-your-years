import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import SiteNav from "@/components/SiteNav";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, ArrowRight } from "lucide-react";

function tagColor(tag: string): string {
  const map: Record<string, string> = {
    "Nutrition": "bg-green-100 text-green-800",
    "Diet": "bg-green-100 text-green-800",
    "Mental Wellness": "bg-purple-100 text-purple-800",
    "Anxiety": "bg-purple-100 text-purple-800",
    "Sleep": "bg-indigo-100 text-indigo-800",
    "Cold Therapy": "bg-sky-100 text-sky-800",
    "Pharmaceuticals": "bg-orange-100 text-orange-800",
    "Minerals": "bg-amber-100 text-amber-800",
    "Movement": "bg-teal-100 text-teal-800",
    "Gut Health": "bg-lime-100 text-lime-800",
    "Breathing": "bg-cyan-100 text-cyan-800",
  };
  return map[tag] || "bg-gray-100 text-gray-700";
}

export default function BlogIndex() {
  const { data: posts, isLoading } = trpc.blog.list.useQuery();

  return (
    <>
    <SEO
      title="The Wellness Files — Evidence-Based Wellness Articles"
      description="Deep-dive research articles on specific wellness strategies — nutrition, sleep, mental health, movement and more. Grounded in peer-reviewed evidence."
      canonicalPath="/blog"
      keywords="wellness guides, evidence-based health, nutrition research, sleep science, mental wellness, natural remedies"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "The Wellness Files",
        url: "https://www.addlifetoyouryears.org/blog",
        description: "Evidence-based wellness articles from Add Life to Your Years."
      }}
    />
    <div className="min-h-screen bg-[#0d1f0f] text-white">
      <SiteNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 text-center">
        <p className="text-[#4ade80] text-sm font-semibold tracking-widest uppercase mb-3">
          Evidence-Based Insights
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          The Wellness Files
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Deep-dive research articles on specific wellness strategies — each one grounded in peer-reviewed evidence and drawn directly from the book.
        </p>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#1a2e1c] rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No guides published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
              const date = new Date(post.publishedAt).toLocaleDateString("en-AU", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              return (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <div className="group bg-[#1a2e1c] hover:bg-[#1f3520] border border-[#2a4a2c] hover:border-[#4ade80]/40 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer h-full flex flex-col">
                    {post.coverImageUrl ? (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-[#1f3520] to-[#0d1f0f] flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-[#4ade80]/40" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2 className="text-white font-semibold text-base leading-snug mb-2 group-hover:text-[#4ade80] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2a4a2c]">
                        <span className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {date}
                        </span>
                        <span className="flex items-center gap-1 text-[#4ade80] text-xs font-medium group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
    </>
  );
}

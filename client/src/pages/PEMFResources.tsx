import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Leaf, ArrowLeft, FileText, Mail, Video, BookOpen,
  ExternalLink, Copy, ChevronDown, ChevronUp, Download
} from "lucide-react";

const AFFILIATE_TOKEN_KEY = "affiliate_token";
function getAffiliateToken() { return localStorage.getItem(AFFILIATE_TOKEN_KEY) || ""; }

const TYPE_CONFIG = {
  document: { label: "Document", icon: FileText, color: "text-blue-400", bg: "bg-blue-900/20", border: "border-blue-800/30" },
  script: { label: "Script", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-800/30" },
  email_template: { label: "Email Template", icon: Mail, color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-800/30" },
  video: { label: "Video", icon: Video, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-800/30" },
  landing_page: { label: "Landing Page", icon: ExternalLink, color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-800/30" },
} as const;

type ResourceType = keyof typeof TYPE_CONFIG;

interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  content: string | null;
  videoUrl: string | null;
  pageUrl: string | null;
  category: string | null;
  subcategory: string | null;
  isPublished: number;
  sortOrder: number;
  createdAt: Date;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
  } catch {}
  return null;
}

function ResourceCard({ resource, affiliateSlug }: { resource: Resource; affiliateSlug?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const typeKey = (resource.type in TYPE_CONFIG ? resource.type : 'document') as ResourceType;
  const { label, icon: Icon, color, bg, border } = TYPE_CONFIG[typeKey];

  // For landing pages, personalise the URL if it matches our domain and ends with /pemf
  const getPersonalisedUrl = () => {
    if (!resource.pageUrl) return null;
    if (!affiliateSlug) return resource.pageUrl;
    try {
      const url = new URL(resource.pageUrl);
      // If the path ends with /pemf (with or without trailing slash), append the slug
      const path = url.pathname.replace(/\/$/, '');
      if (path === '/pemf' || path.match(/\/pemf$/)) {
        return `${url.origin}${path}/${affiliateSlug}`;
      }
    } catch {}
    return resource.pageUrl;
  };
  const personalisedUrl = getPersonalisedUrl();

  const handleCopy = () => {
    if (resource.content) {
      navigator.clipboard.writeText(resource.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const embedUrl = resource.videoUrl ? getYouTubeEmbedUrl(resource.videoUrl) : null;

  return (
    <div className={`bg-white/5 border ${border} rounded-xl overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{resource.title}</p>
          {resource.description && (
            <p className="text-gray-400 text-xs mt-0.5 truncate">{resource.description}</p>
          )}
          <span className={`text-xs ${color} opacity-70`}>{label}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {resource.description && (
            <p className="text-gray-300 text-sm">{resource.description}</p>
          )}

          {/* Document / Script — download link */}
          {(resource.type === "document" || resource.type === "script") && resource.fileUrl && (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/30 text-emerald-300 text-sm px-4 py-2.5 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download {resource.fileName || "File"}
            </a>
          )}

          {/* Video — embed or link */}
          {resource.type === "video" && resource.videoUrl && (
            <div className="space-y-3">
              {embedUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={resource.title}
                  />
                </div>
              ) : (
                <a
                  href={resource.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-900/20 hover:bg-red-900/30 border border-red-800/30 text-red-300 text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Watch Video
                </a>
              )}
            </div>
          )}

          {/* Email template — copy button + preview */}
          {resource.type === "email_template" && resource.content && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-emerald-300/70 text-xs font-medium uppercase tracking-wider">Email Content</p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-800/30 text-yellow-300 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
              <pre className="bg-black/30 rounded-lg p-4 text-gray-300 text-xs overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto border border-white/5">
                {resource.content}
              </pre>
            </div>
          )}

          {/* Landing page — personalised link */}
          {resource.type === "landing_page" && personalisedUrl && (
            <div className="space-y-3">
              <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-lg p-3">
                <p className="text-emerald-300/70 text-xs font-medium uppercase tracking-wider mb-1">Your Personal Link</p>
                <p className="text-white text-sm font-mono break-all">{personalisedUrl}</p>
              </div>
              <div className="flex gap-2">
                <a
                  href={personalisedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/30 text-emerald-300 text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Open Page
                </a>
                <button
                  onClick={() => { navigator.clipboard.writeText(personalisedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PEMFResources() {
  const token = getAffiliateToken();
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");

  const { data: resources, isLoading } = trpc.pemfAffiliate.getResources.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const { data: profile } = trpc.pemfAffiliate.getProfile.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  const affiliateSlug = profile?.slug || undefined;

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] to-[#0d3b22] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please log in to access resources.</p>
          <a href="/pemf/portal" className="text-emerald-400 hover:text-emerald-300">← Back to Portal</a>
        </div>
      </div>
    );
  }

  const filtered: Resource[] = resources
    ? (filterType === "all" ? (resources as Resource[]) : (resources as Resource[]).filter((r) => r.type === filterType))
    : [];

  // Group by category, then subcategory
  const grouped = filtered.reduce((acc: Record<string, Record<string, Resource[]>>, r: Resource) => {
    const cat = r.category || "General";
    const sub = r.subcategory || "";
    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][sub]) acc[cat][sub] = [];
    acc[cat][sub].push(r);
    return acc;
  }, {});

  const typeCounts = resources
    ? (Object.keys(TYPE_CONFIG) as ResourceType[]).reduce((acc, t) => {
        acc[t] = resources.filter((r: Resource) => r.type === t).length;
        return acc;
      }, {} as Record<ResourceType, number>)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a2e1a] via-[#0d3b22] to-[#0a2e1a]">
      {/* Header */}
      <header className="bg-[#0a2e1a]/95 backdrop-blur-md border-b border-emerald-800/30 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/pemf/portal" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <Leaf className="w-5 h-5 text-emerald-400" />
          <span className="text-white font-medium">Partner Resources</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Intro */}
        <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-6">
          <h1 className="text-white font-serif text-xl mb-2">Your Resource Library</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Everything you need to promote PEMF therapy and grow your referral network. 
            Download documents, use our scripts, copy email templates, and watch training videos — 
            all in one place.
          </p>
        </div>

        {/* Filter tabs */}
        {resources && resources.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${filterType === "all" ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
            >
              All ({resources.length})
            </button>
            {(Object.keys(TYPE_CONFIG) as ResourceType[]).filter(t => typeCounts && typeCounts[t] > 0).map((t) => {
              const { label, icon: Icon } = TYPE_CONFIG[t];
              return (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${filterType === t ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label} ({typeCounts?.[t]})
                </button>
              );
            })}
          </div>
        )}

        {/* Resources */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : !resources || resources.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg mb-1">Resources Coming Soon</p>
            <p className="text-sm">Your admin is preparing materials for you. Check back shortly.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No resources in this category yet.</div>
        ) : (
          Object.entries(grouped).map(([category, subcats]) => (
            <div key={category}>
              <h2 className="text-emerald-400/70 text-xs font-semibold uppercase tracking-wider mb-3">{category}</h2>
              {Object.entries(subcats as Record<string, Resource[]>).map(([sub, items]) => (
                <div key={sub} className="mb-4">
                  {sub && (
                    <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2 pl-1 border-l-2 border-emerald-700/50">{sub}</h3>
                  )}
                  <div className="space-y-2">
                    {(items as Resource[]).map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} affiliateSlug={affiliateSlug} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

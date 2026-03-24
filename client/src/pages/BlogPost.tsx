import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, TrendingUp, Tag, ArrowLeft, BookOpen, ArrowRight, Share2, ExternalLink } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  authorName?: string;
  authorBio?: string;
  authorAvatar?: string;
  authorRole?: string;
  readingTimeMinutes: number;
  viewCount: number;
  tags: string[];
  targetKeywords: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt: string;
  relatedPosts?: RelatedPost[];
  linkedCourses?: LinkedCourse[];
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  categoryName?: string;
  categoryColor?: string;
  readingTimeMinutes: number;
}

interface LinkedCourse {
  id: number;
  title: string;
  category: string;
  earningsLiftPct: number;
  isFree: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-white mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-gray-300 italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-4 text-gray-300 italic bg-emerald-500/5 rounded-r-lg">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="text-gray-300 mb-1.5 flex items-start gap-2"><span class="text-emerald-400 mt-1.5 flex-shrink-0">▸</span><span>$1</span></li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/gs, '<ul class="my-4 space-y-1">$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-gray-300 mb-1.5">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 hover:text-emerald-300 underline transition-colors" target="_blank" rel="noopener">$1</a>')
    .replace(/^---$/gm, '<hr class="border-gray-700 my-8" />')
    .replace(/\n\n/g, '</p><p class="text-gray-300 leading-relaxed mb-4">')
    .replace(/^(?!<[h|u|b|l|i|c|o])(.+)$/gm, (m) => {
      if (!m.trim() || m.startsWith('<')) return m;
      return `<p class="text-gray-300 leading-relaxed mb-4">${m}</p>`;
    });
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts/${slug}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json() as Promise<BlogPost>;
    },
  });

  const trackViewMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/blog/posts/${slug}/view`, { method: "POST" });
    },
  });

  useEffect(() => {
    if (post) {
      trackViewMutation.mutate();
      document.title = post.metaTitle || post.title;
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="h-12 bg-gray-800 rounded-xl mb-6 animate-pulse" />
          <div className="h-72 bg-gray-800 rounded-2xl mb-8 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-800 rounded mb-3 animate-pulse" style={{ width: `${80 + i * 4}%` }} />
          ))}
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
            <Link href="/blog" className="text-emerald-400 hover:text-emerald-300">← Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const catCls = post.categoryColor ? (CATEGORY_COLORS[post.categoryColor] || CATEGORY_COLORS.emerald) : CATEGORY_COLORS.emerald;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Article Header */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 py-10">
          <div className="max-w-4xl mx-auto px-4">
            <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {post.categoryName && (
                <Link href={`/blog/category/${post.categorySlug}`}>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${catCls}`}>
                    {post.categoryName}
                  </span>
                </Link>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" /> {post.readingTimeMinutes} min read
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" /> {post.viewCount.toLocaleString()} views
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              {post.authorName && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{post.authorName}</p>
                    <p className="text-gray-500 text-xs">
                      {post.authorRole} · {new Date(post.publishedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}
              <button
                data-testid="button-share"
                onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Main Content */}
            <article className="lg:col-span-3">
              {post.coverImage && (
                <div className="mb-8 rounded-2xl overflow-hidden h-72 md:h-96">
                  <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
              />

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-800">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Bio */}
              {post.authorName && (
                <div className="mt-10 p-6 bg-gray-900 border border-gray-800 rounded-2xl flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-2xl flex-shrink-0">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold">{post.authorName}</p>
                    <p className="text-gray-400 text-sm mb-2">{post.authorRole}</p>
                    {post.authorBio && <p className="text-gray-400 text-sm leading-relaxed">{post.authorBio}</p>}
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {post.relatedPosts && post.relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-white mb-6">Related Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.relatedPosts.map(related => {
                      const relCls = related.categoryColor ? (CATEGORY_COLORS[related.categoryColor] || CATEGORY_COLORS.emerald) : CATEGORY_COLORS.emerald;
                      return (
                        <Link key={related.id} href={`/blog/${related.slug}`}>
                          <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all cursor-pointer group">
                            {related.categoryName && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${relCls} mb-2 inline-block`}>
                                {related.categoryName}
                              </span>
                            )}
                            <h4 className="text-white font-semibold text-sm leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {related.readingTimeMinutes} min read
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Academy CTA */}
                {post.linkedCourses && post.linkedCourses.length > 0 && (
                  <div className="bg-gradient-to-br from-emerald-900/30 to-blue-900/20 border border-emerald-600/30 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-bold text-sm">Learn These Skills</h3>
                    </div>
                    <div className="space-y-3 mb-4">
                      {post.linkedCourses.slice(0, 3).map(course => (
                        <Link key={course.id} href={`/academy/${course.id}`}>
                          <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-emerald-500/50 transition-all cursor-pointer group">
                            <p className="text-white text-xs font-medium leading-tight group-hover:text-emerald-400 transition-colors mb-1">
                              {course.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 text-xs">+{course.earningsLiftPct}% earnings</span>
                              {course.isFree && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">FREE</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link href="/academy/catalog">
                      <button data-testid="sidebar-academy-cta" className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                        Browse Academy <ArrowRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                )}

                {/* Find Work CTA */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-sm mb-2">Ready to Apply These Skills?</h3>
                  <p className="text-gray-400 text-xs mb-4 leading-relaxed">1,200+ live freelance jobs in SA — posted daily.</p>
                  <Link href="/jobs">
                    <button data-testid="sidebar-jobs-cta" className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                      Browse Jobs <ExternalLink className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                {/* Share */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-white font-bold text-sm mb-3">Share This Article</h3>
                  <div className="flex gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank" rel="noopener"
                      data-testid="share-twitter"
                      className="flex-1 px-3 py-2 bg-sky-600/20 border border-sky-500/30 text-sky-400 rounded-lg text-xs text-center hover:bg-sky-600/30 transition-colors">
                      Twitter / X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                      target="_blank" rel="noopener"
                      data-testid="share-linkedin"
                      className="flex-1 px-3 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs text-center hover:bg-blue-600/30 transition-colors">
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

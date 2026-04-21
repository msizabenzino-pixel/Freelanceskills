import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, Clock, TrendingUp, Tag, ChevronRight, BookOpen, ArrowRight, Rss } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  authorName?: string;
  readingTimeMinutes: number;
  viewCount: number;
  tags: string[];
  publishedAt: string;
  isFeatured: boolean;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  postCount: number;
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

function CategoryBadge({ color = "emerald", name }: { color?: string; name: string }) {
  const cls = CATEGORY_COLORS[color] || CATEGORY_COLORS.emerald;
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>{name}</span>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        data-testid={`post-card-${post.id}`}
        className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex-shrink-0">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          {post.categoryName && (
            <div className="absolute bottom-3 left-3">
              <CategoryBadge color={post.categoryColor} name={post.categoryName} />
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTimeMinutes} min</span>
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {post.viewCount.toLocaleString()} views</span>
            </div>
            {post.authorName && <span className="text-slate-500">{post.authorName}</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        data-testid={`featured-post-${post.id}`}
        className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
        <div className="h-80 bg-gradient-to-br from-emerald-900/30 to-gray-900 relative overflow-hidden">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900/20 to-blue-900/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">FEATURED</span>
              {post.categoryName && <CategoryBadge color={post.categoryColor} name={post.categoryName} />}
            </div>
            <h2 className="text-white font-bold text-2xl md:text-3xl leading-tight mb-3 group-hover:text-emerald-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {post.readingTimeMinutes} min read</span>
                {post.authorName && <span>{post.authorName}</span>}
              </div>
              <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                Read Now <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", activeCategory, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (activeCategory) params.set("category", activeCategory);
      const res = await fetch(`/api/blog/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json() as Promise<{ posts: BlogPost[]; total: number; featured?: BlogPost }>;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const res = await fetch("/api/blog/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json() as Promise<BlogCategory[]>;
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["blog-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 3) return null;
      const res = await fetch(`/api/blog/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json() as Promise<{ posts: BlogPost[] }>;
    },
    enabled: searchQuery.length >= 3,
  });

  const displayPosts = searchQuery.length >= 3 ? searchResults?.posts : postsData?.posts;
  const featured = postsData?.featured;
  const totalPages = Math.ceil((postsData?.total || 0) / 12);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-gray-900 to-gray-950 border-b border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" /> #1 Freelance Knowledge Hub in SA
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              FreelanceSkills <span className="text-emerald-400">Blog</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Actionable strategies, real earnings data, SA tax tips, AI tools, and government tender guides — published daily.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search articles — AI tools, SA tax, tenders, skills..."
                data-testid="input-blog-search"
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { setActiveCategory(null); setPage(1); }}
              data-testid="filter-all"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === null
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}>
              All Articles
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                data-testid={`filter-${cat.slug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}>
                {cat.name}
                {cat.postCount > 0 && <span className="ml-1 text-xs opacity-60">({cat.postCount})</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {/* Featured Post */}
        {featured && !activeCategory && !searchQuery && (
          <div className="mb-10">
            <FeaturedPost post={featured} />
          </div>
        )}

        {/* Search Results header */}
        {searchQuery.length >= 3 && (
          <div className="mb-6">
            <h2 className="text-white font-bold text-xl">
              {searchResults?.posts?.length || 0} results for &ldquo;{searchQuery}&rdquo;
            </h2>
          </div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : displayPosts && displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No articles yet</h3>
            <p className="text-slate-400">
              {searchQuery.length >= 3 ? "Try a different search term." : "Articles are being published daily. Check back soon!"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !searchQuery && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-page"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors">
              ← Prev
            </button>
            <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-testid="button-next-page"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors">
              Next →
            </button>
          </div>
        )}

        {/* Newsletter + RSS */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-900/30 to-gray-900 border border-emerald-600/30 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-2">2 Articles Every Day</h3>
            <p className="text-slate-400 mb-4 text-sm">Get daily freelance insights delivered to your inbox — SA tax tips, AI tools, tender alerts, and income strategies.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="your@email.co.za" data-testid="input-newsletter-email" className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500" />
              <button data-testid="button-subscribe" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">Subscribe</button>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">RSS & Sitemap</h3>
              <p className="text-slate-400 text-sm mb-4">Subscribe via RSS or check our blog sitemap for all published content.</p>
            </div>
            <div className="flex gap-3">
              <a href="/api/blog/rss" target="_blank" data-testid="link-rss" className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg text-sm hover:bg-orange-600/30 transition-colors">
                <Rss className="w-4 h-4" /> RSS Feed
              </a>
              <a href="/api/blog/sitemap" target="_blank" data-testid="link-sitemap" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                <Tag className="w-4 h-4" /> Sitemap
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

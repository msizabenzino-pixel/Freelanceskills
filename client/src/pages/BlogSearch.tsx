import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search, Clock, TrendingUp, ArrowLeft, BookOpen, Tag } from "lucide-react";

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
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
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

const POPULAR_SEARCHES = [
  "AI tools freelancers",
  "provisional tax SARS",
  "government tenders",
  "R50k month skills",
  "freelance proposal",
  "ChatGPT South Africa",
  "VAT registration",
  "electrician freelance",
];

function ResultCard({ post }: { post: BlogPost }) {
  const catCls = post.categoryColor
    ? CATEGORY_COLORS[post.categoryColor] || CATEGORY_COLORS.emerald
    : CATEGORY_COLORS.emerald;

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        data-testid={`search-result-${post.id}`}
        className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex-shrink-0">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
          {post.categoryName && (
            <div className="absolute bottom-3 left-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${catCls}`}>
                {post.categoryName}
              </span>
            </div>
          )}
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-white font-bold text-base leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {post.viewCount.toLocaleString()} views
              </span>
            </div>
            {post.authorName && <span className="text-gray-500">{post.authorName}</span>}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-500 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function BlogSearch() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialQuery = params.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery) setSubmittedQuery(initialQuery);
  }, [initialQuery]);

  const { data: searchData, isLoading } = useQuery({
    queryKey: ["blog-search-page", submittedQuery],
    queryFn: async () => {
      if (submittedQuery.trim().length < 2) return { posts: [] };
      const res = await fetch(`/api/blog/search?q=${encodeURIComponent(submittedQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ posts: BlogPost[] }>;
    },
    enabled: submittedQuery.trim().length >= 2,
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const res = await fetch("/api/blog/categories");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<BlogCategory[]>;
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setSubmittedQuery(query.trim());
      const url = new URL(window.location.href);
      url.searchParams.set("q", query.trim());
      window.history.replaceState(null, "", url.toString());
    }
  }

  function handlePopular(term: string) {
    setQuery(term);
    setSubmittedQuery(term);
    const url = new URL(window.location.href);
    url.searchParams.set("q", term);
    window.history.replaceState(null, "", url.toString());
  }

  const results = searchData?.posts || [];
  const hasSearched = submittedQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <section className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Search the <span className="text-emerald-400">FreelanceSkills</span> Knowledge Hub
          </h1>
          <p className="text-gray-400 mb-8">480 articles on AI tools, SA tax, tenders, high-income skills, success stories and more.</p>

          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles — e.g. 'provisional tax', 'AI tools', 'tender CIPC'..."
              data-testid="input-search-query"
              autoFocus
              className="w-full pl-12 pr-32 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-base"
            />
            <button
              type="submit"
              data-testid="button-search-submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
              Search
            </button>
          </form>

          {!hasSearched && (
            <div className="mt-5">
              <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide font-medium">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => handlePopular(term)}
                    data-testid={`popular-${term.replace(/\s+/g, "-")}`}
                    className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 rounded-lg text-sm transition-colors">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {hasSearched && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              {isLoading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""} for "${submittedQuery}"`}
            </h2>
            {results.length > 0 && (
              <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                Browse all articles →
              </Link>
            )}
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(post => (
              <ResultCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No articles found for "{submittedQuery}"</h3>
            <p className="text-gray-400 mb-6">Try different keywords, or browse by category below.</p>
            <Link href="/blog">
              <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors">
                Browse All Articles
              </button>
            </Link>
          </div>
        )}

        {!hasSearched && (
          <div>
            <h2 className="text-white font-bold text-lg mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories?.map(cat => {
                const cls = CATEGORY_COLORS[cat.color] || CATEGORY_COLORS.emerald;
                return (
                  <Link key={cat.id} href={`/blog/category/${cat.slug}`}>
                    <div
                      data-testid={`category-card-${cat.slug}`}
                      className="group bg-gray-900 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-300">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls} mb-3 inline-block`}>
                        {cat.name}
                      </span>
                      <p className="text-gray-500 text-xs mt-2">
                        {cat.postCount} article{cat.postCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-16 bg-gradient-to-br from-emerald-900/20 to-gray-900 border border-emerald-600/20 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-white font-bold text-xl mb-1">2 New Articles Every Day</h3>
                <p className="text-gray-400 text-sm">AI tools · SA tax tips · Government tenders · Success stories · Blue-collar guides</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <Link href="/blog">
                  <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
                    Browse All Articles
                  </button>
                </Link>
                <Link href="/academy">
                  <button className="px-5 py-2.5 bg-gray-800 border border-gray-700 hover:border-emerald-500/50 text-white rounded-xl text-sm font-medium transition-colors">
                    FreelanceSkills Academy
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

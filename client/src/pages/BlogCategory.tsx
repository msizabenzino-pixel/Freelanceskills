import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, TrendingUp, ArrowLeft, BookOpen } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  categoryName?: string;
  categoryColor?: string;
  authorName?: string;
  readingTimeMinutes: number;
  viewCount: number;
  publishedAt: string;
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

export default function BlogCategory() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ["blog-category", params.slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/categories/${params.slug}`);
      if (!res.ok) throw new Error("Category not found");
      return res.json() as Promise<BlogCategory>;
    },
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-category-posts", params.slug, page],
    queryFn: async () => {
      const res = await fetch(`/api/blog/posts?category=${params.slug}&page=${page}&limit=12`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json() as Promise<{ posts: BlogPost[]; total: number }>;
    },
  });

  const totalPages = Math.ceil((postsData?.total || 0) / 12);
  const catCls = category ? (CATEGORY_COLORS[category.color] || CATEGORY_COLORS.emerald) : CATEGORY_COLORS.emerald;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          {category && (
            <div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${catCls} mb-4 inline-block`}>
                {category.name}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">{category.name}</h1>
              {category.description && <p className="text-gray-400 text-lg">{category.description}</p>}
              <p className="text-gray-500 text-sm mt-2">{category.postCount} articles</p>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : postsData?.posts && postsData.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postsData.posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article data-testid={`post-card-${post.id}`} className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-gray-700" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTimeMinutes} min</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {post.viewCount.toLocaleString()} views</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No articles yet in this category</h3>
            <p className="text-gray-400">Check back soon — we publish 2 articles daily.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors">← Prev</button>
            <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-colors">Next →</button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

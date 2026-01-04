"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  original_url: string;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false }); // 최신글 순서

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <nav className="w-full max-w-md mb-8 flex justify-between items-center">
        <Link href="/" className="text-gray-400 hover:text-pink-500">← 홈으로</Link>
        <h1 className="text-xl font-bold text-gray-800">피부 꿀팁 매거진 📖</h1>
      </nav>

      <main className="w-full max-w-md space-y-4">
        {loading ? (
          <div className="text-center py-10">로딩 중... ⏳</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">아직 등록된 글이 없어요.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                {post.summary}
              </p>
              <div className="flex justify-end">
                <a 
                  href={post.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-500 text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  블로그에서 전체 보기 ↗
                </a>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
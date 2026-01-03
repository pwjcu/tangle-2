"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

interface Treatment {
  id: number;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  // 한글 깨짐 방지를 위해 디코딩 (예: %EB%... -> 리프팅)
  const categoryName = decodeURIComponent(params.name as string); 
  
  const [list, setList] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("category", categoryName); // 여기가 핵심! 카테고리 이름으로 필터링

      if (error) {
        console.error(error);
      } else {
        setList(data || []);
      }
      setLoading(false);
    };

    fetchCategory();
  }, [categoryName]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <nav className="w-full max-w-md mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-pink-500 text-lg">
          ← 뒤로가기
        </button>
      </nav>

      <main className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          <span className="text-pink-500">{categoryName}</span> 모음
        </h1>
        <p className="text-gray-500 mb-8">이 카테고리의 인기 시술들입니다.</p>

        {loading ? (
          <div className="text-center py-10 text-pink-500">불러오는 중... ⏳</div>
        ) : list.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            아직 등록된 시술이 없어요 😭
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((item) => (
              <Link href={`/treatment/${item.id}`} key={item.id} className="block">
                <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white hover:border-pink-300 cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full text-white font-bold ${
                      item.pain_level >= 4 ? "bg-red-400" : item.pain_level <= 2 ? "bg-blue-400" : "bg-yellow-400"
                    }`}>
                      통증 {item.pain_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-900 font-bold">
                    <span>{item.price_min}~{item.price_max}만원</span>
                    <span className="text-pink-500 bg-pink-50 px-2 py-1 rounded">✨ {item.synergy}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
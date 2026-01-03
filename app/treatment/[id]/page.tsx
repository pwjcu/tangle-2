"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient"; 
import Link from "next/link";

interface TreatmentDetail {
  id: number;
  name: string;
  category: string;
  price_min: number;
  price_max: number;
  pain_level: number;
  description: string;
  synergy: string;
  side_effects: string; // 새로 추가된 정보
  recovery: string;     // 새로 추가된 정보
  cycle: string;        // 새로 추가된 정보
}

export default function TreatmentDetailPage() {
  const { id } = useParams(); // 주소창의 id(숫자)를 가져옴
  const router = useRouter();
  const [treatment, setTreatment] = useState<TreatmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("id", id) // id가 일치하는 것 하나만 가져옴
        .single();

      if (error) {
        console.error(error);
        alert("정보를 불러오지 못했어요.");
        router.push("/recommend"); // 에러나면 목록으로 튕겨내기
      } else {
        setTreatment(data);
      }
      setLoading(false);
    };

    fetchDetail();
  }, [id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-pink-500">로딩 중... ⏳</div>;
  if (!treatment) return <div>데이터 없음</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <nav className="w-full max-w-md mb-6 flex items-center">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-pink-500 text-lg">
          ← 뒤로가기
        </button>
      </nav>

      <main className="w-full max-w-md">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <span className="inline-block bg-pink-100 text-pink-500 text-xs font-bold px-2 py-1 rounded-full mb-2">
            {treatment.category}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900">{treatment.name}</h1>
          <p className="text-gray-500 mt-2">{treatment.description}</p>
        </div>

        {/* 가격 및 통증 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-400 text-xs mb-1">예상 가격</p>
            <p className="text-lg font-bold text-gray-800">{treatment.price_min}~{treatment.price_max}만</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <p className="text-gray-400 text-xs mb-1">통증 레벨</p>
            <div className="flex justify-center gap-1 mt-1">
               {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < treatment.pain_level ? "bg-pink-500" : "bg-gray-200"}`} />
               ))}
            </div>
          </div>
        </div>

        {/* 상세 정보 섹션 */}
        <div className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-2">💡 추천 주기</h3>
            <p className="text-gray-700 bg-pink-50 p-4 rounded-xl border border-pink-100">
              {treatment.cycle || "정보 없음"}
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-2">🏥 회복 기간</h3>
            <p className="text-gray-700">{treatment.recovery || "정보 없음"}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-2 text-red-500">⚠️ 주요 부작용</h3>
            <p className="text-gray-700">{treatment.side_effects || "정보 없음"}</p>
          </div>

          <div className="border-t pt-6 mb-10">
            <h3 className="font-bold text-lg mb-2">✨ 꿀조합 시술</h3>
            <p className="text-blue-600 font-bold">
              + {treatment.synergy}
            </p>
          </div>
        </div>

        {/* 하단 상담 버튼 */}
        <button className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-pink-600 transition-colors">
          이 시술 상담받기
        </button>
      </main>
    </div>
  );
}
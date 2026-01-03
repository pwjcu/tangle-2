"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

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

export default function RecommendPage() {
  const [step, setStep] = useState(1);
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [dbResults, setDbResults] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  const ageOptions = ["20대", "30대", "40대", "50대", "60대 이상"];
  const budgetOptions = [
    "50만원 이하", "50~100만원", "100~150만원", 
    "150~200만원", "200~300만원", "300만원 이상"
  ];

  // 3단계(결과 화면) 진입 시 데이터 가져오기
  useEffect(() => {
    if (step === 3) {
      fetchTreatments();
    }
  }, [step]);

  // 예산 텍스트를 숫자로 변환 (공백 제거 및 범위 설정)
  const getBudgetRange = (budgetStr: string) => {
    const cleanStr = budgetStr.replace(/\s+/g, '');
    if (cleanStr.includes("50만원이하")) return { min: 0, max: 50 };
    if (cleanStr.includes("50~100만원")) return { min: 50, max: 100 };
    if (cleanStr.includes("100~150만원")) return { min: 100, max: 150 };
    if (cleanStr.includes("150~200만원")) return { min: 150, max: 200 };
    if (cleanStr.includes("200~300만원")) return { min: 200, max: 300 };
    if (cleanStr.includes("300만원이상")) return { min: 300, max: 9999 };
    return { min: 0, max: 9999 };
  };

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      // 1. DB에서 시술 정보 가져오기
      const { data, error } = await supabase.from('treatments').select('*');
      
      if (error) throw error;

      if (data) {
        // 2. 예산 범위에 맞춰서 필터링 (JavaScript 로직)
        const { min, max } = getBudgetRange(selectedBudget);
        
        const filtered = data.filter((t: Treatment) => {
          const price = Number(t.price_min);
          return price >= min && price < max;
        });

        setDbResults(filtered);
      }
    } catch (err) { 
      console.error(err);
      alert("데이터를 불러오는 중 문제가 발생했습니다.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* 상단 네비게이션 */}
      <nav className="w-full max-w-md mb-6 flex items-center justify-between">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="text-gray-400 hover:text-pink-500 text-sm">
            ← 뒤로가기
          </button>
        ) : (
          <Link href="/" className="text-gray-400 hover:text-pink-500 text-sm">
            ← 처음으로
          </Link>
        )}
        <div className="text-xs text-gray-300 font-bold">Step {step}/3</div>
      </nav>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 min-h-[500px]">
        {/* Step 1: 나이 선택 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">나이가 어떻게 되세요?</h2>
            <p className="text-gray-400 text-sm mb-6">생애 주기에 맞는 시술을 추천해드려요.</p>
            <div className="space-y-3">
              {ageOptions.map((age) => (
                <button 
                  key={age} 
                  onClick={() => { setSelectedAge(age); setStep(2); }} 
                  className="w-full p-4 text-left border rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors font-medium text-gray-700"
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 예산 선택 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">예산은 어느 정도인가요?</h2>
            <p className="text-gray-400 text-sm mb-6">무리하지 않는 선에서 추천해 드릴게요.</p>
            <div className="space-y-3">
              {budgetOptions.map((budget) => (
                <button 
                  key={budget} 
                  onClick={() => { setSelectedBudget(budget); setStep(3); }} 
                  className="w-full p-4 text-left border rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-colors font-medium text-gray-700"
                >
                  {budget}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 결과 목록 (클릭하면 이동하도록 수정됨!) */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">
              <span className="text-pink-500">{selectedAge}</span>, 
              <span className="text-pink-500"> {selectedBudget}</span> 추천
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              조건에 딱 맞는 시술을 찾았어요! (클릭해보세요)
            </p>
            
            {loading ? (
              <div className="text-center py-10 text-pink-500">AI가 분석 중입니다... ⏳</div>
            ) : dbResults.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>이 예산으로는 추천할 시술이 없어요 😭</p>
                <button onClick={() => setStep(2)} className="text-pink-500 underline mt-2 font-bold">예산 다시 선택하기</button>
              </div>
            ) : (
              <div className="space-y-4">
                {dbResults.map((item) => (
                  // ★ 여기가 핵심 변경 사항입니다! Link로 감싸서 클릭 시 이동 ★
                  <Link href={`/treatment/${item.id}`} key={item.id} className="block">
                    <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white hover:border-pink-300 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs text-pink-500 font-bold block mb-1">{item.category}</span>
                          <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full text-white font-bold ${
                          item.pain_level >= 4 ? "bg-red-400" : item.pain_level <= 2 ? "bg-blue-400" : "bg-yellow-400"
                        }`}>
                          통증 {item.pain_level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.description}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="font-bold text-gray-900 text-sm">{item.price_min}~{item.price_max}만원</span>
                        <span className="text-pink-500 text-xs flex items-center bg-pink-50 px-2 py-1 rounded-md">
                          ✨ {item.synergy}와 찰떡
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => { setStep(1); setDbResults([]); }} 
              className="mt-8 w-full py-3 text-gray-400 underline text-sm hover:text-gray-600"
            >
              처음부터 다시하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
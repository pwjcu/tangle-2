"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecommendPage() {
  const [step, setStep] = useState(1); // 1:나이, 2:예산, 3:고민, 4:로딩, 5:결과
  const [selection, setSelection] = useState({ age: "", budget: "", concern: "" });
  const [result, setResult] = useState<any>(null);

  // 선택지 데이터
  const ages = ["20대", "30대", "40대", "50대 이상"];
  const budgets = ["30", "50", "100", "150", "200", "300 이상"];
  const concerns = ["탄력/리프팅", "주름/노화", "피부결/모공", "잡티/색소", "여드름/흉터"];

  // 다음 단계로 넘어가기
  const handleSelect = (key: string, value: string) => {
    setSelection({ ...selection, [key]: value });
    setStep(step + 1);
  };

  // AI에게 추천 요청하기 (마지막 단계)
  const getRecommendation = async (selectedConcern: string) => {
    setSelection({ ...selection, concern: selectedConcern });
    setStep(4); // 로딩 화면으로

    try {
      const res = await fetch("/api/recommend-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          age: selection.age, 
          budget: selection.budget, 
          concern: selectedConcern 
        }),
      });
      const data = await res.json();
      setResult(data);
      setStep(5); // 결과 화면으로
    } catch (error) {
      alert("추천을 가져오는데 실패했어요 😭");
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      {/* 상단 네비게이션 */}
      <nav className="w-full max-w-md mb-8">
        <Link href="/" className="text-gray-400 hover:text-pink-500">← 홈으로</Link>
      </nav>

      <main className="w-full max-w-md">
        {/* STEP 1: 나이 선택 */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">나이가 어떻게 되시나요?</h2>
            <div className="grid grid-cols-2 gap-4">
              {ages.map((age) => (
                <button
                  key={age}
                  onClick={() => handleSelect("age", age)}
                  className="p-6 rounded-2xl border border-gray-200 text-lg font-bold hover:bg-pink-50 hover:border-pink-500 hover:text-pink-500 transition-all"
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 예산 선택 */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">생각하신 예산은요? (만원)</h2>
            <div className="grid grid-cols-2 gap-4">
              {budgets.map((b) => (
                <button
                  key={b}
                  onClick={() => handleSelect("budget", b)}
                  className="p-6 rounded-2xl border border-gray-200 text-lg font-bold hover:bg-blue-50 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  {b}만원 대
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: 고민 선택 (마지막) */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">가장 큰 고민이 무엇인가요?</h2>
            <div className="space-y-3">
              {concerns.map((c) => (
                <button
                  key={c}
                  onClick={() => getRecommendation(c)}
                  className="w-full p-5 rounded-2xl border border-gray-200 text-lg font-bold text-left hover:bg-purple-50 hover:border-purple-500 hover:text-purple-500 transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: 로딩 중 */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-800">
              {selection.age}, {selection.budget}만원 예산으로<br/>
              최적의 시술 조합을 계산 중입니다...
            </h3>
            <p className="text-gray-500 mt-2">약 3~5초 정도 걸려요!</p>
          </div>
        )}

        {/* STEP 5: 결과 화면 (AI가 짜준 코스) */}
        {step === 5 && result && (
          <div className="animate-fade-in-up">
            <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
              AI 추천 완료 ✨
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
              "{result.courseName}"
            </h1>
            <p className="text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl text-sm">
              💡 <b>추천 이유:</b> {result.reason}
            </p>

            <div className="space-y-4 mb-8">
              {/* ★ 여기가 수정되었습니다! items 뒤에 물음표(?) 추가 */ }
              {/* items가 아예 없으면 빈 배열([])로 처리해서 에러 방지 */}
              {(result.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{item.name}</h4>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                  <span className="font-bold text-pink-500">{item.price}만원</span>
                </div>
              ))}

              <div className="flex justify-between items-center p-5 bg-slate-900 text-white rounded-xl shadow-lg">
                <span className="font-bold">총 예상 금액</span>
                <span className="text-xl font-extrabold text-yellow-400">{result.totalPrice}만원</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 py-4 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100"
              >
                다시 하기
              </button>
              <Link href="/request" className="flex-1">
                <button className="w-full py-4 rounded-xl bg-pink-500 text-white font-bold shadow-md hover:bg-pink-600">
                  이대로 견적 요청 🚀
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
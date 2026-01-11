"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 입력 폼 상태 관리
  const [formData, setFormData] = useState({
    user_email: "",
    category: "리프팅",
    budget: "",
    preferred_area: "",
    symptom: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1. 유효성 검사 (빈칸 체크)
    if (!formData.user_email || !formData.symptom || !formData.budget) {
      alert("필수 정보를 모두 입력해주세요!");
      setLoading(false);
      return;
    }

    // 2. Supabase에 저장
    const { error } = await supabase
      .from("requests")
      .insert([
        {
          user_email: formData.user_email,
          category: formData.category,
          budget: Number(formData.budget), // 숫자로 변환
          preferred_area: formData.preferred_area,
          symptom: formData.symptom,
          status: "open", // 기본 상태는 '진행중'
        },
      ]);

    if (error) {
      console.error(error);
      alert("요청 등록에 실패했어요. 다시 시도해주세요. 😭");
    } else {
      alert("견적 요청이 등록되었습니다! 병원들의 제안을 기다려주세요. 🎉");
      router.push("/"); // 성공하면 메인으로 이동
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <nav className="w-full max-w-md mb-6">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-pink-500 text-lg">
          ← 뒤로가기
        </button>
      </nav>

      <main className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          무료 견적 요청하기 📢
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          고민 부위와 예산을 적어주시면,<br/>
          딱 맞는 병원이 제안을 보내드립니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. 이메일 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">연락받을 이메일</label>
            <input
              type="email"
              name="user_email"
              value={formData.user_email}
              onChange={handleChange}
              placeholder="example@naver.com"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* 2. 카테고리 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">관심 시술</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition"
            >
              <option value="리프팅">리프팅 (울쎄라, 써마지 등)</option>
              <option value="스킨부스터">스킨부스터 (리쥬란, 쥬베룩)</option>
              <option value="보톡스">보톡스/필러</option>
              <option value="모공흉터">모공/흉터 관리</option>
              <option value="제모">제모</option>
              <option value="기타">기타 고민</option>
            </select>
          </div>

          {/* 3. 예산 & 지역 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">희망 예산 (만원)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="예: 100"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">선호 지역</label>
              <input
                type="text"
                name="preferred_area"
                value={formData.preferred_area}
                onChange={handleChange}
                placeholder="예: 강남, 홍대"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition"
              />
            </div>
          </div>

          {/* 4. 고민 내용 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">고민 내용 / 요청사항</label>
            <textarea
              name="symptom"
              value={formData.symptom}
              onChange={handleChange}
              rows={4}
              placeholder="예: 팔자주름이 너무 깊어서 고민이에요. 티 안 나고 오래가는 시술 추천해주세요!"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500 transition"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600 hover:scale-[1.02]"
            }`}
          >
            {loading ? "등록 중..." : "견적 요청 등록하기 ✨"}
          </button>
        </form>
      </main>
    </div>
  );
}
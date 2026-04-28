"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { treatmentCategories } from "../../lib/siteContent";

function getRequestPrefill() {
  if (typeof window === "undefined") {
    return {
      category: "리프팅",
      budget: "",
      symptom: "",
      recommended: "",
      concern: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    category: params.get("category") || "리프팅",
    budget: params.get("budget") || "",
    symptom: params.get("symptom") || "",
    recommended: params.get("recommended") || "",
    concern: params.get("concern") || "",
  };
}

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [prefill] = useState(getRequestPrefill);
  const [recommended] = useState(prefill.recommended);
  const [concern] = useState(prefill.concern);
  const [formData, setFormData] = useState({
    user_email: "",
    category: prefill.category,
    budget: prefill.budget,
    preferred_area: "",
    symptom: prefill.symptom,
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!formData.user_email || !formData.symptom || !formData.budget) {
      alert("이메일, 예산, 고민 내용은 꼭 입력해주세요.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("requests").insert([
      {
        user_email: formData.user_email,
        category: formData.category,
        budget: Number(formData.budget),
        preferred_area: formData.preferred_area,
        symptom: formData.symptom,
        status: "open",
      },
    ]);

    if (error) {
      console.error(error);
      alert("요청 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    alert("견적 요청이 등록되었습니다. 제안이 도착하면 받은 제안함에서 비교할 수 있어요.");
    router.push(`/my?email=${encodeURIComponent(formData.user_email)}`);
    setLoading(false);
  };

  return (
    <div className="pb-10 pt-4 sm:pt-5">
      <div className="shell">
        <nav className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="text-[13px] font-semibold text-stone-500 hover:text-stone-900"
          >
            ← 뒤로가기
          </button>
          <LinkHint text="요청서는 병원이 보는 기준 문서입니다." />
        </nav>

        <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <main className="panel px-5 py-5 sm:px-6 sm:py-6">
            <p className="eyebrow mb-3">request quote</p>
            <h1 className="type-title balance !text-[2rem] sm:!text-[2.3rem]" data-display="true">
              추천을 견적 요청서로 바로 연결하기
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-stone-600">
              병원 입장에서는 사용자의 예산과 고민이 선명할수록 더 구체적인 제안을 보낼 수
              있습니다. 그래서 탱글은 추천 결과를 요청서 초안으로 넘겨 바로 연결합니다.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-stone-700">연락받을 이메일</label>
                  <input
                    type="email"
                    name="user_email"
                    value={formData.user_email}
                    onChange={handleChange}
                    placeholder="example@naver.com"
                    className="field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-stone-700">관심 카테고리</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="field"
                  >
                    {treatmentCategories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-stone-700">희망 예산 (만원)</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="예: 120"
                    className="field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-stone-700">선호 지역</label>
                  <input
                    type="text"
                    name="preferred_area"
                    value={formData.preferred_area}
                    onChange={handleChange}
                    placeholder="예: 강남, 잠실, 홍대"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-stone-700">
                  고민 내용 / 요청사항
                </label>
                <textarea
                  name="symptom"
                  value={formData.symptom}
                  onChange={handleChange}
                  rows={6}
                  placeholder="예: 팔자주름과 턱선 처짐이 고민입니다. 자연스럽지만 체감이 있는 조합을 원하고, 회복 부담은 적었으면 좋겠습니다."
                  className="field min-h-[160px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-[18px] px-6 py-3.5 text-[15px] font-semibold text-white ${
                  loading
                    ? "cursor-not-allowed bg-stone-400"
                    : "bg-stone-900 hover:-translate-y-0.5 hover:bg-stone-800"
                }`}
              >
                {loading ? "요청서 등록 중..." : "견적 요청 등록하기"}
              </button>
            </form>
          </main>

          <aside className="space-y-4">
            <section className="panel px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">request summary</p>
              <h2 className="mt-3 text-[1.35rem] font-semibold text-stone-950" data-display="true">
                병원에게 전달되는 핵심 정보
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {[
                  "예산 상한과 카테고리",
                  "실제 고민 문장",
                  "원하는 변화 방향",
                  "선호 지역과 비교 가능성",
                ].map((item) => (
                  <div key={item} className="metric-tile text-[13px] font-medium text-stone-700">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {(recommended || concern) && (
              <section className="panel px-5 py-5 sm:px-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  from recommendation
                </p>
                <h3 className="mt-3 text-[1.1rem] font-semibold text-stone-900">추천에서 넘어온 정보</h3>
                <div className="mt-4 space-y-3 text-[13px] text-stone-600">
                  {concern && (
                    <p className="rounded-[16px] border border-stone-200 bg-white px-4 py-3 leading-6">
                      <span className="font-semibold text-stone-900">핵심 고민</span> {concern}
                    </p>
                  )}
                  {recommended && (
                    <p className="rounded-[16px] border border-stone-200 bg-white px-4 py-3 leading-6">
                      <span className="font-semibold text-stone-900">추천 시술</span> {recommended}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="panel px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">best practice</p>
              <h3 className="mt-3 text-[1.1rem] font-semibold text-stone-900">좋은 요청서의 조건</h3>
              <div className="mt-4 space-y-3">
                {[
                  "무조건 저가보다 원하는 효과와 회복 허용도를 같이 적기",
                  "불필요한 시술은 제외해달라고 미리 명시하기",
                  "병원이 추천 이유와 예약 안내까지 남기도록 유도하기",
                ].map((item, index) => (
                  <div key={item} className="soft-panel flex gap-3 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-[11px] font-semibold text-white">
                      0{index + 1}
                    </span>
                    <p className="text-[13px] leading-6 text-stone-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function LinkHint({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-stone-200 bg-white px-3 py-2 text-[11px] font-semibold text-stone-500">
      {text}
    </span>
  );
}

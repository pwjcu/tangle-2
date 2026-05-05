"use client";

import Link from "next/link";
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
      alert("이메일, 예산, 고민 내용을 입력해주세요.");
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
    <div className="pb-12">
      <header className="sticky top-4 z-30">
        <div className="shell flex min-h-[64px] items-center justify-between rounded-full border border-[rgba(23,21,14,0.08)] bg-white/88 px-4 py-2 backdrop-blur">
          <button onClick={() => router.back()} className="ghost-link">
            Back
          </button>
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
        </div>
      </header>

      <main className="shell pt-8">
        <section className="grid overflow-hidden rounded-[40px] bg-white lg:grid-cols-[0.92fr_1.08fr]">
          <div className="border-b border-[var(--color-silver-mist)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">request quote</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              병원 제안을 받을
              <br />
              요청서를 만듭니다
            </h1>
            <p className="mt-7 max-w-[720px] text-[16px] leading-8 text-[var(--color-muted)]">
              병원은 이 요청서를 보고 가격뿐 아니라 추천 시술, 제안 이유, 예약 안내를 함께 작성합니다. 사용자는 반복 상담 없이 조건이 맞는 병원을 먼저 비교할 수 있습니다.
            </p>
          </div>

          <aside className="grid gap-3 bg-[var(--color-porcelain-gray)] p-4 sm:grid-cols-2">
            {[
              "예산과 카테고리",
              "실제 고민 문장",
              "선호 지역",
              "피하고 싶은 조건",
            ].map((item, index) => (
              <article key={item} className="min-h-[180px] rounded-[28px] bg-white p-5 sm:p-7">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-8 text-[1.35rem] font-normal" data-display="true">
                  {item}
                </p>
              </article>
            ))}
          </aside>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
          <form onSubmit={handleSubmit} className="rounded-[36px] bg-white p-5 sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <label>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  contact email
                </span>
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  placeholder="example@naver.com"
                  className="field mt-2"
                />
              </label>

              <label>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  category
                </span>
                <select name="category" value={formData.category} onChange={handleChange} className="field mt-2">
                  {treatmentCategories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  <option value="기타">기타</option>
                </select>
              </label>

              <label>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  budget, 만원
                </span>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="예: 120"
                  className="field mt-2"
                />
              </label>

              <label>
                <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                  preferred area
                </span>
                <input
                  type="text"
                  name="preferred_area"
                  value={formData.preferred_area}
                  onChange={handleChange}
                  placeholder="예: 강남, 성수, 분당"
                  className="field mt-2"
                />
              </label>
            </div>

            <label className="mt-8 block">
              <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">
                concern and request
              </span>
              <textarea
                name="symptom"
                value={formData.symptom}
                onChange={handleChange}
                rows={7}
                placeholder="예: 얼굴 처짐과 팔자 라인이 고민입니다. 자연스럽지만 체감이 있는 조합을 원하고, 다운타임은 길지 않았으면 좋겠습니다."
                className="field mt-2 min-h-[180px] resize-none"
              />
            </label>

            <button type="submit" disabled={loading} className="action-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "요청 등록 중" : "견적 요청 등록"}
            </button>
          </form>

          <aside className="grid gap-4">
            {(recommended || concern) && (
              <article className="rounded-[28px] bg-[var(--color-porcelain-gray)] p-5 sm:p-7">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                  from recommendation
                </p>
                {concern && <p className="mt-6 text-[14px] leading-7 text-[var(--color-muted)]">고민: {concern}</p>}
                {recommended && (
                  <p className="mt-3 text-[14px] leading-7 text-[var(--color-muted)]">추천 시술: {recommended}</p>
                )}
              </article>
            )}

            {[
              {
                title: "좋은 요청서",
                body: "원하는 변화, 예산 상한, 회복 가능 시간을 명확히 적을수록 병원 제안이 좋아집니다.",
              },
              {
                title: "비교 기준",
                body: "추천 이유, 시술 조합, 예약 안내, 회복 조건을 함께 비교하세요.",
              },
              {
                title: "다음 단계",
                body: "제안이 도착하면 받은 제안함에서 병원별 내용을 한 번에 비교할 수 있습니다.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-[28px] bg-white p-5 sm:p-7">
                <h2 className="text-[1.5rem] font-normal" data-display="true">
                  {item.title}
                </h2>
                <p className="mt-4 text-[14px] leading-7 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </aside>
        </section>
      </main>
    </div>
  );
}

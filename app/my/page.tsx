"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { parseBidComment } from "../../lib/bids";

interface Bid {
  id: number;
  hospital_name: string;
  price: number;
  comment: string;
  created_at: string;
}

interface RequestRecord {
  id: number;
  category: string;
  symptom: string;
  budget: number;
  created_at: string;
  bids: Bid[];
}

function getEmailFromSearch() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("email") || "";
}

export default function MyPage() {
  const [email, setEmail] = useState(getEmailFromSearch);
  const [loadedEmail, setLoadedEmail] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [myRequests, setMyRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = async (targetEmail: string) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("requests")
      .select(
        `
          *,
          bids (*)
        `,
      )
      .eq("user_email", targetEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("제안 데이터를 불러오지 못했습니다.");
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      alert("등록된 요청 내역이 없습니다.");
      setMyRequests([]);
      setHasLoaded(false);
      setLoading(false);
      return;
    }

    setLoadedEmail(targetEmail);
    setMyRequests(data);
    setHasLoaded(true);
    setLoading(false);
  };

  const handleCheck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    await loadRequests(email);
  };

  const handleSelectBid = (hospitalName: string) => {
    alert(`'${hospitalName}' 제안을 선택했습니다. 실제 연결 단계는 다음 리팩토링에서 이어집니다.`);
  };

  if (!hasLoaded) {
    return (
      <div className="pb-16 pt-5 sm:pt-7">
        <div className="shell">
          <div className="mx-auto max-w-xl panel px-6 py-8 sm:px-8">
            <p className="eyebrow mb-3">proposal inbox</p>
            <h1 className="text-3xl font-bold text-stone-950" data-display="true">
              받은 제안함 확인하기
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              견적 요청 시 입력한 이메일을 기준으로 병원 제안서를 불러옵니다.
            </p>

            <form onSubmit={handleCheck} className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="example@naver.com"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-[20px] px-6 py-4 text-base font-semibold text-white ${
                  loading
                    ? "cursor-not-allowed bg-stone-400"
                    : "bg-stone-900 hover:-translate-y-0.5 hover:bg-stone-800"
                }`}
              >
                {loading ? "조회 중..." : "도착한 제안 확인하기"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 pt-5 sm:pt-7">
      <div className="shell">
        <header className="panel mb-6 flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">proposal inbox</p>
            <h1 className="text-3xl font-bold text-stone-950" data-display="true">
              받은 제안 비교
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {loadedEmail} 기준으로 도착한 제안을 불러왔습니다. 가격만이 아니라 추천 시술과
              이유까지 같이 보고 비교하세요.
            </p>
          </div>
          <button
            onClick={() => setHasLoaded(false)}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 hover:border-stone-300 hover:text-stone-900"
          >
            다른 이메일로 조회
          </button>
        </header>

        <main className="space-y-6">
          {myRequests.map((request) => {
            const sortedBids = [...request.bids].sort((left, right) => left.price - right.price);

            return (
              <section key={request.id} className="panel px-6 py-6">
                <div className="grid gap-5 lg:grid-cols-[0.74fr_1.26fr]">
                  <article className="rounded-[24px] border border-stone-200 bg-white p-5">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                      내가 보낸 요청
                    </span>
                    <h2 className="mt-4 text-2xl font-bold text-stone-900">
                      {request.category} / 예산 {request.budget}만원
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-stone-600">{request.symptom}</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-stone-400">
                      도착한 제안 {request.bids.length}건
                    </p>
                  </article>

                  <div className="space-y-4">
                    {sortedBids.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-stone-300 bg-white/70 px-5 py-10 text-center text-sm text-stone-500">
                        아직 도착한 제안이 없습니다. 조금만 기다려주세요.
                      </div>
                    ) : (
                      sortedBids.map((bid) => {
                        const parsed = parseBidComment(bid.comment);
                        return (
                          <article key={bid.id} className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-2xl font-bold text-stone-900">{bid.hospital_name}</h3>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                                  {new Date(bid.created_at).toLocaleDateString()} 도착
                                </p>
                              </div>
                              <div className="rounded-2xl bg-stone-900 px-4 py-3 text-white">
                                <p className="text-xs uppercase tracking-[0.14em] text-white/65">price</p>
                                <p className="mt-1 text-2xl font-bold" data-display="true">
                                  {bid.price}만원
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">추천 시술</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.plan || "별도 기재 없음"}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">제안 이유</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.reason || "별도 기재 없음"}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">예약 안내</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.reservation || "별도 기재 없음"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSelectBid(bid.hospital_name)}
                              className="mt-5 w-full rounded-[20px] bg-stone-900 px-6 py-4 text-base font-semibold text-white hover:-translate-y-0.5 hover:bg-stone-800"
                            >
                              이 제안으로 상담 이어가기
                            </button>
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

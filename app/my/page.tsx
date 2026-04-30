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

function formatPrice(value: number) {
  return `${value.toLocaleString()}만원`;
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
      alert("등록된 요청 이력이 없습니다.");
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
    alert(`'${hospitalName}' 제안을 선택했습니다. 실제 예약 연결 단계는 다음 리팩토링에서 이어집니다.`);
  };

  if (!hasLoaded) {
    return (
      <div className="pb-12 pt-4 sm:pt-5">
        <div className="shell">
          <div className="mx-auto max-w-[620px] panel px-5 py-6 sm:px-6">
            <p className="eyebrow mb-3">proposal inbox</p>
            <h1 className="type-title !text-[2rem] sm:!text-[2.2rem]" data-display="true">
              받은 제안함 확인하기
            </h1>
            <p className="mt-3 text-[14px] leading-7 text-stone-600">
              견적 요청 때 입력한 이메일을 기준으로 병원 제안을 불러옵니다.
            </p>

            <form onSubmit={handleCheck} className="mt-5 space-y-3">
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
                className={`w-full rounded-[18px] px-6 py-3.5 text-[15px] font-semibold text-white ${
                  loading ? "cursor-not-allowed bg-stone-400" : "bg-[#6b38d4] hover:-translate-y-0.5 hover:bg-[#5b2cc4]"
                }`}
              >
                {loading ? "조회 중..." : "내 제안 확인하기"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 pt-4 sm:pt-5">
      <div className="shell">
        <header className="panel mb-4 flex flex-col gap-3 px-5 py-5 sm:px-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">proposal inbox</p>
            <h1 className="type-title !text-[2rem] sm:!text-[2.3rem]" data-display="true">
              받은 제안 비교
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-stone-600">
              {loadedEmail} 기준으로 도착한 병원 제안을 불러왔습니다. 가격만이 아니라 추천 시술, 제안 이유,
              예약 안내까지 함께 보고 비교하세요.
            </p>
          </div>
          <button
            onClick={() => setHasLoaded(false)}
            className="action-secondary !rounded-full !px-4 !py-2.5 !text-sm"
          >
            다른 이메일로 조회
          </button>
        </header>

        <main className="space-y-4">
          {myRequests.map((request) => {
            const sortedBids = [...request.bids].sort((left, right) => left.price - right.price);
            const bestBid = sortedBids[0];

            return (
              <section key={request.id} className="panel px-5 py-5 sm:px-6">
                <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                  <article className="rounded-[22px] border border-stone-200 bg-white p-5">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                      내가 보낸 요청
                    </span>
                    <h2 className="mt-4 text-[1.2rem] font-semibold text-stone-900 sm:text-[1.35rem]">
                      {request.category} / 예산 {formatPrice(request.budget)}
                    </h2>
                    <p className="mt-4 text-[13px] leading-7 text-stone-600">{request.symptom}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          도착한 제안
                        </p>
                        <p className="mt-2 text-[1.45rem] font-semibold text-stone-950" data-display="true">
                          {request.bids.length}건
                        </p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          요청일
                        </p>
                        <p className="mt-2 text-[14px] font-medium text-stone-700">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {bestBid && (
                      <div className="mt-4 rounded-[18px] border border-[#e3d7fa] bg-[#f7f1ff] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b38d4]">
                          best price
                        </p>
                        <p className="mt-2 text-[15px] font-semibold text-stone-900">
                          {bestBid.hospital_name} · {formatPrice(bestBid.price)}
                        </p>
                      </div>
                    )}
                  </article>

                  <div className="space-y-4">
                    {sortedBids.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-stone-300 bg-white/70 px-5 py-10 text-center text-sm text-stone-500">
                        아직 도착한 제안이 없습니다. 조금만 기다려 주세요.
                      </div>
                    ) : (
                      sortedBids.map((bid, index) => {
                        const parsed = parseBidComment(bid.comment);
                        const isBest = index === 0;

                        return (
                          <article key={bid.id} className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-[1.15rem] font-semibold text-stone-900 sm:text-[1.25rem]">
                                    {bid.hospital_name}
                                  </h3>
                                  {isBest && (
                                    <span className="rounded-full bg-[#f1e9ff] px-2.5 py-1 text-[11px] font-semibold text-[#6b38d4]">
                                      최저가
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                                  {new Date(bid.created_at).toLocaleDateString()} 도착
                                </p>
                              </div>
                              <div className="rounded-2xl bg-[#221a33] px-4 py-3 text-white">
                                <p className="text-xs uppercase tracking-[0.14em] text-white/65">price</p>
                                <p className="mt-1 text-[1.35rem] font-semibold" data-display="true">
                                  {formatPrice(bid.price)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">추천 시술</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.plan || "별도 기재 없음"}
                                </p>
                              </div>
                              <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">제안 이유</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.reason || "별도 기재 없음"}
                                </p>
                              </div>
                              <div className="rounded-[16px] bg-stone-50 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-stone-400">예약 안내</p>
                                <p className="mt-2 text-sm font-medium leading-6 text-stone-700">
                                  {parsed.reservation || "별도 기재 없음"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleSelectBid(bid.hospital_name)}
                              className="mt-5 w-full rounded-[18px] bg-[#6b38d4] px-6 py-3.5 text-[15px] font-semibold text-white hover:-translate-y-0.5 hover:bg-[#5b2cc4]"
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

"use client";

import Link from "next/link";
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
      <div className="pb-10">
        <header className="border-b border-[var(--color-carbon)]">
          <div className="shell flex min-h-[64px] items-center justify-between py-3">
            <Link href="/" className="ghost-link">
              Tangle
            </Link>
            <span className="ghost-link">Proposal Inbox</span>
          </div>
        </header>

        <main className="shell">
          <section className="mx-auto max-w-[720px] border-x border-b border-[var(--color-carbon)] p-5 sm:p-8">
            <p className="eyebrow">proposal inbox</p>
            <h1 className="type-section mt-7" data-display="true">
              받은 병원 제안을
              <br />
              확인합니다
            </h1>
            <p className="mt-5 type-copy">견적 요청 시 입력한 이메일을 기준으로 병원 제안을 불러옵니다.</p>

            <form onSubmit={handleCheck} className="mt-8 space-y-6">
              <input
                type="email"
                placeholder="example@naver.com"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit" disabled={loading} className="action-primary w-full disabled:opacity-50">
                {loading ? "조회 중" : "제안 확인"}
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <header className="border-b border-[var(--color-carbon)]">
        <div className="shell flex min-h-[64px] items-center justify-between py-3">
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
          <button onClick={() => setHasLoaded(false)} className="ghost-link">
            다른 이메일 조회
          </button>
        </div>
      </header>

      <main className="shell">
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">proposal inbox</p>
            <h1 className="type-section mt-7" data-display="true">
              받은 제안 비교
            </h1>
            <p className="mt-5 type-copy">{loadedEmail} 기준으로 도착한 병원 제안을 불러왔습니다.</p>
          </div>
          <div className="grid sm:grid-cols-2">
            <Metric label="requests" value={`${myRequests.length}건`} />
            <Metric label="offers" value={`${myRequests.reduce((sum, item) => sum + item.bids.length, 0)}건`} />
          </div>
        </section>

        <section className="border-x border-b border-[var(--color-carbon)]">
          {myRequests.map((request) => {
            const sortedBids = [...request.bids].sort((left, right) => left.price - right.price);
            const bestBid = sortedBids[0];

            return (
              <article key={request.id} className="grid border-b border-[var(--color-carbon)] last:border-b-0 xl:grid-cols-[0.75fr_1.25fr]">
                <div className="border-b border-[var(--color-carbon)] p-5 sm:p-7 xl:border-b-0 xl:border-r">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                  <h2 className="mt-8 text-[2rem] font-normal leading-tight" data-display="true">
                    {request.category}
                    <br />
                    예산 {formatPrice(request.budget)}
                  </h2>
                  <p className="mt-6 text-[14px] leading-7 text-[var(--color-muted)]">{request.symptom}</p>
                  {bestBid && (
                    <div className="mt-8 border border-[var(--color-carbon)] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">lowest offer</p>
                      <p className="mt-3 text-[15px] font-semibold">
                        {bestBid.hospital_name} / {formatPrice(bestBid.price)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {sortedBids.length === 0 ? (
                    <div className="p-10 text-center text-[14px] text-[var(--color-muted)]">
                      아직 도착한 제안이 없습니다.
                    </div>
                  ) : (
                    sortedBids.map((bid, index) => {
                      const parsed = parseBidComment(bid.comment);

                      return (
                        <article key={bid.id} className="border-b border-[var(--color-line)] p-5 sm:p-7 last:border-b-0">
                          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">
                                offer {String(index + 1).padStart(2, "0")}
                              </p>
                              <h3 className="mt-4 text-[1.7rem] font-normal" data-display="true">
                                {bid.hospital_name}
                              </h3>
                            </div>
                            <p className="text-[2rem] font-normal leading-none" data-display="true">
                              {formatPrice(bid.price)}
                            </p>
                          </div>

                          <div className="mt-8 grid gap-5 md:grid-cols-3">
                            <OfferField label="추천 시술" value={parsed.plan || "별도 기재 없음"} />
                            <OfferField label="제안 이유" value={parsed.reason || "별도 기재 없음"} />
                            <OfferField label="예약 안내" value={parsed.reservation || "별도 기재 없음"} />
                          </div>

                          <button onClick={() => handleSelectBid(bid.hospital_name)} className="action-primary mt-8 w-full">
                            이 제안으로 상담 이어가기
                          </button>
                        </article>
                      );
                    })
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-h-[180px] border-b border-[var(--color-line)] p-5 sm:border-r sm:even:border-r-0 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{label}</p>
      <p className="mt-8 text-[2rem] font-normal" data-display="true">
        {value}
      </p>
    </article>
  );
}

function OfferField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">{label}</p>
      <p className="mt-3 text-[13px] leading-6 text-[var(--color-muted)]">{value}</p>
    </div>
  );
}

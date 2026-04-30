"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { buildBidComment } from "../../lib/bids";

interface RequestRecord {
  id: number;
  user_email: string;
  category: string;
  budget: number;
  preferred_area: string;
  symptom: string;
  created_at: string;
}

interface BidFormState {
  hospital_name: string;
  price: string;
  recommended_plan: string;
  reason: string;
  reservation: string;
}

const emptyBidState: BidFormState = {
  hospital_name: "",
  price: "",
  recommended_plan: "",
  reason: "",
  reservation: "",
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}만원`;
}

export default function HospitalPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidInputs, setBidInputs] = useState<Record<number, BidFormState>>({});

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      setRequests(data || []);
      setLoading(false);
    };

    void fetchRequests();
  }, []);

  const handleInputChange = (requestId: number, field: keyof BidFormState, value: string) => {
    setBidInputs((prev) => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || emptyBidState),
        [field]: value,
      },
    }));
  };

  const submitBid = async (requestId: number) => {
    const input = bidInputs[requestId];

    if (
      !input?.hospital_name ||
      !input?.price ||
      !input?.recommended_plan ||
      !input?.reason ||
      !input?.reservation
    ) {
      alert("병원명, 가격, 추천 시술, 제안 이유, 예약 안내를 모두 입력해 주세요.");
      return;
    }

    const { error } = await supabase.from("bids").insert([
      {
        request_id: requestId,
        hospital_name: input.hospital_name,
        price: Number(input.price),
        comment: buildBidComment({
          plan: input.recommended_plan,
          reason: input.reason,
          reservation: input.reservation,
        }),
      },
    ]);

    if (error) {
      console.error(error);
      alert("제안 전송에 실패했습니다.");
      return;
    }

    alert("제안서가 고객에게 전송되었습니다.");
    setBidInputs((prev) => ({
      ...prev,
      [requestId]: emptyBidState,
    }));
  };

  return (
    <div className="pb-12 pt-4 sm:pt-5">
      <div className="shell">
        <header className="panel mb-4 flex flex-col gap-3 px-5 py-5 sm:px-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">partner center</p>
            <h1 className="type-title !text-[2rem] sm:!text-[2.3rem]" data-display="true">
              병원 제안 관리
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-stone-600">
              가격만 적는 입찰이 아니라 추천 시술, 제안 이유, 예약 안내까지 함께 보내는 구조를 기준으로
              정리했습니다.
            </p>
          </div>
          <div className="rounded-full bg-[#221a33] px-4 py-2 text-sm font-semibold text-white">
            열려 있는 요청 {requests.length}건
          </div>
        </header>

        <main className="space-y-4">
          {loading ? (
            <div className="panel px-6 py-12 text-center text-sm text-stone-500">요청서를 불러오는 중입니다.</div>
          ) : requests.length === 0 ? (
            <div className="panel px-6 py-12 text-center text-sm text-stone-500">현재 열려 있는 요청이 없습니다.</div>
          ) : (
            requests.map((request) => {
              const values = bidInputs[request.id] || emptyBidState;

              return (
                <section
                  key={request.id}
                  className="panel grid gap-4 px-5 py-5 sm:px-6 xl:grid-cols-[0.8fr_1.2fr]"
                >
                  <article className="rounded-[22px] border border-stone-200 bg-white p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f1e9ff] px-3 py-1 text-xs font-semibold text-[#6b38d4]">
                        {request.category}
                      </span>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="mt-4 text-[1.2rem] font-semibold text-stone-900 sm:text-[1.35rem]">
                      예산 {formatPrice(request.budget)} / 선호 지역 {request.preferred_area || "미정"}
                    </h2>
                    <p className="mt-4 rounded-[18px] bg-stone-50 px-4 py-4 text-[13px] leading-7 text-stone-600">
                      {request.symptom}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          고객 연락 이메일
                        </p>
                        <p className="mt-2 text-[13px] font-medium text-stone-700">{request.user_email}</p>
                      </div>
                      <div className="metric-tile">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          요청일
                        </p>
                        <p className="mt-2 text-[13px] font-medium text-stone-700">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[22px] border border-stone-200 bg-white p-5">
                    <h3 className="text-[1.1rem] font-semibold text-stone-900">제안서 작성</h3>
                    <p className="mt-2 text-[13px] leading-6 text-stone-600">
                      추천 시술과 이유를 함께 적어야 사용자가 가격만으로 판단하지 않고 비교할 수 있습니다.
                    </p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
                      <input
                        type="text"
                        placeholder="병원 이름"
                        className="field"
                        value={values.hospital_name}
                        onChange={(event) => handleInputChange(request.id, "hospital_name", event.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="제안 가격 (만원)"
                        className="field"
                        value={values.price}
                        onChange={(event) => handleInputChange(request.id, "price", event.target.value)}
                      />
                    </div>

                    <div className="mt-4 space-y-4">
                      <input
                        type="text"
                        placeholder="추천 시술 조합 예: 울쎄라 300샷 + 리쥬란"
                        className="field"
                        value={values.recommended_plan}
                        onChange={(event) => handleInputChange(request.id, "recommended_plan", event.target.value)}
                      />
                      <textarea
                        placeholder="제안 이유 예: 예산 안에서 탄력 체감이 있으면서 다운타임 부담이 비교적 적은 조합입니다."
                        className="field min-h-[120px] resize-none"
                        value={values.reason}
                        onChange={(event) => handleInputChange(request.id, "reason", event.target.value)}
                      />
                      <textarea
                        placeholder="예약 안내 예: 상담 후 당일 진행 가능하며 사전 예약 시 원하는 시간대 안내 가능합니다."
                        className="field min-h-[100px] resize-none"
                        value={values.reservation}
                        onChange={(event) => handleInputChange(request.id, "reservation", event.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => submitBid(request.id)}
                      className="mt-5 w-full rounded-[18px] bg-[#6b38d4] px-6 py-3.5 text-[15px] font-semibold text-white hover:-translate-y-0.5 hover:bg-[#5b2cc4]"
                    >
                      제안서 전송
                    </button>
                  </article>
                </section>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}

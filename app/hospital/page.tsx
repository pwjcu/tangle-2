"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

interface AuthUserState {
  email: string | null;
  checked: boolean;
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
  const [authUser, setAuthUser] = useState<AuthUserState>({ email: null, checked: false });
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [bidInputs, setBidInputs] = useState<Record<number, BidFormState>>({});

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? requests[0] ?? null,
    [requests, selectedRequestId],
  );

  useEffect(() => {
    const syncAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setAuthUser({ email: user?.email ?? null, checked: true });
    };

    void syncAuth();
  }, []);

  useEffect(() => {
    if (!authUser.checked || !authUser.email) return;

    const fetchRequests = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      const nextRequests = data || [];
      setRequests(nextRequests);
      setSelectedRequestId((prev) => prev ?? nextRequests[0]?.id ?? null);
      setLoading(false);
    };

    void fetchRequests();
  }, [authUser]);

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/hospital`,
      },
    });

    if (error) {
      alert(`로그인에 실패했어요. ${error.message}`);
    }
  };

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
      alert("병원명, 가격, 추천 시술, 제안 이유, 예약 안내를 모두 입력해주세요.");
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
    <div className="pb-10">
      <header className="border-b border-[var(--color-carbon)]">
        <div className="shell flex min-h-[64px] items-center justify-between py-3">
          <Link href="/" className="ghost-link">
            Tangle
          </Link>
          <span className="ghost-link">Partner Center</span>
        </div>
      </header>

      <main className="shell">
        <section className="grid border-x border-b border-[var(--color-carbon)] lg:grid-cols-[1fr_1fr]">
          <div className="border-b border-[var(--color-carbon)] p-5 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="eyebrow">hospital center</p>
            <h1 className="type-title mt-7 !text-[3rem] sm:!text-[4.4rem]" data-display="true">
              요청을 고르고
              <br />
              역제안합니다
            </h1>
            <p className="mt-7 max-w-[720px] type-copy">
              병원 관계자는 열린 요청을 선택해 상세 내용을 확인하고, 핏이 맞는 고객에게 추천 시술, 가격, 예약 안내를 제안합니다. 최종 버전에서는 관리자와 승인된 병원 계정만 접근하도록 권한을 분리합니다.
            </p>
          </div>

          <div className="grid sm:grid-cols-2">
            <StatusBlock label="open requests" value={`${requests.length}건`} />
            <StatusBlock label="selected" value={selectedRequest ? `#${selectedRequest.id}` : "none"} />
            <StatusBlock label="access" value={authUser.email ? "login active" : "restricted"} />
            <StatusBlock label="proposal type" value="reverse offer" />
          </div>
        </section>

        {!authUser.checked ? (
          <div className="border-x border-b border-[var(--color-carbon)] p-12 text-center text-[var(--color-muted)]">
            접근 권한을 확인하는 중입니다.
          </div>
        ) : !authUser.email ? (
          <section className="border-x border-b border-[var(--color-carbon)] p-8 text-center">
            <p className="eyebrow">restricted prototype</p>
            <h2 className="type-section mt-6" data-display="true">
              병원 센터는 로그인이 필요합니다
            </h2>
            <p className="mx-auto mt-5 max-w-xl type-copy">
              지금은 프로토타입이라 로그인 여부만 확인합니다. 운영 버전에서는 병원 role, 관리자 role, 승인 상태를 나눠 요청 접근 범위를 제한합니다.
            </p>
            <button onClick={handleKakaoLogin} className="action-primary mt-8">
              카카오로 로그인
            </button>
          </section>
        ) : loading ? (
          <div className="border-x border-b border-[var(--color-carbon)] p-12 text-center text-[var(--color-muted)]">
            요청서를 불러오는 중입니다.
          </div>
        ) : requests.length === 0 ? (
          <section className="border-x border-b border-[var(--color-carbon)] p-8 text-center">
            <p className="eyebrow">empty board</p>
            <h2 className="type-section mt-6" data-display="true">
              현재 열린 요청이 없습니다
            </h2>
            <p className="mx-auto mt-5 max-w-xl type-copy">
              사용자가 견적 요청을 등록하면 이곳에 요청 카드가 쌓이고, 병원은 요청을 선택해 역제안을 보낼 수 있습니다.
            </p>
          </section>
        ) : (
          <section className="grid border-x border-b border-[var(--color-carbon)] xl:grid-cols-[420px_1fr]">
            <aside className="border-b border-[var(--color-carbon)] xl:border-b-0 xl:border-r">
              <div className="border-b border-[var(--color-carbon)] p-5">
                <p className="eyebrow">request board</p>
                <h2 className="mt-5 text-[1.7rem] font-normal" data-display="true">
                  열린 요청
                </h2>
              </div>

              <div className="max-h-[820px] overflow-y-auto">
                {requests.map((request) => {
                  const isSelected = selectedRequest?.id === request.id;

                  return (
                    <button
                      key={request.id}
                      onClick={() => setSelectedRequestId(request.id)}
                      className={`block w-full border-b border-[var(--color-line)] p-5 text-left hover:bg-[var(--color-carbon)] hover:text-[var(--color-ghost-white)] ${
                        isSelected ? "bg-[var(--color-carbon)] text-[var(--color-ghost-white)]" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[11px] uppercase tracking-[0.22em] opacity-60">
                          #{request.id}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] opacity-60">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-6 text-[1.45rem] font-normal leading-tight" data-display="true">
                        {request.category}
                      </h3>
                      <p className="mt-3 text-[14px] font-semibold">예산 {formatPrice(request.budget)}</p>
                      <p className="mt-4 line-clamp-3 text-[13px] leading-6 opacity-70">{request.symptom}</p>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selectedRequest ? (
              <RequestProposalPanel
                request={selectedRequest}
                values={bidInputs[selectedRequest.id] || emptyBidState}
                onChange={handleInputChange}
                onSubmit={submitBid}
              />
            ) : null}
          </section>
        )}
      </main>
    </div>
  );
}

function RequestProposalPanel({
  request,
  values,
  onChange,
  onSubmit,
}: {
  request: RequestRecord;
  values: BidFormState;
  onChange: (requestId: number, field: keyof BidFormState, value: string) => void;
  onSubmit: (requestId: number) => void;
}) {
  return (
    <div className="grid min-h-[820px] xl:grid-cols-[0.92fr_1.08fr]">
      <section className="border-b border-[var(--color-carbon)] p-5 sm:p-7 xl:border-b-0 xl:border-r">
        <p className="eyebrow">selected request</p>
        <h2 className="mt-7 text-[2.4rem] font-normal leading-tight" data-display="true">
          {request.category}
          <br />
          {formatPrice(request.budget)}
        </h2>

        <div className="mt-8 grid gap-5">
          <Info label="요청 번호" value={`#${request.id}`} />
          <Info label="고객 이메일" value={request.user_email} />
          <Info label="선호 지역" value={request.preferred_area || "미정"} />
          <Info label="요청일" value={new Date(request.created_at).toLocaleDateString()} />
        </div>

        <div className="mt-8 border border-[var(--color-carbon)] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted-light)]">customer note</p>
          <p className="mt-5 text-[14px] leading-7 text-[var(--color-muted)]">{request.symptom}</p>
        </div>
      </section>

      <section className="p-5 sm:p-7">
        <p className="eyebrow">write reverse offer</p>
        <h2 className="mt-7 text-[2.1rem] font-normal leading-tight" data-display="true">
          이 요청에 맞는
          <br />
          병원 제안을 작성합니다
        </h2>
        <p className="mt-5 type-copy">
          가격만 입력하는 구조가 아니라, 왜 이 조합이 맞는지와 예약 안내까지 함께 작성해야 고객이 병원을 비교할 수 있습니다.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_180px]">
          <input
            type="text"
            placeholder="병원 이름"
            className="field"
            value={values.hospital_name}
            onChange={(event) => onChange(request.id, "hospital_name", event.target.value)}
          />
          <input
            type="number"
            placeholder="가격(만원)"
            className="field"
            value={values.price}
            onChange={(event) => onChange(request.id, "price", event.target.value)}
          />
        </div>

        <div className="mt-6 space-y-6">
          <input
            type="text"
            placeholder="추천 시술 조합, 예: 울쎄라 300샷 + 리쥬란"
            className="field"
            value={values.recommended_plan}
            onChange={(event) => onChange(request.id, "recommended_plan", event.target.value)}
          />
          <textarea
            placeholder="제안 이유, 예: 예산 안에서 턱선 체감이 있으면서 다운타임 부담이 적은 조합입니다."
            className="field min-h-[120px] resize-none"
            value={values.reason}
            onChange={(event) => onChange(request.id, "reason", event.target.value)}
          />
          <textarea
            placeholder="예약 안내, 예: 상담 후 당일 진행 가능하며 원하는 시간대를 남겨주세요."
            className="field min-h-[100px] resize-none"
            value={values.reservation}
            onChange={(event) => onChange(request.id, "reservation", event.target.value)}
          />
        </div>

        <button onClick={() => onSubmit(request.id)} className="action-primary mt-8 w-full">
          이 요청에 제안서 전송
        </button>
      </section>
    </div>
  );
}

function StatusBlock({ label, value }: { label: string; value: string }) {
  return (
    <article className="min-h-[180px] border-b border-[var(--color-line)] p-5 sm:border-r sm:even:border-r-0 sm:p-7">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted-light)]">{label}</p>
      <p className="mt-8 text-[1.45rem] font-normal leading-tight" data-display="true">
        {value}
      </p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted-light)]">{label}</p>
      <p className="mt-2 text-[14px] font-semibold">{value}</p>
    </div>
  );
}

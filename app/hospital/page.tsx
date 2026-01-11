"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Request {
  id: number;
  user_email: string;
  category: string;
  budget: number;
  preferred_area: string;
  symptom: string;
  created_at: string;
}

export default function HospitalPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // 입찰 입력 상태 관리 (어떤 요청에 대해 쓰고 있는지)
  const [bidInputs, setBidInputs] = useState<{ [key: number]: { price: string; comment: string; hospital_name: string } }>({});

  // 1. 고객의 견적 요청 목록 불러오기
  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("status", "open") // '진행중'인 건만 가져오기
        .order("created_at", { ascending: false });

      if (data) setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  // 입력값 처리
  const handleInputChange = (id: number, field: string, value: string) => {
    setBidInputs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // 2. 제안서(입찰) 보내기
  const submitBid = async (reqId: number) => {
    const input = bidInputs[reqId];
    if (!input?.hospital_name || !input?.price || !input?.comment) {
      alert("병원명, 제안 가격, 코멘트를 모두 입력해주세요!");
      return;
    }

    const { error } = await supabase.from("bids").insert([
      {
        request_id: reqId,
        hospital_name: input.hospital_name,
        price: Number(input.price),
        comment: input.comment,
      },
    ]);

    if (error) {
      alert("제안 전송 실패 😭");
      console.error(error);
    } else {
      alert("✅ 제안서가 고객님께 전송되었습니다!");
      // 입력창 초기화
      setBidInputs((prev) => ({ ...prev, [reqId]: { ...prev[reqId], price: "", comment: "" } }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-2xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-slate-800">
          🏥 Tangle 파트너 센터
        </h1>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
          원장님 전용
        </span>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-10">요청서를 불러오는 중... ⏳</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            현재 들어온 견적 요청이 없습니다.
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
              {/* 고객 요청 내용 */}
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded text-xs font-bold">
                    {req.category}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  희망 지역: {req.preferred_area} / 예산: {req.budget}만원
                </h3>
                <p className="text-gray-600 text-sm bg-white p-3 rounded-lg border border-slate-200 mt-3">
                  "{req.symptom}"
                </p>
              </div>

              {/* 병원 입찰 양식 */}
              <div className="p-6 bg-white">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  💬 제안서 보내기
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="병원 이름"
                      className="flex-1 border p-2 rounded-lg text-sm"
                      onChange={(e) => handleInputChange(req.id, "hospital_name", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="제안 가격(만원)"
                      className="w-24 border p-2 rounded-lg text-sm"
                      value={bidInputs[req.id]?.price || ""}
                      onChange={(e) => handleInputChange(req.id, "price", e.target.value)}
                    />
                  </div>
                  <textarea
                    placeholder="예: 원장 직접 시술입니다. 진정 관리 서비스로 넣어드릴게요."
                    className="w-full border p-2 rounded-lg text-sm h-20"
                    value={bidInputs[req.id]?.comment || ""}
                    onChange={(e) => handleInputChange(req.id, "comment", e.target.value)}
                  />
                  <button
                    onClick={() => submitBid(req.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    제안서 발송 🚀
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Bid {
  id: number;
  hospital_name: string;
  price: number;
  comment: string;
  created_at: string;
}

interface Request {
  id: number;
  category: string;
  symptom: string;
  budget: number;
  created_at: string;
  bids: Bid[]; // 요청서 안에 제안서들이 들어있는 구조
}

export default function MyPage() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  // 이메일로 내 요청 내역 조회하기
  const handleCheck = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1. 요청서(requests)와 그에 달린 제안서(bids)를 한 번에 가져오기
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        bids (*)
      `)
      .eq("user_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      alert("데이터를 불러오지 못했어요 😭");
      console.error(error);
    } else {
      if (data.length === 0) {
        alert("등록된 요청 내역이 없습니다.");
      } else {
        setMyRequests(data);
        setIsLoggedIn(true); // 조회 성공 시 화면 전환
      }
    }
    setLoading(false);
  };

  const handleSelectBid = (hospitalName: string) => {
    alert(`🎉 축하합니다! '${hospitalName}'와 매칭되었습니다.\n병원에서 곧 연락을 드릴 예정입니다.`);
  };

  // 1. 조회 전 화면 (이메일 입력)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">내 견적 확인하기 📮</h1>
          <p className="text-gray-500 text-center mb-6">견적 요청 시 입력했던 이메일을 적어주세요.</p>
          <form onSubmit={handleCheck} className="space-y-4">
            <input
              type="email"
              placeholder="example@naver.com"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-pink-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl transition-all"
            >
              {loading ? "조회 중..." : "도착한 견적 확인하기"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. 조회 후 화면 (리스트)
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <nav className="w-full max-w-md mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">받은 제안함 📬</h1>
        <button onClick={() => setIsLoggedIn(false)} className="text-sm text-gray-500 underline">
          로그아웃
        </button>
      </nav>

      <main className="w-full max-w-md space-y-8">
        {myRequests.map((req) => (
          <div key={req.id} className="border-b-2 border-dashed border-gray-200 pb-8 last:border-0">
            {/* 내 요청 내용 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold mb-2 inline-block">
                내가 보낸 요청
              </span>
              <h2 className="font-bold text-lg text-gray-900">
                {req.category} (예산 {req.budget}만원)
              </h2>
              <p className="text-gray-500 text-sm mt-1">{req.symptom}</p>
            </div>

            {/* 병원들의 제안 목록 */}
            <h3 className="font-bold text-gray-700 mb-3 ml-1 flex items-center gap-2">
              👇 병원 도착 제안 ({req.bids.length}건)
            </h3>
            
            {req.bids.length === 0 ? (
              <div className="text-center py-6 bg-gray-100 rounded-xl text-gray-400 text-sm">
                아직 도착한 제안이 없습니다. 조금만 기다려주세요!
              </div>
            ) : (
              <div className="space-y-3">
                {req.bids.map((bid) => (
                  <div key={bid.id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-pink-500 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{bid.hospital_name}</h4>
                      <span className="text-pink-600 font-extrabold text-lg">{bid.price}만원</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                      "{bid.comment}"
                    </p>
                    <button 
                      onClick={() => handleSelectBid(bid.hospital_name)}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors"
                    >
                      이 제안으로 예약하기 ✅
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
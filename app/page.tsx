import Link from "next/link";

export default function Home() {
  // 아이콘과 색상은 그대로 유지
  const categories = [
    { name: "리프팅", desc: "울쎄라, 써마지 등", icon: "💆‍♀️", color: "bg-pink-50 text-pink-500" },
    { name: "스킨부스터", desc: "리쥬란, 쥬베룩 등", icon: "💉", color: "bg-blue-50 text-blue-500" },
    { name: "보톡스", desc: "주름, 윤곽 개선", icon: "✨", color: "bg-yellow-50 text-yellow-600" }, // DB 카테고리 이름과 일치시킴 (보톡스/필러 -> 보톡스)
    { name: "관리", desc: "LDM, 진정 관리", icon: "💎", color: "bg-purple-50 text-purple-500" }, // DB 이름과 일치 (기타 관리 -> 관리)
    { name: "모공or흉터", desc: "매끈한 피부결", icon: "🌿", color: "bg-green-50 text-green-500" },
    { name: "제모", desc: "깔끔한 정리", icon: "🧴", color: "bg-gray-50 text-gray-500" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6">
      <header className="w-full max-w-md flex justify-between items-center py-4 mb-2">
        <h1 className="text-2xl font-extrabold text-pink-500">Tangle</h1>
        <span className="text-gray-400 text-sm">로그인</span>
      </header>

      <main className="w-full max-w-md flex flex-col gap-6">
        <section className="text-center py-8">
          <p className="text-pink-500 font-bold mb-2">나만의 미용 에이전트</p>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
            실패 없는 피부 시술,<br />
            탱글에서 시작하세요.
          </h2>
          <p className="text-gray-500 text-sm">
            내 고민, 예산, 나이에 딱 맞는<br />
            최적의 시술 조합을 찾아드립니다.
          </p>
        </section>

        <Link href="/recommend" className="w-full">
          <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
            🔍 AI 맞춤 시술 찾기
          </button>
        </Link>

        <section className="mt-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">시술 정보 찾아보기</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              // ★ 여기를 Link로 감싸서 클릭하면 이동하게 변경했습니다!
              <Link href={`/category/${cat.name}`} key={cat.name} className="block">
                <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer bg-white h-full">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl mb-3 ${cat.color}`}>
                    {cat.icon}
                  </div>
                  <h4 className="font-bold text-gray-900">{cat.name}</h4>
                  <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
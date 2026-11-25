import type { Metadata } from "next";
import SiteHeader from "../components/사이트헤더";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "탱글이 어떤 개인정보를 왜 받고, 얼마나 보관하며, 누구에게 맡기는지 안내합니다.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "2026년 11월 25일";

const sections: { title: string; body: (string | string[])[] }[] = [
  {
    title: "1. 받는 정보와 이유",
    body: [[
      "검증 병원 신청: 병원명, 원장 이름, 전문과목, 병원 주소, 담당자 이름·연락처·이메일, 원장님 자기신고 내용 — 검증 심사와 연락을 위해 받아요.",
      "로그인(견적 기능 사용 시): 이메일 주소 — 본인 확인과 요청 관리를 위해 받아요.",
      "AI 기능(상담 도우미·질문지·후기 필터·번역)에 입력한 글: 답변을 만드는 데만 쓰고, 탱글 서버에 저장하지 않아요.",
      "후기 사진 검사: 사진은 이용자 기기 안에서만 읽어요. 이용자가 따로 동의한 경우에만 작게 줄인 사진 1장을 AI 분석에 보내고, 저장하지 않아요.",
      "기기 저장: 저장한 추천 항목·언어 설정·체크리스트는 이용자 기기(브라우저)에만 남고 탱글로 보내지 않아요.",
    ]],
  },
  {
    title: "2. 보관 기간과 파기",
    body: [
      "검증 병원 신청 정보는 심사가 끝난 날부터 1년 동안 보관한 뒤 지워요. 로그인 정보는 탈퇴하면 바로 지워요. 법령에서 따로 보관을 요구하면 그 기간만큼 보관해요.",
      "전자 파일은 되살릴 수 없는 방법으로 지우고, 종이 서류는 분쇄해요.",
    ],
  },
  {
    title: "3. 맡기는 곳과 해외 이전",
    body: [[
      "OpenAI (미국) — AI 답변·번역·사진 분석. 입력 내용과 동의한 사진이 답변을 만드는 순간 미국으로 전송되며, OpenAI 정책에 따라 오남용 감시를 위해 최대 30일 보관 후 삭제돼요.",
      "Supabase — 로그인과 검증 신청 정보 저장(데이터베이스).",
      "Vercel (미국) — 웹사이트 호스팅.",
    ],
    "해외 이전을 원하지 않으면 AI 기능과 사진 AI 분석을 쓰지 않으면 돼요. 나머지 기능은 그대로 쓸 수 있어요.",
    ],
  },
  {
    title: "4. 이용자의 권리",
    body: ["언제든 내 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있어요. 아래 연락처로 요청하면 지체 없이 처리할게요. 만 14세 미만 아동의 정보는 받지 않아요."],
  },
  {
    title: "5. 안전하게 지키는 방법",
    body: ["모든 통신은 암호화(HTTPS)해요. 신청 정보는 외부에서 읽을 수 없게 막아 두고(쓰기만 허용), 담당자만 볼 수 있어요. 다른 사이트에서 탱글 기능을 몰래 호출하지 못하게 막고, 짧은 시간에 지나치게 많이 쓰면 제한해요."],
  },
  {
    title: "6. 개인정보 보호책임자",
    body: ["탱글 운영팀이 개인정보 관련 문의와 불만을 맡아요. 문의는 탱글 카카오톡 채널로 보내 주세요. 개인정보 침해 신고는 개인정보침해신고센터(국번 없이 118)에도 할 수 있어요."],
  },
  {
    title: "7. 바뀔 때",
    body: [`이 방침이 바뀌면 시행 7일 전에 이 페이지로 알려 드려요. 시행일: ${EFFECTIVE}`],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pb-28">
      <SiteHeader />
      <article className="shell max-w-3xl pt-10 sm:pt-14">
        <p className="eyebrow mb-5"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />탱글</p>
        <h1 className="type-section">개인정보처리방침</h1>
        <p className="mt-4 text-[15px] leading-7 text-[var(--color-muted)]">탱글은 꼭 필요한 정보만 받고, 받은 이유 외에는 쓰지 않아요.</p>
        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[18px] font-bold text-[var(--color-carbon)]">{section.title}</h2>
              {section.body.map((block, index) => Array.isArray(block)
                ? <ul key={index} className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[#4d5c52]">{block.map((line) => <li key={line}>{line}</li>)}</ul>
                : <p key={index} className="mt-3 text-[15px] leading-7 text-[#4d5c52]">{block}</p>)}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}

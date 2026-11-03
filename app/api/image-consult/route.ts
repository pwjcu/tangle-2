import { NextResponse } from "next/server";

/** Photo analysis stays disabled until its external processing scope is separately approved. */
export async function POST() {
  return NextResponse.json({
    reply: "사진 분석은 현재 제공하지 않습니다. 사진을 외부 AI로 전송하지 않으며, 시술명·가격·병원 경험추천은 텍스트 정보검색에서 확인할 수 있습니다.",
    code: "IMAGE_ANALYSIS_DISABLED",
  }, { status: 503 });
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { SupportedLanguage } from "../lib/i18n";
import { displayCategoryName, treatmentCategories } from "../lib/siteContent";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./components/LanguageProvider";

const homeContent: Record<
  SupportedLanguage,
  {
    brand: string;
    heroEyebrow: string;
    heroTitle: string[];
    heroBody: string;
    primaryCta: string;
    secondaryCta: string;
    helper: string;
    imageAlt: string;
    metrics: { label: string; value: string; body: string }[];
    decisionEyebrow: string;
    decisionTitle: string;
    decisionBody: string;
    steps: { label: string; title: string; body: string }[];
    audiences: { title: string; body: string; href: string; cta: string; tone: "yellow" | "violet" | "porcelain" }[];
    categoryEyebrow: string;
    categoryTitle: string[];
    categoryBody: string;
    clinicEyebrow: string;
    clinicTitle: string[];
    clinicBody: string;
    clinicBenefits: string[];
  }
> = {
  ko: {
    brand: "Tangle: 관리가 최고의 재테크다",
    heroEyebrow: "beauty connect infrastructure",
    heroTitle: ["나에게 가장 필요한", "시술 정보안내와", "병원 제안 받기"],
    heroBody:
      "탱글은 시술 정보 탐색, 개인 맞춤 추천, 견적 요청, 병원 역제안을 하나의 흐름으로 연결, 소비자의 선택피로도를 감소시키고 병원의 상담시간과 홍보비용을 줄이며 재방문율을 높입니다.",
    primaryCta: "추천 시작",
    secondaryCta: "견적 요청하기",
    helper: "정보 탐색, 추천, 견적 요청, 병원 제안까지 이어주는 해결사",
    imageAlt: "카메라로 얼굴을 업로드하고 고민 부위를 표시한 뒤 병원에게만 공개하는 탱글 기능 안내",
    metrics: [
      { label: "개인화 추천", value: "5단계", body: "고민, 예산, 나이대, 목표, 다운타임 기준" },
      { label: "시술 카테고리", value: `${treatmentCategories.length}개`, body: "리프팅부터 제모, 항노화 관리까지" },
      { label: "병원 연결", value: "역제안", body: "추천 이유, 시술 조합, 예약 안내 비교" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "시술이 처음이라도 안심하세요",
    decisionBody: "탱글이 신뢰를 바탕으로 꼭 필요한 곳으로 연결 시켜드립니다.",
    steps: [
      { label: "01", title: "정보 입력", body: "고민, 예산, 나이대, 원하는 결과, 회복 가능 시간을 짧게 입력합니다." },
      { label: "02", title: "AI 맞춤 추천", body: "입력한 조건을 바탕으로 필요한 시술 후보와 가격대를 좁혀줍니다." },
      { label: "03", title: "견적 요청", body: "병원이 바로 이해할 수 있는 요청서로 바꿔 반복 상담을 줄입니다." },
      { label: "04", title: "병원 역제안", body: "병원은 고객에게 맞는 시술 조합과 예약 안내를 제안합니다." },
    ],
    audiences: [
      {
        title: "시술이 처음인 고객",
        body: "시술명을 몰라도 고민과 예산에서 시작해 필요한 정보와 병원 제안을 받을 수 있습니다.",
        href: "/recommend",
        cta: "추천 받아보기",
        tone: "yellow",
      },
      {
        title: "고객을 선별하고 싶은 병원",
        body: "상담 전에 고객의 고민, 예산, 지역, 원하는 결과를 먼저 확인하고 맞는 고객에게만 제안합니다.",
        href: "/hospital",
        cta: "요청 보드 보기",
        tone: "violet",
      },
      {
        title: "한국 시술을 찾는 해외 고객",
        body: "영어, 중국어, 일본어, 태국어 상담 흐름으로 글로벌 환자 연결까지 확장합니다.",
        href: "/request",
        cta: "견적 요청하기",
        tone: "porcelain",
      },
    ],
    categoryEyebrow: "category index",
    categoryTitle: ["시술 카테고리", "한눈에 보기"],
    categoryBody: "리프팅, 스킨부스터, 보톡스, 색소/레이저, 모공/흉터, 제모처럼 사용자가 실제로 찾는 기준으로 정리했습니다.",
    clinicEyebrow: "clinic side",
    clinicTitle: ["23조 시장,", "국내외 소비자에게 신뢰를 확보하고 재방문을 유도하세요."],
    clinicBody:
      "탱글은 상담 전 고객의 고민과 예산을 구조화해 병원의 반복 상담을 줄이고, 관심 고객에게 맞춤 제안을 보내는 새로운 유입 채널이 됩니다.",
    clinicBenefits: ["상담 전 고객 고민과 예산을 먼저 확인", "핏이 맞는 고객에게만 시술 조합 제안", "국내외 신규 고객 유입과 재방문 관리"],
  },
  en: {
    brand: "Tangle: smarter beauty care",
    heroEyebrow: "beauty connect infrastructure",
    heroTitle: ["Find the treatment", "information you need", "and get clinic offers"],
    heroBody:
      "Tangle connects treatment research, personalized recommendations, quote requests, and clinic proposals in one flow, reducing decision fatigue for consumers and repeated consultation work for clinics.",
    primaryCta: "Start matching",
    secondaryCta: "Request quote",
    helper: "From research and recommendations to quote requests and clinic offers.",
    imageAlt: "Tangle feature preview showing face upload, concern marking, and clinic-only sharing.",
    metrics: [
      { label: "Personal match", value: "5 steps", body: "Concern, budget, age range, goal, and downtime" },
      { label: "Treatment categories", value: `${treatmentCategories.length}`, body: "From lifting to hair removal and anti-aging care" },
      { label: "Clinic connection", value: "Offers", body: "Compare reasons, plans, and booking guidance" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "New to treatments? Start with confidence.",
    decisionBody: "Tangle helps you move toward the clinic options that actually fit your needs.",
    steps: [
      { label: "01", title: "Enter details", body: "Share your concern, budget, age range, desired result, and available recovery time." },
      { label: "02", title: "AI matching", body: "Your inputs narrow down suitable treatment candidates and price ranges." },
      { label: "03", title: "Request quote", body: "Tangle turns your needs into a clear request clinics can understand quickly." },
      { label: "04", title: "Clinic offers", body: "Clinics suggest treatment combinations and booking guidance that fit your case." },
    ],
    audiences: [
      {
        title: "First-time clients",
        body: "Start from your concern and budget even if you do not know treatment names.",
        href: "/recommend",
        cta: "Get matched",
        tone: "yellow",
      },
      {
        title: "Clinics seeking fit",
        body: "Review concerns, budget, location, and goals before sending a tailored offer.",
        href: "/hospital",
        cta: "View requests",
        tone: "violet",
      },
      {
        title: "Global clients in Korea",
        body: "English, Chinese, Japanese, and Thai flows help connect international patients.",
        href: "/request",
        cta: "Request quote",
        tone: "porcelain",
      },
    ],
    categoryEyebrow: "category index",
    categoryTitle: ["Treatment categories", "at a glance"],
    categoryBody: "We organize treatments around how people actually search: lifting, boosters, Botox, pigment lasers, pores/scars, and hair removal.",
    clinicEyebrow: "clinic side",
    clinicTitle: ["A large beauty market,", "with better trust and repeat visits."],
    clinicBody:
      "Tangle structures client concerns and budgets before consultation, reducing repeated explanations and creating a better acquisition channel.",
    clinicBenefits: ["Check concerns and budget before consultation", "Send offers only to clients who fit", "Grow domestic and international repeat visits"],
  },
  zh: {
    brand: "Tangle：更聪明的美容管理",
    heroEyebrow: "beauty connect infrastructure",
    heroTitle: ["找到真正需要的", "项目信息", "并获得医院提案"],
    heroBody: "Tangle 将项目信息、个性化推荐、报价请求和医院反向提案整合到一个流程中，减少用户选择疲劳，也减少医院重复咨询时间。",
    primaryCta: "开始推荐",
    secondaryCta: "申请报价",
    helper: "从信息搜索、推荐、报价请求到医院提案，一次连接。",
    imageAlt: "Tangle 功能预览：上传面部照片、标记关注部位，并仅向医院公开。",
    metrics: [
      { label: "个性化推荐", value: "5步", body: "烦恼、预算、年龄段、目标、恢复时间" },
      { label: "项目类别", value: `${treatmentCategories.length}个`, body: "从提升、脱毛到抗老管理" },
      { label: "医院连接", value: "反向提案", body: "比较推荐理由、项目组合和预约说明" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "第一次做项目也可以安心开始",
    decisionBody: "Tangle 基于你的需求，帮助你连接更合适的医院选择。",
    steps: [
      { label: "01", title: "填写信息", body: "简单输入烦恼、预算、年龄段、想要的效果和可接受恢复时间。" },
      { label: "02", title: "AI 推荐", body: "根据输入条件缩小适合的项目候选和价格范围。" },
      { label: "03", title: "申请报价", body: "把需求整理成医院容易理解的请求，减少重复咨询。" },
      { label: "04", title: "医院提案", body: "医院提供适合你的项目组合和预约说明。" },
    ],
    audiences: [
      { title: "第一次做项目的用户", body: "即使不知道项目名称，也可以从烦恼和预算开始获得推荐。", href: "/recommend", cta: "获取推荐", tone: "yellow" },
      { title: "想筛选客户的医院", body: "咨询前先确认用户烦恼、预算、地区和目标，再发送合适提案。", href: "/hospital", cta: "查看请求", tone: "violet" },
      { title: "寻找韩国项目的海外用户", body: "支持英语、中文、日语、泰语咨询流程，扩展全球患者连接。", href: "/request", cta: "申请报价", tone: "porcelain" },
    ],
    categoryEyebrow: "category index",
    categoryTitle: ["项目类别", "一目了然"],
    categoryBody: "按照用户真实搜索方式整理：提升、皮肤水光/再生、肉毒、色素/激光、毛孔/痘疤、脱毛等。",
    clinicEyebrow: "clinic side",
    clinicTitle: ["大型美容市场，", "用信任连接国内外消费者并提升复诊。"],
    clinicBody: "Tangle 在咨询前结构化用户烦恼和预算，减少医院重复沟通，并成为新的获客渠道。",
    clinicBenefits: ["咨询前先确认用户烦恼和预算", "只向匹配的用户发送项目组合", "扩大国内外新客和复诊管理"],
  },
  ja: {
    brand: "Tangle：美容ケアをもっと賢く",
    heroEyebrow: "beauty connect infrastructure",
    heroTitle: ["必要な施術情報を", "整理して", "クリニック提案まで"],
    heroBody:
      "Tangle は施術情報、個別推薦、見積依頼、クリニックからの提案を一つの流れでつなぎ、ユーザーの迷いとクリニックの相談負担を減らします。",
    primaryCta: "推薦を始める",
    secondaryCta: "見積依頼",
    helper: "情報探索、推薦、見積依頼、クリニック提案までつなげます。",
    imageAlt: "顔写真をアップロードし、悩みの部位を示してクリニックに共有するTangle機能の案内。",
    metrics: [
      { label: "個別推薦", value: "5段階", body: "悩み、予算、年齢層、目的、ダウンタイム基準" },
      { label: "施術カテゴリ", value: `${treatmentCategories.length}個`, body: "リフトアップから脱毛、アンチエイジング管理まで" },
      { label: "クリニック連携", value: "提案", body: "理由、施術組み合わせ、予約案内を比較" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "初めての施術でも安心して始められます",
    decisionBody: "Tangle が必要な情報を整理し、合うクリニック選びをサポートします。",
    steps: [
      { label: "01", title: "情報入力", body: "悩み、予算、年齢層、希望する結果、回復可能時間を簡単に入力します。" },
      { label: "02", title: "AI 推薦", body: "入力条件に基づいて施術候補と価格帯を絞ります。" },
      { label: "03", title: "見積依頼", body: "クリニックが理解しやすい依頼内容に変換します。" },
      { label: "04", title: "クリニック提案", body: "クリニックが施術プランと予約案内を提案します。" },
    ],
    audiences: [
      { title: "初めて施術を受ける方", body: "施術名を知らなくても、悩みと予算から必要な情報を受け取れます。", href: "/recommend", cta: "推薦を見る", tone: "yellow" },
      { title: "相性の良い顧客を探すクリニック", body: "相談前に悩み、予算、地域、目的を確認して提案できます。", href: "/hospital", cta: "依頼を見る", tone: "violet" },
      { title: "韓国施術を探す海外顧客", body: "英語、中国語、日本語、タイ語の相談導線で海外患者にも対応します。", href: "/request", cta: "見積依頼", tone: "porcelain" },
    ],
    categoryEyebrow: "category index",
    categoryTitle: ["施術カテゴリ", "一覧で確認"],
    categoryBody: "リフトアップ、スキンブースター、ボトックス、色素/レーザー、毛穴/傷跡、脱毛など、実際の検索基準で整理しました。",
    clinicEyebrow: "clinic side",
    clinicTitle: ["大きな美容市場で、", "信頼と再来院を生み出しましょう。"],
    clinicBody: "Tangle は相談前に顧客の悩みと予算を構造化し、繰り返し相談を減らす新しい流入チャネルになります。",
    clinicBenefits: ["相談前に悩みと予算を確認", "相性の良い顧客にだけ提案", "国内外の新規顧客と再来院を管理"],
  },
  th: {
    brand: "Tangle: ดูแลความงามอย่างชาญฉลาด",
    heroEyebrow: "beauty connect infrastructure",
    heroTitle: ["ค้นหาข้อมูลหัตถการ", "ที่เหมาะกับคุณ", "พร้อมรับข้อเสนอจากคลินิก"],
    heroBody:
      "Tangle รวมการค้นหาข้อมูล คำแนะนำเฉพาะบุคคล การขอราคา และข้อเสนอจากคลินิกไว้ในขั้นตอนเดียว ช่วยลดความลังเลของลูกค้าและลดเวลาปรึกษาซ้ำของคลินิก",
    primaryCta: "เริ่มแนะนำ",
    secondaryCta: "ขอใบเสนอราคา",
    helper: "ตั้งแต่ค้นหาข้อมูล แนะนำ ขอราคา ไปจนถึงข้อเสนอจากคลินิก",
    imageAlt: "ตัวอย่างฟีเจอร์ Tangle สำหรับอัปโหลดใบหน้า ทำเครื่องหมายจุดกังวล และแชร์ให้คลินิกเท่านั้น",
    metrics: [
      { label: "แนะนำเฉพาะบุคคล", value: "5 ขั้น", body: "ปัญหา งบประมาณ ช่วงอายุ เป้าหมาย และเวลาพักฟื้น" },
      { label: "หมวดหัตถการ", value: `${treatmentCategories.length}`, body: "ตั้งแต่ยกกระชับ กำจัดขน ถึงดูแลชะลอวัย" },
      { label: "เชื่อมต่อคลินิก", value: "ข้อเสนอ", body: "เทียบเหตุผล แผนหัตถการ และคำแนะนำการจอง" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "เริ่มได้อย่างมั่นใจ แม้เป็นครั้งแรก",
    decisionBody: "Tangle ช่วยจัดข้อมูลที่จำเป็นและพาคุณไปหาตัวเลือกคลินิกที่เหมาะกว่า",
    steps: [
      { label: "01", title: "กรอกข้อมูล", body: "ระบุปัญหา งบประมาณ ช่วงอายุ ผลลัพธ์ที่ต้องการ และเวลาพักฟื้นที่รับได้" },
      { label: "02", title: "AI แนะนำ", body: "ระบบช่วยคัดหัตถการและช่วงราคาที่เหมาะกับเงื่อนไขของคุณ" },
      { label: "03", title: "ขอราคา", body: "เปลี่ยนความต้องการให้เป็นคำขอที่คลินิกเข้าใจง่าย" },
      { label: "04", title: "ข้อเสนอคลินิก", body: "คลินิกเสนอชุดหัตถการและแนวทางการจองที่เหมาะกับคุณ" },
    ],
    audiences: [
      { title: "ลูกค้าที่ทำครั้งแรก", body: "แม้ไม่รู้ชื่อหัตถการ ก็เริ่มจากปัญหาและงบประมาณได้", href: "/recommend", cta: "รับคำแนะนำ", tone: "yellow" },
      { title: "คลินิกที่ต้องการลูกค้าที่ใช่", body: "ตรวจปัญหา งบ พื้นที่ และเป้าหมายก่อนส่งข้อเสนอ", href: "/hospital", cta: "ดูคำขอ", tone: "violet" },
      { title: "ลูกค้าต่างชาติที่สนใจเกาหลี", body: "รองรับการปรึกษาภาษาอังกฤษ จีน ญี่ปุ่น และไทย", href: "/request", cta: "ขอราคา", tone: "porcelain" },
    ],
    categoryEyebrow: "category index",
    categoryTitle: ["หมวดหัตถการ", "ดูได้ในที่เดียว"],
    categoryBody: "จัดตามสิ่งที่ผู้ใช้ค้นหาจริง เช่น ยกกระชับ สกินบูสเตอร์ โบท็อกซ์ เลเซอร์สีผิว รูขุมขน/รอยแผล และกำจัดขน",
    clinicEyebrow: "clinic side",
    clinicTitle: ["ตลาดความงามขนาดใหญ่", "สร้างความเชื่อใจและการกลับมาใช้บริการ"],
    clinicBody: "Tangle จัดโครงสร้างปัญหาและงบประมาณก่อนปรึกษา ช่วยลดการตอบซ้ำและสร้างช่องทางลูกค้าใหม่",
    clinicBenefits: ["ตรวจปัญหาและงบก่อนปรึกษา", "ส่งข้อเสนอให้ลูกค้าที่เหมาะจริง", "เพิ่มลูกค้าใหม่และการกลับมาใช้บริการทั้งในและต่างประเทศ"],
  },
};

const categoryCopy: Record<SupportedLanguage, Record<string, { name: string; examples: string }>> = {
  ko: {
    리프팅: { name: "리프팅", examples: "울쎄라, 써마지, 볼뉴머, 덴서티, 세르프, 리프테라2, 올리지오, 온다리프팅" },
    스킨부스터: { name: "스킨부스터", examples: "리쥬란, 쥬베룩, 리투오, 프로파일로, 쥬브아셀, 물광주사, 힐로웨이브" },
    보톡스: { name: "보톡스", examples: "이마 보톡스, 턱 보톡스, 스킨보톡스, 승모근 보톡스" },
    관리: { name: "관리", examples: "LDM, PDT, 여드름 스케일링, 수액, 크라이오, 고압산소치료" },
    "색소/레이저": { name: "색소/레이저", examples: "피코토닝, 레이저토닝, 혈관레이저, 루비레이저, 울트라클리어, 엔디야그" },
    모공흉터: { name: "모공/흉터", examples: "포텐자, 모피어스8, 울트라펄스, 아그네스, 골드PTT" },
    바디라인: { name: "바디라인", examples: "튠라이너, 지방분해주사, 바디 고주파, 윤곽주사" },
    제모: { name: "제모", examples: "젠틀맥스프로플러스, 클라리티, 아포지엘리트, 소프라노, 남성 수염 제모" },
  },
  en: {
    리프팅: { name: "Lifting", examples: "Ultherapy, Thermage, Volnewmer, Density, Shurink, Liftera 2, Oligio, Onda lifting" },
    스킨부스터: { name: "Skin boosters", examples: "Rejuran, Juvelook, R2O, Profhilo, Juveacell, water-glow injections" },
    보톡스: { name: "Botox", examples: "Forehead, jawline, skin Botox, trapezius Botox" },
    관리: { name: "Care", examples: "LDM, PDT, acne scaling, IV drips, cryo care, hyperbaric oxygen" },
    "색소/레이저": { name: "Pigment/laser", examples: "Pico toning, laser toning, vascular laser, ruby laser, UltraClear, Nd:YAG" },
    모공흉터: { name: "Pores/scars", examples: "Potenza, Morpheus8, UltraPulse, Agnes, Gold PTT" },
    바디라인: { name: "Body contour", examples: "Tune Liner, fat-dissolving injections, body RF, contour injections" },
    제모: { name: "Hair removal", examples: "GentleMax Pro Plus, Clarity, Apogee Elite, Soprano, men's beard removal" },
  },
  zh: {
    리프팅: { name: "提升", examples: "Ultherapy、Thermage、Volnewmer、Density、Shurink、Liftera 2、Oligio、Onda 提升" },
    스킨부스터: { name: "皮肤再生/水光", examples: "丽珠兰、Juvelook、R2O、Profhilo、Juveacell、水光针" },
    보톡스: { name: "肉毒", examples: "额头肉毒、下颌肉毒、皮肤肉毒、斜方肌肉毒" },
    관리: { name: "护理", examples: "LDM、PDT、痘痘清洁、点滴、冷冻护理、高压氧" },
    "색소/레이저": { name: "色素/激光", examples: "Pico toning、激光净肤、血管激光、红宝石激光、UltraClear、Nd:YAG" },
    모공흉터: { name: "毛孔/痘疤", examples: "Potenza、Morpheus8、UltraPulse、Agnes、Gold PTT" },
    바디라인: { name: "身体线条", examples: "Tune Liner、溶脂针、身体射频、轮廓针" },
    제모: { name: "脱毛", examples: "GentleMax Pro Plus、Clarity、Apogee Elite、Soprano、男士胡须脱毛" },
  },
  ja: {
    리프팅: { name: "リフトアップ", examples: "ウルセラ、サーマジ、ボルニューマ、デンシティ、シュリンク、リフテラ2、オリジオ、オンダ" },
    스킨부스터: { name: "スキンブースター", examples: "リジュラン、ジュベルック、R2O、プロファイロ、ジュブアセル、水光注射" },
    보톡스: { name: "ボトックス", examples: "額、あご、スキンボトックス、僧帽筋ボトックス" },
    관리: { name: "ケア", examples: "LDM、PDT、ニキビスケーリング、点滴、クライオ、高圧酸素" },
    "색소/레이저": { name: "色素/レーザー", examples: "ピコトーニング、レーザートーニング、血管レーザー、ルビーレーザー、UltraClear、Nd:YAG" },
    모공흉터: { name: "毛穴/傷跡", examples: "ポテンツァ、モフィウス8、ウルトラパルス、アグネス、Gold PTT" },
    바디라인: { name: "ボディライン", examples: "チューンライナー、脂肪分解注射、ボディRF、輪郭注射" },
    제모: { name: "脱毛", examples: "GentleMax Pro Plus、Clarity、Apogee Elite、Soprano、男性ひげ脱毛" },
  },
  th: {
    리프팅: { name: "ยกกระชับ", examples: "Ultherapy, Thermage, Volnewmer, Density, Shurink, Liftera 2, Oligio, Onda" },
    스킨부스터: { name: "สกินบูสเตอร์", examples: "Rejuran, Juvelook, R2O, Profhilo, Juveacell, ฉีดผิวฉ่ำ" },
    보톡스: { name: "โบท็อกซ์", examples: "หน้าผาก กราม สกินโบท็อกซ์ โบท็อกซ์บ่า" },
    관리: { name: "ดูแลผิว", examples: "LDM, PDT, กดสิว/สเกลลิ่ง, วิตามิน IV, ไครโอ, ออกซิเจนแรงดันสูง" },
    "색소/레이저": { name: "เม็ดสี/เลเซอร์", examples: "Pico toning, laser toning, vascular laser, ruby laser, UltraClear, Nd:YAG" },
    모공흉터: { name: "รูขุมขน/รอยแผล", examples: "Potenza, Morpheus8, UltraPulse, Agnes, Gold PTT" },
    바디라인: { name: "รูปร่าง", examples: "Tune Liner, ฉีดสลายไขมัน, RF ลำตัว, ฉีดปรับกรอบ" },
    제모: { name: "กำจัดขน", examples: "GentleMax Pro Plus, Clarity, Apogee Elite, Soprano, กำจัดหนวดผู้ชาย" },
  },
};

const kakaoChannelUrl = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "";

export default function Home() {
  const { language, t } = useLanguage();
  const content = homeContent[language];
  const localizedCategory = categoryCopy[language];
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email ?? null);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleKakaoLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(`로그인에 실패했어요. ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleKakaoChannelOpen = () => {
    if (!kakaoChannelUrl) {
      alert("카카오 채널 URL이 아직 연결되지 않았어요. Vercel 환경변수 NEXT_PUBLIC_KAKAO_CHANNEL_URL에 채널 링크를 넣으면 바로 연결됩니다.");
    }
  };

  return (
    <div className="pb-12">
      <header className="sticky top-2 z-30 sm:top-4">
        <div className="shell">
          <div className="flex min-h-[56px] flex-wrap items-center justify-between gap-2 rounded-[30px] border border-[rgba(32,34,31,0.07)] bg-white/50 px-3 py-3 shadow-[0_18px_60px_rgba(32,34,31,0.07)] backdrop-blur-2xl sm:min-h-[64px] sm:rounded-full sm:bg-white/68 sm:px-4 sm:py-2">
            <Link href="/" className="flex items-center gap-2 rounded-full px-1.5 py-1.5 sm:gap-3 sm:px-2 sm:py-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-sky-violet)] text-[12px] font-semibold text-[var(--color-carbon)] sm:h-9 sm:w-9 sm:text-[13px]">
                T
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.055em] sm:text-[20px]" data-display="true">
                {content.brand}
              </span>
            </Link>

            <nav className="flex w-full flex-wrap items-center justify-center gap-1 sm:w-auto sm:justify-end">
              <Link href="/prices" className="ghost-link">
                {t("nav.prices")}
              </Link>
              <Link href="/recommend" className="ghost-link">
                {t("nav.recommend")}
              </Link>
              <Link href="/request" className="ghost-link">
                {t("nav.request")}
              </Link>
              <Link href="/booking" className="ghost-link">
                <span className="hidden sm:inline">{t("nav.booking")}</span>
                <span className="sm:hidden">{t("nav.booking")}</span>
              </Link>
              <Link href="/hospital" className="ghost-link">
                {t("nav.hospital")}
              </Link>
              {kakaoChannelUrl ? (
                <a href={kakaoChannelUrl} target="_blank" rel="noreferrer" className="ghost-link">
                  {t("nav.kakao")}
                </a>
              ) : (
                <button onClick={handleKakaoChannelOpen} className="ghost-link">
                  {t("nav.kakao")}
                </button>
              )}
              <LanguageSwitcher />
              {userEmail ? (
                <>
                  <Link href={`/my?email=${encodeURIComponent(userEmail)}`} className="ghost-link">
                    {t("nav.my")}
                  </Link>
                  <button onClick={handleLogout} className="action-secondary !px-3 !py-2 !text-[12px] sm:!px-4 sm:!text-[14px]">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <button onClick={handleKakaoLogin} className="action-primary !px-4 !py-2 !text-[12px] sm:!px-5 sm:!py-2.5 sm:!text-[14px]">
                  {t("nav.login")}
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="shell pt-5 sm:pt-10">
        <section className="overflow-hidden rounded-[34px] border border-[rgba(32,34,31,0.06)] bg-white/82 px-4 py-5 shadow-[0_30px_100px_rgba(32,34,31,0.08)] backdrop-blur-xl sm:rounded-[44px] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
          <div className="grid items-center gap-6 lg:grid-cols-[0.76fr_1.24fr]">
            <div className="max-w-[640px]">
              <p className="eyebrow">{content.heroEyebrow}</p>
              <h1
                className="type-title balance mt-5 !text-[2.45rem] sm:!text-[3.35rem] lg:!text-[3.55rem] xl:!text-[3.85rem]"
                data-display="true"
              >
                {content.heroTitle.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </h1>
              <p className="mt-5 max-w-[600px] text-[14px] leading-7 text-[var(--color-muted)] sm:text-[15px] lg:text-[16px]">
                {content.heroBody}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/recommend" className="action-primary">
                  {content.primaryCta}
                </Link>
                <Link href="/request" className="action-secondary">
                  {content.secondaryCta}
                </Link>
              </div>
              <p className="mt-4 text-[12px] font-semibold text-[var(--color-muted)] sm:text-[13px]">
                {content.helper}
              </p>
            </div>

            <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-[rgba(32,34,31,0.06)] bg-[var(--color-porcelain-gray)] shadow-[0_26px_80px_rgba(32,34,31,0.08)] sm:rounded-[40px]">
              <Image
                src="/tangle-face-consult.png"
                alt={content.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          {content.metrics.map((metric) => (
            <article key={metric.label} className="rounded-[32px] border border-[rgba(32,34,31,0.06)] bg-white/72 p-6 shadow-[0_18px_55px_rgba(32,34,31,0.05)] backdrop-blur-xl">
              <p className="text-[13px] font-semibold text-[var(--color-muted)]">{metric.label}</p>
              <p className="mt-5 text-[3rem] font-semibold leading-none tracking-[-0.06em]" data-display="true">
                {metric.value}
              </p>
              <p className="mt-4 text-[14px] leading-6 text-[var(--color-muted)]">{metric.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <div className="mx-auto max-w-[820px] text-center">
            <p className="eyebrow">{content.decisionEyebrow}</p>
            <h2 className="type-section mt-6" data-display="true">
              {content.decisionTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-[640px] text-[16px] leading-8 text-[var(--color-muted)]">
              {content.decisionBody}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.steps.map((step) => (
              <article key={step.label} className="rounded-[30px] border border-[rgba(32,34,31,0.06)] bg-white/78 p-5 shadow-[0_18px_55px_rgba(32,34,31,0.05)] backdrop-blur-xl sm:p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-genius-yellow)] text-[13px] font-semibold">
                  {step.label}
                </span>
                <h3 className="mt-8 text-[1.35rem] font-semibold leading-tight tracking-[-0.05em] sm:text-[1.45rem]" data-display="true">
                  {step.title}
                </h3>
                <p className="mt-4 text-[14px] leading-7 text-[var(--color-muted)]">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-3">
          {content.audiences.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group min-h-[260px] rounded-[34px] p-5 hover:-translate-y-1 sm:min-h-[300px] sm:rounded-[40px] sm:p-6 ${
                card.tone === "yellow"
                  ? "border border-[rgba(32,34,31,0.06)] bg-[linear-gradient(135deg,#eee87f_0%,#dce6a0_48%,#dff8ee_100%)] shadow-[0_22px_70px_rgba(204,207,91,0.18)]"
                  : card.tone === "violet"
                    ? "border border-[rgba(32,34,31,0.06)] bg-[linear-gradient(135deg,#a49bff_0%,#d1ccff_54%,#eef7ff_100%)] shadow-[0_22px_70px_rgba(164,155,255,0.18)]"
                    : "border border-[rgba(32,34,31,0.06)] bg-white/72 shadow-[0_22px_70px_rgba(32,34,31,0.06)] backdrop-blur-xl"
              }`}
            >
              <h3 className="text-[1.65rem] font-semibold leading-[1.05] tracking-[-0.06em] sm:text-[1.82rem] xl:text-[1.95rem]" data-display="true">
                {card.title}
              </h3>
              <p className="mt-5 text-[14px] leading-7 text-[rgba(23,21,14,0.72)] sm:text-[15px]">{card.body}</p>
              <p className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-[13px] font-semibold">
                {card.cta}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-16 rounded-[44px] border border-[rgba(32,34,31,0.06)] bg-white/78 p-6 shadow-[0_30px_100px_rgba(32,34,31,0.07)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="eyebrow">{content.categoryEyebrow}</p>
              <h2 className="type-section mt-6" data-display="true">
                {content.categoryTitle.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </h2>
            </div>
            <p className="max-w-[620px] text-[15px] leading-8 text-[var(--color-muted)] lg:ml-auto">
              {content.categoryBody}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {treatmentCategories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${encodeURIComponent(category.name)}`}
                className="rounded-[28px] border border-[rgba(32,34,31,0.06)] bg-[var(--color-porcelain-gray)] p-5 shadow-[0_16px_45px_rgba(32,34,31,0.04)] hover:-translate-y-0.5 hover:bg-white"
              >
                <p className="text-[1.25rem] font-semibold tracking-[-0.04em]">
                  {localizedCategory[displayCategoryName(category.name)]?.name ?? localizedCategory[category.name]?.name ?? displayCategoryName(category.name)}
                </p>
                <p className="mt-5 line-clamp-3 text-[14px] leading-6 opacity-75">
                  {localizedCategory[displayCategoryName(category.name)]?.examples ?? localizedCategory[category.name]?.examples ?? category.examples}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[44px] border border-[rgba(32,34,31,0.06)] bg-white/82 shadow-[0_30px_100px_rgba(32,34,31,0.07)] backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="eyebrow">{content.clinicEyebrow}</p>
              <h2 className="type-section mt-6" data-display="true">
                {content.clinicTitle.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </h2>
              <p className="mt-6 max-w-[720px] text-[16px] leading-8 text-[var(--color-muted)]">
                {content.clinicBody}
              </p>
            </div>

            <div className="grid gap-3 bg-[linear-gradient(135deg,#f4fbf9_0%,#edf8f5_55%,#f7f5ff_100%)] p-4 sm:grid-cols-3 lg:grid-cols-1">
              {content.clinicBenefits.map((benefit, index) => (
                <article key={benefit} className="rounded-[28px] border border-[rgba(32,34,31,0.06)] bg-white/78 p-5 shadow-[0_16px_45px_rgba(32,34,31,0.04)] backdrop-blur-xl">
                  <p className="text-[12px] font-semibold text-[var(--color-muted-light)]">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-7 text-[1.05rem] font-semibold leading-snug tracking-[-0.05em] sm:text-[1.15rem] lg:text-[1.25rem]" data-display="true">
                    {benefit}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

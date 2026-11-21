"use client";

import Link from "next/link";
import { openTangleChat } from "./components/AI열기";
import Image from "next/image";
import SiteHeader from "./components/사이트헤더";
import TangleXDrAidee from "./components/탱글x닥터에이디";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import type { SupportedLanguage } from "../lib/i18n";
import { displayCategoryName, treatmentCategories } from "../lib/siteContent";
import { categoryImages } from "../lib/카테고리이미지";
import { clinicCategoryLabels, clinicGroups, clinicRecommendations } from "../lib/서울경험추천";
import { globalGuideCopy } from "../lib/글로벌가이드";
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
    brand: "탱글 tangle",
    heroEyebrow: "광고 없는 병원 추천",
    heroTitle: ["병원 가기 전,", "탱글에서 먼저", "확인하세요."],
    heroBody:
      "수년간 쌓인 내돈내산 경험을 바탕으로 엄선한 병원 화이트리스트를 공개합니다. 병원이 공개한 최신 시술가를 같은 조건끼리 비교해 상담 전에 비용을 가늠할 수 있어요.",
    primaryCta: "추천 병원 보기",
    secondaryCta: "시술 가격 비교하기",
    helper: "",
    imageAlt: "카메라로 얼굴을 업로드하고 고민 부위를 표시한 뒤 병원에게만 공개하는 탱글 기능 안내",
    metrics: [
      { label: "추천 병원", value: `${clinicRecommendations.length}개 분야`, body: "검증된 경험 후기와 직접 다녀 본 곳으로 고른 피부·성형·치과" },
      { label: "조건을 맞춘 가격 비교", value: "78개 규격", body: "샷수, 용량, 회차, 패키지를 구분한 참고가" },
      { label: "나에게 맞는 후보 탐색", value: "5개 질문", body: "고민·예산·나이대·목표·회복 기간으로 정리" },
    ],
    decisionEyebrow: "decision board",
    decisionTitle: "상담 전에, 내 기준부터 정리해요",
    decisionBody: "추천 목록을 살펴보고 가격과 조건을 비교해 궁금한 점을 준비하세요.",
    steps: [
      { label: "01", title: "정보 입력", body: "고민, 예산, 나이대, 원하는 결과, 회복 가능 시간을 짧게 입력합니다." },
      { label: "02", title: "조건별 후보 탐색", body: "입력한 조건을 바탕으로 비교할 시술 후보와 등록 가격대를 좁혀줍니다." },
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
    categoryBody: "",
    clinicEyebrow: "clinic side",
    clinicTitle: ["좋은 상담의 시작은", "서로를 이해하는 정보에서."],
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
      { label: "02", title: "Find candidates", body: "Your inputs narrow down suitable treatment candidates and price ranges." },
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
      { label: "02", title: "条件筛选", body: "根据输入条件缩小适合的项目候选和价格范围。" },
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
      { label: "02", title: "条件で絞り込み", body: "入力条件に基づいて施術候補と価格帯を絞ります。" },
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
      { label: "02", title: "ค้นหาตามเงื่อนไข", body: "ระบบช่วยคัดหัตถการและช่วงราคาที่เหมาะกับเงื่อนไขของคุณ" },
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


export default function Home() {
  const { language, t } = useLanguage();
  const content = homeContent[language];
  const localizedCategory = categoryCopy[language];
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
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
    if (!isSupabaseConfigured) {
      setAuthNotice("현재 로그인 연결을 준비 중입니다. 추천 목록과 가격표는 로그인 없이 볼 수 있어요.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setAuthNotice("로그인에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const firsthand = clinicRecommendations.flatMap((item) =>
    item.providers.filter((provider) => provider.experience).map((provider) => ({ item, provider })),
  );
  const groupChips: Record<string, string[]> = {
    skin: ["리쥬란", "입술필러", "써마지", "여드름 흉터"],
    surgery: ["눈", "코재수술", "가슴", "모발이식"],
    dental: ["임플란트", "치아미백", "치아교정"],
  };
  const ko = language === "ko";
  const loginButton = userEmail ? (
    <>
      <Link href="/my" className="ghost-link hidden sm:inline-flex">{t("nav.my")}</Link>
      <button onClick={handleLogout} className="rounded-full border border-[var(--color-silver-mist)] bg-white px-3 py-1.5 text-[12px] font-semibold">{t("nav.logout")}</button>
    </>
  ) : (
    <button onClick={handleKakaoLogin} className="rounded-full bg-[var(--brand)] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 sm:text-[13px]">{ko ? "로그인" : t("nav.login")}</button>
  );

  return (
    <div className="pb-12">
      <SiteHeader right={loginButton} />

      <main>
        {authNotice && <p role="status" className="shell mt-4 rounded-2xl bg-white p-4 text-sm">{authNotice}</p>}

        <section className="shell grid items-center gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div>
            <p className="eyebrow"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />{content.heroEyebrow}</p>
            <h1 className="type-title balance mt-5" data-display="true">
              {content.heroTitle.map((line, index) => (
                <span key={line} className={index === content.heroTitle.length - 1 ? "block text-[var(--brand)]" : "block"}>{line}</span>
              ))}
            </h1>
            <p className="mt-6 max-w-[520px] text-[16px] leading-8 text-[var(--color-muted)] sm:text-[17px]">{content.heroBody}</p>
            {ko && (
              <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-[var(--color-muted)]">
                광고성·가짜 후기는 제외합니다. 의심되는 후기는 <Link href="/ai#review" className="font-semibold text-[var(--brand)] underline underline-offset-4">탱글 AI</Link>로 광고 신호를 한 번 더 확인할 수 있어요.
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ko ? "/clinics" : "/global"} className="action-primary">{ko ? content.primaryCta : t("nav.global")}</Link>
              <Link href="/prices" className="action-secondary">{ko ? content.secondaryCta : t("nav.prices")}</Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[440px] lg:max-w-[560px]">
            <div className="overflow-hidden rounded-[28px] bg-[var(--sand)]">
              <Image src="/images/hero-main.webp" alt="" width={1086} height={1303} priority quality={85} sizes="(min-width: 1024px) 560px, (min-width: 480px) 440px, 100vw" className="aspect-[5/6] h-auto w-full object-cover object-[50%_25%]" />
            </div>
          </div>
        </section>

        {ko && (
          <section className="shell pb-16 lg:pb-24" aria-labelledby="find-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">추천 병원</p>
                <h2 id="find-title" className="type-section mt-3">무엇을 찾으세요?</h2>
              </div>
              <Link href="/clinics" className="text-[14px] font-semibold text-[var(--brand)] underline-offset-4 hover:underline">전체 보기 →</Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
              {clinicGroups.map((group) => {
                const count = clinicRecommendations.filter((item) => group.categories.includes(item.category)).length;
                return (
                  <article key={group.id} className="group overflow-hidden rounded-[24px] border border-[var(--color-silver-mist)] bg-white">
                    <Link href={`/clinics?category=${group.id}`} className="relative block overflow-hidden">
                      <Image src={categoryImages[group.id].src} alt="" width={1086} height={1448} quality={85} sizes="(min-width: 1360px) 430px, (min-width: 640px) 33vw, 100vw" style={{ objectPosition: categoryImages[group.id].focus }} className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:aspect-[4/5]" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-5 pb-4 pt-16 text-white">
                        <span className="flex items-baseline justify-between"><span className="text-[26px] font-bold">{group.label}</span><span className="text-[13px] opacity-90">{count}개 분야 →</span></span>
                      </span>
                    </Link>
                    <div className="flex flex-wrap gap-1.5 p-4">
                      {groupChips[group.id].map((chip) => <Link key={chip} href={`/clinics?category=${group.id}&q=${encodeURIComponent(chip)}`} className="rounded-full bg-[var(--cream)] px-3 py-1.5 text-[13px] text-[var(--color-carbon)] hover:bg-[var(--sand)]">{chip}</Link>)}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {ko && (
          <section className="bg-white py-16 lg:py-24" aria-labelledby="how-title">
            <div className="shell grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[28px] lg:max-w-none">
                <Image src="/images/story.webp" alt="" width={1086} height={1303} quality={85} sizes="(min-width: 1024px) 520px, (min-width: 600px) 560px, 100vw" className="aspect-[4/3] h-auto w-full object-cover object-[50%_22%] lg:aspect-[5/6]" />
              </div>
              <div>
                <p className="eyebrow">탱글이 고르는 방법</p>
                <h2 id="how-title" className="type-section mt-3">만들어진 후기가 아니라,<br />내돈내산 경험과 성공한 사람들의 선택을 모아서.</h2>
                <p className="mt-6 max-w-lg text-[15px] leading-7 text-[var(--color-muted)]">
                  어떤 곳을 골랐고 실제로 받아 보니 어땠는지 기록합니다. 새로 추천할 곳을 찾거나 안전·진료 관련 문제가 확인되면 목록을 수정합니다.
                </p>
              </div>
            </div>
          </section>
        )}

        {ko && firsthand.length > 0 && (
          <section className="shell py-16 lg:py-24" aria-labelledby="firsthand-title">
            <p className="eyebrow">고객의 직접 경험</p>
            <h2 id="firsthand-title" className="type-section mt-3">직접 고르고 결국 선택한 곳들</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">탱글 운영진이 고객으로 직접 시술·수술을 받은 경험입니다.</p>
            <div className="snap-strip mt-8 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {firsthand.map(({ item, provider }) => (
                  <Link key={`${item.id}-${provider.clinic}`} href={`/clinics?item=${item.id}`} className="snap-card flex flex-col rounded-[22px] border border-[var(--color-silver-mist)] bg-white p-6 hover:border-[var(--brand)] lg:w-auto lg:max-w-none">
                    <span className="text-[12px] font-semibold text-[var(--accent)]">{clinicCategoryLabels[item.category]} · {item.title}</span>
                    <span className="mt-3 text-[19px] font-bold text-[var(--color-carbon)]">{provider.clinic}{provider.region ? ` (${provider.region})` : ""}</span>
                    <span className="mt-3 line-clamp-3 text-[14px] leading-6 text-[var(--color-muted)]">{provider.experience}</span>
                    <span className="mt-auto pt-5 text-[13px] font-semibold text-[var(--brand)]">자세히 보기 →</span>
                  </Link>
              ))}
            </div>
          </section>
        )}

        <section className="shell pb-16 lg:pb-24" aria-labelledby="ai-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow"><span className="rounded-md bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">AI</span>TANGLE AI</p>
              <h2 id="ai-title" className="type-section mt-3">{ko ? "광고 없이 데이터로 답하는 탱글 AI" : "Tangle AI, built on ad-free data"}</h2>
              <p className="mt-3 max-w-[620px] text-[15px] leading-7 text-[var(--color-muted)]">{ko ? "탱글 추천 메모와 시술 가격을 바탕으로 답해요. 상담 질문을 준비하거나 후기 속 광고 신호를 확인할 수 있어요." : "Ask about Tangle's clinic notes and prices, prepare consultation questions, or check reviews for advertising signals."}</p>
            </div>
            <Link href="/ai" className="text-[14px] font-semibold text-[var(--brand)] underline-offset-4 hover:underline">{ko ? "AI 도구 전체 →" : "All AI tools →"}</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" onClick={openTangleChat} className="rounded-[22px] bg-[var(--brand)] p-5 text-left text-white hover:opacity-95">
              <p className="text-[12px] font-bold text-white/70">01</p>
              <p className="mt-2 text-[17px] font-bold">{ko ? "AI 상담 도우미" : "AI consultation guide"}</p>
              <p className="mt-2 text-[14px] leading-6 text-white/80">{ko ? "고민을 적으면 추천 병원·가격으로 정리해요." : "Ask about clinics and prices in your language."}</p>
            </button>
            {[
              ["02", "/ai#questions", ko ? "AI 상담 질문지" : "AI question sheet", ko ? "내 상황에 맞는 상담 질문을 만들어요." : "Questions to bring to your consultation."],
              ["03", "/ai#review", ko ? "AI 후기 광고 체크" : "Sponsored-review check", ko ? "체험단·광고 후기일 가능성을 알려 줘요." : "See how likely a review is an ad."],
              ["04", "/ai#translate", ko ? "AI 병원 번역" : "AI clinic interpreter", ko ? "외국인 환자가 직원과 바로 대화해요." : "Show Korean sentences to clinic staff."],
            ].map(([num, href, title, body]) => (
              <Link key={href} href={href} className="rounded-[22px] border border-[var(--color-silver-mist)] bg-white p-5 hover:shadow-[0_10px_30px_rgba(23,58,49,0.08)]">
                <p className="text-[12px] font-bold text-[var(--accent)]">{num}</p>
                <p className="mt-2 text-[17px] font-bold text-[var(--color-carbon)]">{title}</p>
                <p className="mt-2 text-[14px] leading-6 text-[var(--color-muted)]">{body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={ko ? "bg-[var(--brand)] py-16 text-white lg:py-20" : "shell pb-16"} aria-labelledby="global-title">
          <div className={ko ? "shell grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]" : "grid items-center gap-10 overflow-hidden rounded-[28px] bg-[var(--brand)] p-6 text-white sm:p-10 lg:grid-cols-[1.1fr_0.9fr]"}>
            <div>
              <p className="text-[13px] font-semibold tracking-[0.06em] text-[#f3b3a6]">GLOBAL PATIENTS</p>
              <h2 id="global-title" className="mt-3 whitespace-pre-line text-[1.9rem] font-bold leading-tight sm:text-[2.4rem]">{globalGuideCopy.title[language]}</h2>
              <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-white/80">{globalGuideCopy.intro[language]}</p>
              <Link href="/global" className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-[15px] font-semibold text-[var(--brand)] hover:opacity-90">{t("nav.global")} →</Link>
            </div>
            <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[24px] lg:max-w-none">
              <Image src="/images/외국인-방문안내.webp" alt="" width={1440} height={1080} quality={85} sizes="(min-width: 1024px) 520px, (min-width: 600px) 560px, 100vw" className="aspect-[4/3] h-auto w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="shell py-16 lg:py-24" aria-labelledby="price-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{content.categoryEyebrow === "category index" ? (ko ? "시술 가격" : "Price index") : content.categoryEyebrow}</p>
              <h2 id="price-title" className="type-section mt-3">{ko ? "상담 전에, 가격부터." : content.categoryTitle.join(" ")}</h2>
              {ko && <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--color-muted)]">서울 병원의 공개 가격을 샷 수·용량·회차별로 비교하세요. 일반가와 이벤트가를 함께 확인할 수 있어요.</p>}
            </div>
            <Link href="/prices" className="action-secondary !py-3">{content.secondaryCta}</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ko ? ["울쎄라피 프라임", "써마지", "리쥬란", "인모드", "온다 리프팅", "볼뉴머", "세르프", "포텐자"].map((name) => (
              <Link key={name} href={`/prices/${encodeURIComponent(name)}`} className="flex items-center justify-between gap-2 rounded-[18px] border border-[var(--color-silver-mist)] bg-white p-4 text-base font-bold hover:border-[var(--brand)] sm:p-5">
                {name}<span aria-hidden="true" className="text-[var(--brand)]">→</span>
              </Link>
            )) : treatmentCategories.map((category) => (
              <Link key={category.name} href={`/category/${encodeURIComponent(category.name)}`} className="rounded-[18px] border border-[var(--color-silver-mist)] bg-white p-5 hover:border-[var(--brand)]">
                <p className="text-[17px] font-bold">{localizedCategory[displayCategoryName(category.name)]?.name ?? localizedCategory[category.name]?.name ?? displayCategoryName(category.name)}</p>
                <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--color-muted)]">{localizedCategory[displayCategoryName(category.name)]?.examples ?? localizedCategory[category.name]?.examples ?? category.examples}</p>
              </Link>
            ))}
          </div>
        </section>

        <div className="shell">
          <TangleXDrAidee placement="home" />
        </div>
      </main>
    </div>
  );
}

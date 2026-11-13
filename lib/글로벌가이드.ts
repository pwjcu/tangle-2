import type { LocalizedText } from "./협업병원";

/** 외국인 환자용 방문 안내. 화면 문구와 직원에게 보여 줄 문장을 5개 언어로 관리합니다. */
export type VisitPlan = "skin" | "surgery";
export type VisitStay = "short" | "long";
export type GuideTip = { text: LocalizedText; plans?: VisitPlan[]; stays?: VisitStay[] };
export type GuideSection = { id: string; title: LocalizedText; tips: GuideTip[] };

export const globalGuideCopy = {
  metaTitle: { ko: "외국인 환자 안내", en: "Global patient guide", zh: "外国患者就诊指南", ja: "外国人患者ガイド", th: "คู่มือผู้ป่วยต่างชาติ" },
  eyebrow: { ko: "GLOBAL PATIENTS · 한국 병원 방문 안내", en: "GLOBAL PATIENTS · VISITING A CLINIC IN KOREA", zh: "GLOBAL PATIENTS · 韩国医院就诊指南", ja: "GLOBAL PATIENTS · 韓国クリニック受診ガイド", th: "GLOBAL PATIENTS · คู่มือไปคลินิกในเกาหลี" },
  title: {
    ko: "한국 병원 방문,\n나에게 맞는 준비만.",
    en: "Visiting a Korean clinic?\nOnly what you need.",
    zh: "来韩国看诊？\n只准备你需要的。",
    ja: "韓国のクリニックへ。\nあなたに必要な準備だけ。",
    th: "ไปคลินิกที่เกาหลี?\nเตรียมเฉพาะที่คุณต้องใช้",
  },
  intro: {
    ko: "시술 종류와 머무는 기간을 고르면 필요한 서류, 방문 전 확인할 것, 상담 팁, 시술 후 주의사항만 보여 드려요. 병원 직원에게 보여 줄 한국어 카드도 만들 수 있어요.",
    en: "Pick your treatment type and how long you stay. We show only the documents, checks, consultation tips and aftercare you need, plus a Korean card you can show clinic staff.",
    zh: "选择项目类型和停留时间，只显示你需要的证件、出发前确认事项、咨询技巧和术后注意事项，还可以生成给医院工作人员看的韩语卡片。",
    ja: "施術の種類と滞在期間を選ぶと、必要な書類、事前確認、カウンセリングのコツ、施術後の注意点だけを表示します。クリニックのスタッフに見せる韓国語カードも作れます。",
    th: "เลือกประเภทหัตถการและระยะเวลาที่อยู่เกาหลี แล้วเราจะแสดงเฉพาะเอกสาร สิ่งที่ต้องเช็ก เคล็ดลับการปรึกษา และการดูแลหลังทำ พร้อมการ์ดภาษาเกาหลีไว้ให้เจ้าหน้าที่ดู",
  },
  planQuestion: { ko: "무엇을 받으시나요?", en: "What are you getting?", zh: "你要做什么？", ja: "何を受けますか？", th: "คุณจะทำอะไร?" },
  stayQuestion: { ko: "한국에 얼마나 머무나요?", en: "How long are you in Korea?", zh: "在韩国停留多久？", ja: "韓国にどのくらい滞在しますか？", th: "อยู่เกาหลีนานเท่าไร?" },
  plans: {
    skin: { ko: "피부 시술 (레이저·보톡스·필러·리프팅)", en: "Skin treatment (laser, Botox, filler, lifting)", zh: "皮肤项目（激光、肉毒、填充、提升）", ja: "皮膚施術（レーザー・ボトックス・フィラー・リフト）", th: "หัตถการผิว (เลเซอร์ โบท็อกซ์ ฟิลเลอร์ ยกกระชับ)" },
    surgery: { ko: "성형 수술 (눈·코·윤곽·가슴 등)", en: "Plastic surgery (eyes, nose, contour, breast…)", zh: "整形手术（眼、鼻、轮廓、胸等）", ja: "整形手術（目・鼻・輪郭・胸など）", th: "ศัลยกรรม (ตา จมูก โครงหน้า หน้าอก ฯลฯ)" },
  } satisfies Record<VisitPlan, LocalizedText>,
  stays: {
    short: { ko: "4일 이하", en: "4 days or less", zh: "4天以内", ja: "4日以内", th: "ไม่เกิน 4 วัน" },
    long: { ko: "5일 이상", en: "5 days or more", zh: "5天以上", ja: "5日以上", th: "5 วันขึ้นไป" },
  } satisfies Record<VisitStay, LocalizedText>,
  checklistHint: { ko: "체크해 두면 이 기기에만 저장돼요.", en: "Ticks are saved on this device only.", zh: "勾选内容只保存在本设备。", ja: "チェックはこの端末にのみ保存されます。", th: "เครื่องหมายถูกจะบันทึกไว้ในเครื่องนี้เท่านั้น" },
  staffTitle: { ko: "직원에게 보여 주기", en: "Show clinic staff", zh: "给工作人员看", ja: "スタッフに見せる", th: "ให้เจ้าหน้าที่ดู" },
  staffIntro: {
    ko: "나에게 해당하는 문장을 고르면 한국어로 크게 보여 줘요. 접수처나 상담실에서 화면을 그대로 보여 주세요.",
    en: "Pick the sentences that apply to you and we show them in large Korean. Just show the screen at reception or in the consultation room.",
    zh: "选择符合你情况的句子，我们会用大号韩语显示。在前台或咨询室直接出示屏幕即可。",
    ja: "当てはまる文を選ぶと、大きな韓国語で表示します。受付やカウンセリング室で画面をそのまま見せてください。",
    th: "เลือกประโยคที่ตรงกับคุณ แล้วเราจะแสดงเป็นภาษาเกาหลีตัวใหญ่ ยื่นหน้าจอให้เจ้าหน้าที่ที่เคาน์เตอร์หรือห้องปรึกษาได้เลย",
  },
  staffShow: { ko: "한국어 카드 보기", en: "Show Korean card", zh: "显示韩语卡片", ja: "韓国語カードを表示", th: "แสดงการ์ดภาษาเกาหลี" },
  staffClose: { ko: "닫기", en: "Close", zh: "关闭", ja: "閉じる", th: "ปิด" },
  staffEmpty: { ko: "먼저 문장을 하나 이상 골라 주세요.", en: "Pick at least one sentence first.", zh: "请先至少选择一句。", ja: "まず1つ以上選んでください。", th: "กรุณาเลือกอย่างน้อยหนึ่งประโยค" },
  partnersTitle: { ko: "외국인 환자가 많이 찾는 협업 병원", en: "Partner clinics popular with international patients", zh: "外国患者常去的合作医院", ja: "外国人患者に人気の提携クリニック", th: "คลินิกพันธมิตรที่ผู้ป่วยต่างชาตินิยม" },
  partnersNote: {
    ko: "탱글과 협업하는 병원입니다. 가격·예약 가능 여부·통역은 병원에 직접 확인해 주세요.",
    en: "These clinics work with Tangle. Please confirm prices, availability and interpretation directly with the clinic.",
    zh: "以下为 Tangle 合作医院。价格、可预约时间和翻译服务请直接向医院确认。",
    ja: "Tangleと提携しているクリニックです。料金・予約状況・通訳はクリニックに直接ご確認ください。",
    th: "คลินิกเหล่านี้เป็นพันธมิตรกับ Tangle กรุณาสอบถามราคา คิวว่าง และล่ามกับคลินิกโดยตรง",
  },
  partnerBadge: { ko: "탱글 협업", en: "Tangle partner", zh: "Tangle 合作", ja: "Tangle提携", th: "พันธมิตร Tangle" },
  helpTitle: { ko: "도움이 필요할 때", en: "If you need help", zh: "需要帮助时", ja: "困ったときは", th: "เมื่อต้องการความช่วยเหลือ" },
  help: [
    { ko: "1330 관광통역안내 — 24시간, 한국어·영어·중국어·일본어·태국어 등 통역", en: "1330 Korea Travel Hotline — 24 hours, interpretation in English, Chinese, Japanese, Thai and more", zh: "1330 旅游咨询热线 — 24小时，提供中文、英语、日语、泰语等翻译", ja: "1330 観光案内ホットライン — 24時間、日本語・英語・中国語・タイ語などの通訳", th: "1330 สายด่วนท่องเที่ยวเกาหลี — 24 ชั่วโมง มีล่ามภาษาไทย อังกฤษ จีน ญี่ปุ่น ฯลฯ" },
    { ko: "119 응급 (구급차·소방)", en: "119 Emergency (ambulance, fire)", zh: "119 急救（救护车、消防）", ja: "119 救急（救急車・消防）", th: "119 ฉุกเฉิน (รถพยาบาล ดับเพลิง)" },
    { ko: "시술 후 열·심한 통증·숨참·붓기 악화가 있으면 바로 병원에 연락하세요.", en: "Fever, severe pain, shortness of breath or worsening swelling after treatment: contact the clinic right away.", zh: "术后如出现发烧、剧痛、呼吸困难或肿胀加重，请立即联系医院。", ja: "施術後に発熱・強い痛み・息苦しさ・腫れの悪化があれば、すぐにクリニックへ連絡してください。", th: "หากมีไข้ ปวดมาก หายใจลำบาก หรือบวมมากขึ้นหลังทำ ให้ติดต่อคลินิกทันที" },
  ] satisfies LocalizedText[],
  disclaimer: {
    ko: "일반적인 안내이며 의료 상담을 대신하지 않습니다. 개인별 준비 사항은 병원 안내를 따라 주세요.",
    en: "General information only, not medical advice. Follow your clinic's instructions for your own case.",
    zh: "以上为一般信息，不能代替医疗咨询。具体请遵循医院的指示。",
    ja: "一般的な案内であり、医療相談の代わりではありません。個別の準備はクリニックの指示に従ってください。",
    th: "ข้อมูลทั่วไป ไม่ใช่คำแนะนำทางการแพทย์ โปรดทำตามคำแนะนำของคลินิกสำหรับกรณีของคุณ",
  },
};

export const globalGuideSections: GuideSection[] = [
  {
    id: "documents",
    title: { ko: "챙겨 갈 서류·물건", en: "Documents & things to bring", zh: "需要携带的证件与物品", ja: "持ち物・書類", th: "เอกสารและของที่ต้องนำไป" },
    tips: [
      { text: { ko: "여권 원본 (본인 확인, 세금 환급 신청에 필요)", en: "Your passport (ID check and any tax refund)", zh: "护照原件（身份确认、退税时需要）", ja: "パスポート原本（本人確認・税還付に必要）", th: "หนังสือเดินทางตัวจริง (ยืนยันตัวตนและขอคืนภาษี)" } },
      { text: { ko: "복용 중인 약 이름 목록 (영문 표기 또는 약 사진)", en: "List of medicines you take (English names or photos)", zh: "正在服用的药物清单（英文名称或照片）", ja: "服用中の薬のリスト（英語名または写真）", th: "รายชื่อยาที่ทานอยู่ (ชื่อภาษาอังกฤษหรือรูปถ่าย)" } },
      { text: { ko: "알레르기·지병 메모 (마취약·항생제·라텍스 등)", en: "Notes on allergies and conditions (anesthetics, antibiotics, latex…)", zh: "过敏与病史备忘（麻药、抗生素、乳胶等）", ja: "アレルギー・持病のメモ（麻酔薬・抗生物質・ラテックスなど）", th: "บันทึกการแพ้และโรคประจำตัว (ยาชา ยาปฏิชีวนะ ลาเท็กซ์ ฯลฯ)" } },
      { text: { ko: "예전에 받은 시술·수술 기록 (제품명, 용량, 날짜)", en: "Records of past treatments or surgery (product, amount, date)", zh: "以往项目或手术记录（产品、用量、日期）", ja: "過去の施術・手術の記録（製品名・量・日付）", th: "ประวัติหัตถการหรือผ่าตัดเดิม (ชื่อผลิตภัณฑ์ ปริมาณ วันที่)" } },
      { text: { ko: "원하는 모양의 참고 사진", en: "Reference photos of the look you want", zh: "想要效果的参考照片", ja: "希望イメージの参考写真", th: "รูปตัวอย่างลุคที่ต้องการ" } },
      { text: { ko: "해외 결제 가능한 카드와 약간의 현금 (예약금이 있을 수 있음)", en: "A card that works abroad and some cash (a deposit may be required)", zh: "可境外支付的银行卡和少量现金（可能需要定金）", ja: "海外で使えるカードと少しの現金（予約金が必要な場合あり）", th: "บัตรที่ใช้ต่างประเทศได้และเงินสดเล็กน้อย (อาจต้องมัดจำ)" } },
      { text: { ko: "여행자 보험 증서 (수술 합병증 보장 여부 확인)", en: "Travel insurance details (check whether surgical complications are covered)", zh: "旅行保险单（确认是否涵盖手术并发症）", ja: "旅行保険の証書（手術の合併症が補償対象か確認）", th: "เอกสารประกันการเดินทาง (เช็กว่าครอบคลุมภาวะแทรกซ้อนจากการผ่าตัดไหม)" }, plans: ["surgery"] },
      { text: { ko: "최근 건강검진·혈액검사 결과가 있으면 지참 (병원이 요청할 수 있음)", en: "Recent health check or blood test results, if you have them (clinics may ask)", zh: "如有近期体检或验血报告请携带（医院可能会要求）", ja: "最近の健康診断・血液検査の結果があれば持参（求められることがあります）", th: "ผลตรวจสุขภาพหรือผลเลือดล่าสุด ถ้ามี (คลินิกอาจขอ)" }, plans: ["surgery"] },
      { text: { ko: "편한 앞여밈 옷, 모자·선글라스·마스크", en: "Loose front-opening clothes, a hat, sunglasses and a mask", zh: "宽松的前开襟衣服、帽子、墨镜和口罩", ja: "前開きのゆったりした服、帽子・サングラス・マスク", th: "เสื้อผ้าหลวมแบบกระดุมหน้า หมวก แว่นกันแดด และหน้ากาก" }, plans: ["surgery"] },
      { text: { ko: "자외선 차단제 (레이저 후 필수)", en: "Sunscreen (a must after laser)", zh: "防晒霜（激光后必备）", ja: "日焼け止め（レーザー後は必須）", th: "ครีมกันแดด (จำเป็นหลังเลเซอร์)" }, plans: ["skin"] },
    ],
  },
  {
    id: "before",
    title: { ko: "방문 전에 확인할 것", en: "Check before you go", zh: "出发前确认", ja: "行く前に確認", th: "เช็กก่อนไป" },
    tips: [
      { text: { ko: "예약은 미리: 왓츠앱·라인·인스타그램 DM으로 날짜와 통역 가능 언어를 확인하세요.", en: "Book ahead: confirm the date and interpreter language via WhatsApp, LINE or Instagram DM.", zh: "提前预约：通过 WhatsApp、LINE 或 Instagram 私信确认日期和可提供的翻译语言。", ja: "事前予約：WhatsApp・LINE・Instagram DMで日程と通訳の言語を確認しましょう。", th: "จองล่วงหน้า: เช็กวันและภาษาล่ามผ่าน WhatsApp, LINE หรือ Instagram DM" } },
      { text: { ko: "가격이 부가세 포함인지, 마취·재방문·약값이 포함인지 물어보세요.", en: "Ask whether prices include VAT, anesthesia, follow-up visits and medicine.", zh: "确认价格是否含增值税、麻醉、复诊和药费。", ja: "料金に付加価値税・麻酔・再診・薬代が含まれるか確認しましょう。", th: "ถามว่าราคารวม VAT ยาชา การนัดติดตาม และค่ายาหรือไม่" } },
      { text: { ko: "외국인 미용 시술은 부가세 환급 대상일 수 있어요. 제도와 대상이 바뀔 수 있으니 결제 전에 병원에 묻고 영수증을 챙기세요.", en: "Some cosmetic procedures for foreign visitors may qualify for a VAT refund. Rules change, so ask before paying and keep the receipt.", zh: "部分外国游客的美容项目可能可以退增值税。政策会变动，付款前请询问医院并保留收据。", ja: "外国人の美容施術は付加価値税の還付対象になる場合があります。制度は変わるため、支払い前に確認し領収書を保管しましょう。", th: "หัตถการความงามบางอย่างของนักท่องเที่ยวต่างชาติอาจขอคืน VAT ได้ กฎอาจเปลี่ยน ถามก่อนจ่ายและเก็บใบเสร็จไว้" } },
      { text: { ko: "취소·환불 규정과 예약금 조건을 미리 받아 두세요.", en: "Get the cancellation, refund and deposit rules in writing.", zh: "提前拿到取消、退款和定金规定。", ja: "キャンセル・返金・予約金の規定を事前にもらっておきましょう。", th: "ขอเงื่อนไขการยกเลิก คืนเงิน และมัดจำเป็นลายลักษณ์อักษร" } },
      { text: { ko: "시술 전후 1주는 아스피린·오메가3·술을 피하라는 안내가 많아요. 복용 중인 약은 끊기 전에 의사와 상의하세요.", en: "Clinics often ask you to avoid aspirin, omega-3 and alcohol for a week around treatment. Ask your doctor before stopping any prescribed medicine.", zh: "医院常建议治疗前后一周避免阿司匹林、鱼油和饮酒。处方药停用前请先咨询医生。", ja: "施術前後1週間はアスピリン・オメガ3・飲酒を控えるよう案内されることが多いです。処方薬は中止前に医師に相談を。", th: "คลินิกมักให้งดแอสไพริน โอเมก้า 3 และแอลกอฮอล์ราว 1 สัปดาห์ก่อนและหลังทำ ยาที่หมอสั่งต้องปรึกษาก่อนหยุด" } },
      { text: { ko: "수술은 상담과 수술 날짜를 나누는 게 좋아요. 입국 다음 날 상담, 며칠 뒤 수술 일정을 추천해요.", en: "For surgery, keep consultation and surgery on separate days — e.g. consult the day after you land, operate a few days later.", zh: "手术最好把咨询和手术分开：落地第二天咨询，几天后再手术。", ja: "手術は相談日と手術日を分けるのがおすすめ。入国翌日に相談、数日後に手術など。", th: "สำหรับศัลยกรรม ควรแยกวันปรึกษาและวันผ่าตัด เช่น ปรึกษาวันรุ่งขึ้นหลังมาถึง แล้วผ่าตัดอีกไม่กี่วันต่อมา" }, plans: ["surgery"] },
      { text: { ko: "머무는 기간이 짧으면 수술보다 회복이 빠른 피부 시술 위주로 계획하세요.", en: "With a short stay, plan quick-recovery skin treatments rather than surgery.", zh: "停留时间短的话，优先安排恢复快的皮肤项目而非手术。", ja: "滞在が短いなら、手術より回復の早い皮膚施術を中心に。", th: "ถ้าอยู่ไม่นาน วางแผนหัตถการผิวที่ฟื้นตัวเร็วแทนการผ่าตัด" }, stays: ["short"] },
      { text: { ko: "수술은 실밥 제거와 경과 확인까지 보통 7~14일이 필요해요. 귀국일은 병원과 먼저 정하세요.", en: "Surgery usually needs 7–14 days for stitch removal and a check-up. Agree on your flight date with the clinic first.", zh: "手术通常需要7~14天来拆线和复查。回国日期请先和医院确认。", ja: "手術は抜糸と経過確認まで通常7〜14日必要です。帰国日は先にクリニックと決めましょう。", th: "ศัลยกรรมมักต้องใช้ 7–14 วันเพื่อตัดไหมและตรวจติดตาม ตกลงวันบินกับคลินิกก่อน" }, plans: ["surgery"] },
    ],
  },
  {
    id: "consult",
    title: { ko: "상담 팁", en: "Consultation tips", zh: "咨询技巧", ja: "カウンセリングのコツ", th: "เคล็ดลับการปรึกษา" },
    tips: [
      { text: { ko: "상담실장이 아니라 시술·수술할 의사에게 직접 설명을 들으세요.", en: "Hear the plan from the doctor who will treat you, not only the coordinator.", zh: "要直接听主刀/操作医生说明，而不只是咨询师。", ja: "カウンセラーだけでなく、施術・手術をする医師から直接説明を聞きましょう。", th: "ฟังแผนจากแพทย์ที่จะทำให้คุณโดยตรง ไม่ใช่แค่ผู้ประสานงาน" } },
      { text: { ko: "제품명·브랜드·용량(cc, 샷 수)을 견적서에 적어 달라고 하세요.", en: "Ask for the product, brand and amount (cc, shots) in writing on your quote.", zh: "请在报价单上写明产品、品牌和用量（cc、发数）。", ja: "製品名・ブランド・量（cc、ショット数）を見積書に書いてもらいましょう。", th: "ขอให้เขียนชื่อผลิตภัณฑ์ แบรนด์ และปริมาณ (cc, จำนวนช็อต) ในใบเสนอราคา" } },
      { text: { ko: "\"가격이 같다면 원장님 본인에게는 무엇을 하시겠어요?\"라고 물어보세요.", en: "Ask: \"If price didn't matter, what would you choose for yourself?\"", zh: "问医生：“如果价格一样，您自己会选哪个？”", ja: "「料金が同じなら、先生ご自身なら何を選びますか？」と聞いてみましょう。", th: "ลองถามว่า \"ถ้าราคาเท่ากัน คุณหมอจะเลือกอะไรให้ตัวเอง?\"" } },
      { text: { ko: "원하는 결과(자연스럽게/확실하게)를 사진과 함께 분명히 말하세요.", en: "Be clear about the result you want (natural vs dramatic) and show photos.", zh: "带着照片明确说出想要的效果（自然/明显）。", ja: "希望する仕上がり（自然に/はっきり）を写真で明確に伝えましょう。", th: "บอกผลลัพธ์ที่ต้องการให้ชัด (ธรรมชาติ/ชัดเจน) พร้อมรูปตัวอย่าง" } },
      { text: { ko: "당일 할인 압박에 바로 결정하지 마세요. 견적서를 받아 비교해도 됩니다.", en: "Don't decide under same-day discount pressure. It's fine to take the quote and compare.", zh: "不要因为“当天优惠”而仓促决定，拿报价单回去比较也可以。", ja: "当日割引に押されて即決しないで。見積書をもらって比較してOKです。", th: "อย่าตัดสินใจเพราะโปรวันนี้เท่านั้น ขอใบเสนอราคาไปเทียบก่อนได้" } },
      { text: { ko: "귀국 후 문제가 생기면 어떻게 연락하고 관리받는지 물어보세요.", en: "Ask how follow-up works once you're back home.", zh: "问清楚回国后出现问题如何联系和处理。", ja: "帰国後に問題が起きた場合の連絡方法とケアを確認しましょう。", th: "ถามว่าหลังกลับประเทศแล้วถ้ามีปัญหาจะติดต่อและดูแลอย่างไร" } },
      { text: { ko: "수술 기록지와 사용한 보형물·재료의 정품 정보(시리얼 번호)를 영문으로 받아 두세요.", en: "Get your surgical record and implant/material details (serial number) in English.", zh: "索取英文手术记录和假体/材料的正品信息（序列号）。", ja: "手術記録とインプラント・材料の正規品情報（シリアル番号）を英語でもらいましょう。", th: "ขอบันทึกการผ่าตัดและข้อมูลซิลิโคน/วัสดุ (หมายเลขซีเรียล) เป็นภาษาอังกฤษ" }, plans: ["surgery"] },
      { text: { ko: "같은 날 여러 시술을 묶을 때는 순서와 회복 기간을 함께 확인하세요.", en: "If you combine several treatments in one day, check the order and recovery time.", zh: "同一天做多个项目时，确认顺序和恢复期。", ja: "同じ日に複数施術を組み合わせる場合は、順番と回復期間を確認しましょう。", th: "ถ้าทำหลายอย่างในวันเดียว เช็กลำดับและเวลาฟื้นตัวด้วย" }, plans: ["skin"] },
    ],
  },
  {
    id: "after",
    title: { ko: "시술 후 주의사항", en: "After treatment", zh: "术后注意事项", ja: "施術後の注意", th: "หลังทำ" },
    tips: [
      { text: { ko: "레이저·리프팅 후 며칠은 사우나·찜질방·격한 운동·음주를 피하세요.", en: "Skip saunas, jjimjilbang, hard workouts and alcohol for a few days after laser or lifting.", zh: "激光或提升后几天内避免桑拿、汗蒸、剧烈运动和饮酒。", ja: "レーザー・リフト後数日はサウナ・チムジルバン・激しい運動・飲酒を避けましょう。", th: "หลังเลเซอร์หรือยกกระชับ งดซาวน่า จิมจิลบัง ออกกำลังหนัก และแอลกอฮอล์สักไม่กี่วัน" }, plans: ["skin"] },
      { text: { ko: "관광 중에도 자외선 차단제를 2~3시간마다 덧바르세요.", en: "Reapply sunscreen every 2–3 hours, even while sightseeing.", zh: "观光时也要每2~3小时补涂防晒。", ja: "観光中も2〜3時間ごとに日焼け止めを塗り直しましょう。", th: "ทาครีมกันแดดซ้ำทุก 2–3 ชั่วโมง แม้ระหว่างเที่ยว" }, plans: ["skin"] },
      { text: { ko: "필러·보톡스 후 당일은 시술 부위를 누르거나 마사지하지 마세요.", en: "Don't press or massage filler/Botox areas on the day of treatment.", zh: "填充或肉毒当天不要按压或按摩注射部位。", ja: "フィラー・ボトックス当日は施術部位を押したりマッサージしたりしないでください。", th: "วันที่ฉีดฟิลเลอร์หรือโบท็อกซ์ อย่ากดหรือนวดบริเวณที่ฉีด" }, plans: ["skin"] },
      { text: { ko: "붓기와 멍은 보통 1~2주 가요. 귀국 비행 전 병원에서 마지막 확인을 받으세요.", en: "Swelling and bruising usually last 1–2 weeks. Get a final check at the clinic before your flight.", zh: "肿胀和淤青通常持续1~2周。回国前请在医院做最后检查。", ja: "腫れやあざは通常1〜2週間続きます。帰国便の前にクリニックで最終チェックを。", th: "อาการบวมและช้ำมักอยู่ 1–2 สัปดาห์ ตรวจครั้งสุดท้ายที่คลินิกก่อนขึ้นเครื่อง" }, plans: ["surgery"] },
      { text: { ko: "비행기 탑승 가능 시점을 의사에게 꼭 확인하세요.", en: "Ask the doctor when it is safe to fly.", zh: "一定要向医生确认何时可以乘飞机。", ja: "飛行機に乗ってよい時期を必ず医師に確認しましょう。", th: "ถามแพทย์ให้แน่ใจว่าขึ้นเครื่องได้เมื่อไร" }, plans: ["surgery"] },
      { text: { ko: "처방약은 영문 약 이름과 복용법을 받아 두세요.", en: "Get English names and dosing instructions for any prescribed medicine.", zh: "处方药请索取英文药名和服用方法。", ja: "処方薬は英語の薬名と飲み方をもらっておきましょう。", th: "ขอชื่อยาและวิธีใช้เป็นภาษาอังกฤษสำหรับยาที่ได้รับ" } },
      { text: { ko: "출국이 가까우면 붉음·딱지가 오래가는 강한 시술은 피하세요.", en: "If you fly out soon, avoid strong treatments that leave redness or scabs for days.", zh: "临近回国时，避免会持续泛红、结痂的强度较大项目。", ja: "出国が近いなら、赤みやかさぶたが長引く強い施術は避けましょう。", th: "ถ้าใกล้วันบิน หลีกเลี่ยงหัตถการแรงที่ทำให้แดงหรือตกสะเก็ดหลายวัน" }, plans: ["skin"], stays: ["short"] },
    ],
  },
];

/** 직원에게 보여 줄 문장. ko는 직원이 읽을 한국어입니다. */
export const staffPhrases: { id: string; text: LocalizedText; plans?: VisitPlan[] }[] = [
  { id: "interpreter", text: { ko: "통역(제 언어)이 가능한 직원이 있으면 도와주세요.", en: "Is there a staff member who speaks my language?", zh: "有会说我语言的工作人员吗？", ja: "私の言語を話せるスタッフはいますか？", th: "มีเจ้าหน้าที่ที่พูดภาษาของฉันได้ไหม?" } },
  { id: "vat", text: { ko: "부가세 포함 총금액을 알려 주세요.", en: "Please tell me the total price including VAT.", zh: "请告诉我含增值税的总价。", ja: "付加価値税込みの総額を教えてください。", th: "กรุณาบอกราคารวม VAT ทั้งหมด" } },
  { id: "refund", text: { ko: "외국인 부가세 환급이 가능한지 알려 주세요. 영수증이 필요해요.", en: "Can I get a VAT refund as a foreign visitor? I need a receipt.", zh: "外国人可以退增值税吗？我需要收据。", ja: "外国人の付加価値税還付はできますか？領収書が必要です。", th: "ชาวต่างชาติขอคืน VAT ได้ไหม? ฉันต้องการใบเสร็จ" } },
  { id: "product", text: { ko: "사용할 제품명과 용량(cc·샷 수)을 적어 주세요.", en: "Please write down the product name and amount (cc / shots).", zh: "请写下使用的产品名称和用量（cc/发数）。", ja: "使用する製品名と量（cc・ショット数）を書いてください。", th: "กรุณาเขียนชื่อผลิตภัณฑ์และปริมาณ (cc / ช็อต)" } },
  { id: "doctor", text: { ko: "시술(수술)하실 원장님께 직접 상담받고 싶어요.", en: "I'd like to consult the doctor who will do my treatment.", zh: "我想直接和为我操作的医生咨询。", ja: "施術（手術）を担当する先生に直接相談したいです。", th: "ฉันอยากปรึกษาแพทย์ที่จะทำให้ฉันโดยตรง" } },
  { id: "natural", text: { ko: "자연스러운 결과를 원해요.", en: "I want a natural-looking result.", zh: "我想要自然的效果。", ja: "自然な仕上がりを希望します。", th: "ฉันต้องการผลลัพธ์ที่ดูเป็นธรรมชาติ" } },
  { id: "allergy", text: { ko: "약물 알레르기가 있어요. 약 이름을 보여 드릴게요.", en: "I have a drug allergy. I'll show you the name.", zh: "我对药物过敏，我会给你看药名。", ja: "薬のアレルギーがあります。薬の名前をお見せします。", th: "ฉันแพ้ยา จะให้ดูชื่อยา" } },
  { id: "blood-thinner", text: { ko: "아스피린 등 혈액을 묽게 하는 약을 먹고 있어요.", en: "I take blood thinners such as aspirin.", zh: "我在服用阿司匹林等抗凝血药物。", ja: "アスピリンなど血液をサラサラにする薬を飲んでいます。", th: "ฉันทานยาละลายลิ่มเลือด เช่น แอสไพริน" } },
  { id: "pregnant", text: { ko: "임신 중이거나 임신 가능성이 있어요.", en: "I am pregnant or may be pregnant.", zh: "我已怀孕或可能怀孕。", ja: "妊娠中、または妊娠の可能性があります。", th: "ฉันตั้งครรภ์หรืออาจตั้งครรภ์" } },
  { id: "previous", text: { ko: "이 부위에 이전에 필러·보톡스·수술을 받은 적이 있어요.", en: "I've had filler, Botox or surgery in this area before.", zh: "这个部位以前做过填充、肉毒或手术。", ja: "この部位に以前フィラー・ボトックス・手術を受けたことがあります。", th: "ฉันเคยฉีดฟิลเลอร์ โบท็อกซ์ หรือผ่าตัดบริเวณนี้มาก่อน" } },
  { id: "keloid", text: { ko: "켈로이드(흉터가 잘 생기는) 체질이에요.", en: "I tend to get keloids (raised scars).", zh: "我是瘢痕（蟹足肿）体质。", ja: "ケロイド体質（傷跡が盛り上がりやすい）です。", th: "ฉันเป็นคีลอยด์ง่าย (แผลเป็นนูน)" } },
  { id: "herpes", text: { ko: "입술 헤르페스(물집)가 자주 생겨요.", en: "I often get cold sores (lip herpes).", zh: "我经常长唇疱疹。", ja: "口唇ヘルペスがよくできます。", th: "ฉันเป็นเริมที่ริมฝีปากบ่อย" }, plans: ["skin"] },
  { id: "fly-soon", text: { ko: "며칠 뒤 귀국해요. 회복 기간이 짧은 방법을 원해요.", en: "I fly home in a few days. I need a method with short downtime.", zh: "我几天后回国，想要恢复期短的方法。", ja: "数日後に帰国します。ダウンタイムが短い方法を希望します。", th: "อีกไม่กี่วันฉันจะกลับประเทศ ต้องการวิธีที่พักฟื้นสั้น" } },
  { id: "flight-ok", text: { ko: "비행기는 언제부터 탈 수 있나요?", en: "When is it safe for me to fly?", zh: "我什么时候可以坐飞机？", ja: "いつから飛行機に乗れますか？", th: "ฉันขึ้นเครื่องบินได้เมื่อไร?" }, plans: ["surgery"] },
  { id: "records", text: { ko: "진료 기록과 처방약 정보를 영문으로 받을 수 있을까요?", en: "Can I get my treatment record and prescription in English?", zh: "可以给我英文的治疗记录和处方信息吗？", ja: "診療記録と処方薬の情報を英語でもらえますか？", th: "ขอบันทึกการรักษาและข้อมูลยาเป็นภาษาอังกฤษได้ไหม?" } },
  { id: "implant-card", text: { ko: "보형물 정품 등록증과 시리얼 번호를 받고 싶어요.", en: "I'd like the implant registration card and serial number.", zh: "我想要假体正品登记卡和序列号。", ja: "インプラントの正規品登録証とシリアル番号をください。", th: "ฉันต้องการบัตรรับรองซิลิโคนแท้และหมายเลขซีเรียล" }, plans: ["surgery"] },
];

export function tipsFor(section: GuideSection, plan: VisitPlan, stay: VisitStay): GuideTip[] {
  return section.tips.filter((tip) => (!tip.plans || tip.plans.includes(plan)) && (!tip.stays || tip.stays.includes(stay)));
}

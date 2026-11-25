/**
 * 후기 사진의 숨은 정보(메타데이터)를 브라우저 안에서만 읽어 AI 생성·보정 흔적을 찾습니다.
 * 사진은 서버로 보내지 않습니다. 메타데이터는 지우거나 바꿀 수 있으므로 "흔적이 없다"가 "진짜"를 뜻하지는 않습니다.
 */

export type PhotoSignal = { level: "high" | "mid" | "low" | "info"; text: string };
export type PhotoCheck = { score: number; verdict: string; signals: PhotoSignal[]; camera: string | null; software: string | null; taken: string | null };

const AI_MARKERS: [RegExp, string][] = [
  [/trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia/i, "AI로 만들었다는 표준 표시(IPTC)가 들어 있어요"],
  [/Midjourney|DALL[·\-.]?E|Stable ?Diffusion|Firefly|Imagen|Gemini|ChatGPT|OpenAI|Leonardo\.?Ai|NovelAI|ComfyUI|Flux/i, "AI 이미지 도구 이름이 기록돼 있어요"],
];
const RETOUCH_APPS = /Meitu|BeautyPlus|BeautyCam|Facetune|FaceApp|SNOW|B612|SODA|Ulike|Picsart|Remini|Lensa|Retouch|YouCam|AirBrush|PhotoWonder|美图|轻颜|醒图|Faceu/i;
const EDITORS = /Photoshop|Lightroom|GIMP|Affinity|Pixelmator|Snapseed|Canva|PhotoDirector/i;

function ascii(bytes: Uint8Array, start: number, end: number) {
  let out = "";
  for (let i = start; i < Math.min(end, bytes.length); i++) {
    const c = bytes[i];
    out += c >= 32 && c < 127 ? String.fromCharCode(c) : " ";
  }
  return out;
}

/** JPEG의 EXIF(IFD0 + Exif IFD)에서 제조사·모델·소프트웨어·촬영일을 읽습니다. */
function readExif(bytes: Uint8Array) {
  const found: { make?: string; model?: string; software?: string; taken?: string } = {};
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return found;
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (marker === 0xe1 && ascii(bytes, offset + 4, offset + 10).startsWith("Exif")) {
      const tiff = offset + 10;
      const little = bytes[tiff] === 0x49;
      const u16 = (p: number) => little ? bytes[p] | (bytes[p + 1] << 8) : (bytes[p] << 8) | bytes[p + 1];
      const u32 = (p: number) => little ? (bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16) | (bytes[p + 3] << 24)) >>> 0 : ((bytes[p] << 24) | (bytes[p + 1] << 16) | (bytes[p + 2] << 8) | bytes[p + 3]) >>> 0;
      const str = (count: number, valueOffset: number, entry: number) => {
        const at = count <= 4 ? entry + 8 : tiff + valueOffset;
        return ascii(bytes, at, at + Math.min(count, 120)).replace(/\s+$/, "").trim();
      };
      const readIfd = (ifd: number, onTag: (tag: number, entry: number) => void) => {
        if (ifd <= tiff || ifd + 2 > bytes.length) return;
        const count = u16(ifd);
        for (let i = 0; i < count && i < 200; i++) {
          const entry = ifd + 2 + i * 12;
          if (entry + 12 > bytes.length) break;
          onTag(u16(entry), entry);
        }
      };
      let exifIfd = 0;
      readIfd(tiff + u32(tiff + 4), (tag, entry) => {
        const count = u32(entry + 4); const value = u32(entry + 8);
        if (tag === 0x010f) found.make = str(count, value, entry);
        if (tag === 0x0110) found.model = str(count, value, entry);
        if (tag === 0x0131) found.software = str(count, value, entry);
        if (tag === 0x8769) exifIfd = tiff + value;
      });
      readIfd(exifIfd, (tag, entry) => {
        if (tag === 0x9003) found.taken = str(u32(entry + 4), u32(entry + 8), entry);
      });
      return found;
    }
    if (marker === 0xda) break;
    offset += 2 + length;
  }
  return found;
}

export function inspectPhoto(bytes: Uint8Array, fileType: string, width: number, height: number): PhotoCheck {
  const signals: PhotoSignal[] = [];
  const text = ascii(bytes, 0, 512 * 1024) + ascii(bytes, Math.max(0, bytes.length - 128 * 1024), bytes.length);
  const exif = readExif(bytes);
  const camera = [exif.make, exif.model].filter(Boolean).join(" ") || null;
  const software = exif.software || (text.match(/CreatorTool[="> ]+([^"<]{2,60})/)?.[1] ?? null);
  let score = 30;
  let verdict = "";

  for (const [pattern, label] of AI_MARKERS) {
    if (pattern.test(text)) { signals.push({ level: "high", text: label }); score = Math.max(score, 90); verdict ||= "AI로 만들었을 가능성이 높아요"; }
  }
  if (/c2pa\.(claim|assertions|actions|ingredient)/i.test(text)) {
    const edited = /c2pa\.ingredient|c2pa\.opened/i.test(text);
    signals.push({ level: "high", text: edited ? "원본 사진을 AI 도구로 편집했다는 출처 기록(C2PA)이 있어요" : "AI 도구를 거쳤다는 출처 기록(C2PA)이 있어요" });
    score = Math.max(score, 80);
    verdict ||= edited ? "AI 도구로 편집한 사진이에요" : "AI 도구를 거친 사진이에요";
  }
  if (/parameters.{0,2000}?(Steps|Sampler|CFG scale)/i.test(text) || /"prompt"\s*:\s*\{/.test(text)) {
    signals.push({ level: "high", text: "AI 생성 설정값(프롬프트·샘플러)이 남아 있어요" });
    score = Math.max(score, 95);
    verdict = "AI로 만든 이미지예요";
  }
  const allText = `${software ?? ""} ${text}`;
  const retouch = allText.match(RETOUCH_APPS);
  if (retouch) { signals.push({ level: "high", text: `얼굴 보정 앱(${retouch[0]}) 흔적이 있어요` }); score = Math.max(score, 75); verdict ||= "보정 앱을 거친 사진이에요"; }
  const editor = allText.match(EDITORS);
  if (editor) { signals.push({ level: "mid", text: `편집 프로그램(${editor[0]})으로 저장한 사진이에요` }); score = Math.max(score, 55); }

  if (camera) {
    signals.push({ level: "low", text: `촬영 기기 정보가 남아 있어요 (${camera})` });
    if (!retouch && !editor && score <= 30) score = 15;
  } else {
    signals.push({ level: "info", text: "촬영 기기 정보가 없어요. SNS에서 받은 사진·캡처본이면 원래 지워져 있어 판단이 어려워요" });
  }
  if (exif.taken) signals.push({ level: "low", text: `촬영 시각: ${exif.taken.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1.$2.$3")}` });
  if (fileType === "image/png" && !camera) signals.push({ level: "info", text: "PNG 파일이에요. 화면 캡처나 생성 이미지에 흔한 형식이에요" });
  if (width && height && width === height && [512, 768, 1024, 1536, 2048].includes(width)) {
    signals.push({ level: "mid", text: `${width}×${height} 정사각형이에요. AI 생성 이미지에 흔한 크기예요` });
    score = Math.max(score, 50);
  }

  verdict ||= score >= 50 ? "편집 흔적이 있어요" : camera ? "원본 촬영 정보가 남아 있어요" : "숨은 정보만으로는 판단하기 어려워요";
  return { score, verdict, signals, camera, software, taken: exif.taken ?? null };
}

/** 화면 어디서든 탱글 AI 상담 챗봇을 엽니다. */
export const OPEN_CHAT_EVENT = "tangle:open-chat";
export function openTangleChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

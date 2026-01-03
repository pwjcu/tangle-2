"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "bot", text: "안녕하세요! 피부 고민이 있으신가요? 저에게 물어보세요! 🤖" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 오면 스크롤 내리기
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "오류가 발생했어요." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 채팅창 화면 */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-pink-500 p-4 text-white font-bold flex justify-between">
            <span>탱글 AI 상담사</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">✕</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === "user" ? "bg-pink-500 text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none shadow-sm"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 text-center">답변 생각 중...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="예: 팔자주름엔 뭐가 좋아?"
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-pink-500"
            />
            <button onClick={sendMessage} className="bg-pink-500 text-white rounded-full p-2 hover:bg-pink-600 w-10 h-10 flex items-center justify-center">
              ➤
            </button>
          </div>
        </div>
      )}

      {/* 둥둥 떠있는 버튼 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-pink-500 hover:bg-pink-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-3xl transition-transform hover:scale-110"
      >
        💬
      </button>
    </div>
  );
}
import type { Metadata } from "next";
import GlobalGuide from "./글로벌안내";

export const metadata: Metadata = {
  title: "Global patient guide — documents, tips and partner clinics in Seoul",
  description:
    "Visiting a clinic in Korea? Documents to bring, what to check before you go, consultation tips, aftercare and a Korean card to show clinic staff. English, 中文, 日本語, ไทย, 한국어.",
  alternates: { canonical: "/global" },
};

export default function GlobalPage() {
  return <GlobalGuide />;
}

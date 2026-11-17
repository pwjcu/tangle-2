import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 모델 사진은 85로 조금 더 선명하게 내보냅니다.
    qualities: [75, 85],
  },
};

export default nextConfig;

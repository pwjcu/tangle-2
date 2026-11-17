/** 피부·성형·치과 카드 사진. 사진을 바꿀 때는 public/images의 같은 파일명으로 덮어쓰고, 얼굴 위치만 여기서 맞추면 됩니다. */
export const categoryImages: Record<string, { src: string; focus: string }> = {
  skin: { src: "/images/cat-skin.webp", focus: "50% 10%" },
  surgery: { src: "/images/cat-surgery.webp", focus: "50% 48%" },
  dental: { src: "/images/cat-dental.webp", focus: "50% 38%" },
};

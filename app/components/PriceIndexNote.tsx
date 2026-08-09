export default function PriceIndexNote() {
  return (
    <aside
      style={{
        border: "1px solid var(--color-line)",
        borderRadius: "14px",
        padding: "20px",
        background: "var(--color-porcelain-gray)",
        display: "grid",
        gap: "10px",
      }}
    >
      <h2
        className="type-section"
        style={{ fontSize: "16px", color: "var(--color-carbon)", margin: 0 }}
      >
        안내 — 가격 데이터를 읽는 방법
      </h2>
      <ul
        style={{
          margin: 0,
          paddingLeft: "18px",
          display: "grid",
          gap: "6px",
          fontSize: "13px",
          lineHeight: 1.7,
          color: "var(--color-muted)",
        }}
      >
        <li>
          이 지수는 병원이 공개한 가격표·이벤트 화면을 수집해 정리한 참고용 정보로, 의료광고나 특정
          병원에 대한 추천이 아닙니다.
        </li>
        <li>
          병원명은 공개하지 않습니다. 현재 지역 범위는 강남권(강남·서초·송파) 수집분입니다.
        </li>
        <li>
          중위값·범위는 1회·세션 환산가 기준이며, 부위·샷 수·제품 용량·의료진에 따라 실제 비용은
          달라질 수 있습니다.
        </li>
        <li>
          이벤트가는 기간 종료 후 변경될 수 있고, VAT 포함 여부는 수집 원문 표기를 따릅니다. 각 근거의
          수집일을 함께 표기합니다.
        </li>
        <li>최종 비용과 적합 여부는 반드시 병원 상담에서 확인하세요.</li>
      </ul>
    </aside>
  );
}

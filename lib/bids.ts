interface BidCommentInput {
  plan: string;
  reason: string;
  reservation: string;
}

export function buildBidComment({ plan, reason, reservation }: BidCommentInput) {
  return [
    `추천 시술: ${plan.trim()}`,
    `제안 이유: ${reason.trim()}`,
    `예약 안내: ${reservation.trim()}`,
  ].join("\n");
}

export function parseBidComment(comment: string) {
  const lines = comment.split("\n").map((line) => line.trim()).filter(Boolean);
  const parsed = {
    plan: "",
    reason: "",
    reservation: "",
    raw: comment,
  };

  for (const line of lines) {
    if (line.startsWith("추천 시술:")) {
      parsed.plan = line.replace("추천 시술:", "").trim();
      continue;
    }
    if (line.startsWith("제안 이유:")) {
      parsed.reason = line.replace("제안 이유:", "").trim();
      continue;
    }
    if (line.startsWith("예약 안내:")) {
      parsed.reservation = line.replace("예약 안내:", "").trim();
    }
  }

  if (!parsed.plan && !parsed.reason && !parsed.reservation) {
    parsed.reason = comment;
  }

  return parsed;
}

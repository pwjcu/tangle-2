interface BidCommentInput {
  plan: string;
  reason: string;
  reservation: string;
}

const PLAN_PREFIXES = ["추천 시술:", "추천 시술 :"];
const REASON_PREFIXES = ["제안 이유:", "제안 이유 :"];
const RESERVATION_PREFIXES = ["예약 안내:", "예약 안내 :"];

function stripPrefix(line: string, prefixes: string[]) {
  for (const prefix of prefixes) {
    if (line.startsWith(prefix)) {
      return line.replace(prefix, "").trim();
    }
  }

  return "";
}

export function buildBidComment({ plan, reason, reservation }: BidCommentInput) {
  return [
    `추천 시술: ${plan.trim()}`,
    `제안 이유: ${reason.trim()}`,
    `예약 안내: ${reservation.trim()}`,
  ].join("\n");
}

export function parseBidComment(comment: string) {
  const lines = comment
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = {
    plan: "",
    reason: "",
    reservation: "",
    raw: comment,
  };

  for (const line of lines) {
    const plan = stripPrefix(line, PLAN_PREFIXES);
    if (plan) {
      parsed.plan = plan;
      continue;
    }

    const reason = stripPrefix(line, REASON_PREFIXES);
    if (reason) {
      parsed.reason = reason;
      continue;
    }

    const reservation = stripPrefix(line, RESERVATION_PREFIXES);
    if (reservation) {
      parsed.reservation = reservation;
    }
  }

  if (!parsed.plan && !parsed.reason && !parsed.reservation) {
    parsed.reason = comment;
  }

  return parsed;
}

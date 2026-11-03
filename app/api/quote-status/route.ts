import { quoteResponse, quoteWorkflowEnabled } from "../../../lib/견적서버";
export const dynamic = "force-dynamic";
export function GET() { return quoteResponse({ enabled: quoteWorkflowEnabled() }); }

import { NextResponse } from "next/server";
import { getDokuConfig } from "@/lib/payments/doku";

export async function GET() {
  const clientId = process.env.DOKU_CLIENT_ID || "NOT_SET";
  const secretKey = process.env.DOKU_SECRET_KEY || "NOT_SET";
  const baseUrl = process.env.DOKU_BASE_URL || "NOT_SET";
  const nodeEnv = process.env.NODE_ENV || "NOT_SET";

  // Get resolved config
  const resolved = getDokuConfig();

  // Securely mask keys
  const mask = (str: string) => {
    if (str === "NOT_SET" || !str) return "NOT_SET";
    if (str.length <= 8) return "***";
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  return NextResponse.json({
    raw_env: {
      doku_client_id: mask(clientId),
      doku_secret_key: mask(secretKey),
      doku_base_url: baseUrl,
      node_env: nodeEnv,
      raw_client_id_prefix: clientId.slice(0, 8),
      raw_secret_prefix: secretKey.slice(0, 5),
    },
    resolved_config: {
      clientId: mask(resolved.clientId),
      secretKey: mask(resolved.secretKey),
      baseUrl: resolved.baseUrl,
      raw_client_id_prefix: resolved.clientId.slice(0, 8),
    }
  });
}

import type { Metadata } from "next";
import type { RankMathConfig } from "@/lib/rank-math-config";

/** Strip full meta tag HTML if pasted; return bare verification code. */
export function normalizeVerificationCode(value?: string | null): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const contentMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (contentMatch) return contentMatch[1].trim();
  return trimmed.replace(/^<meta[^>]*>/i, "").trim();
}

/** Webmaster verification tags for root layout — must match admin Rank Math → Webmaster. */
export function buildWebmasterVerificationMetadata(
  webmaster: RankMathConfig["webmaster"]
): Pick<Metadata, "verification" | "other"> {
  const google = normalizeVerificationCode(
    webmaster.google_verification || process.env.GOOGLE_SITE_VERIFICATION
  );
  const bing = normalizeVerificationCode(webmaster.bing_verification);
  const yandex = normalizeVerificationCode(webmaster.yandex_verification);
  const pinterest = normalizeVerificationCode(webmaster.pinterest_verification);

  const verification: NonNullable<Metadata["verification"]> = {};
  if (google) verification.google = google;
  if (yandex) verification.yandex = yandex;

  const other: Record<string, string> = {};
  if (bing) other["msvalidate.01"] = bing;
  if (pinterest) other["p:domain_verify"] = pinterest;
  // Belt-and-suspenders: some crawlers only read name= yandex-verification via other
  if (yandex) other["yandex-verification"] = yandex;

  return {
    ...(Object.keys(verification).length ? { verification } : {}),
    ...(Object.keys(other).length ? { other } : {}),
  };
}

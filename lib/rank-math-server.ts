import { query } from "@/lib/db";
import {
  DEFAULT_RANK_MATH_CONFIG,
  parseRankMathConfig,
  RANK_MATH_SETTINGS_KEY,
  type RankMathConfig,
} from "@/lib/rank-math-config";
import { normalizeVerificationCode } from "@/lib/rank-math-webmaster";

let cached: { value: RankMathConfig; at: number } | null = null;
/** Admin saves must reflect on public site immediately — no stale cache. */
const CACHE_MS = 0;

export async function getRankMathConfig(): Promise<RankMathConfig> {
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.value;
  }

  try {
    const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [
      RANK_MATH_SETTINGS_KEY,
    ]);
    const config = parseRankMathConfig(rows[0]?.setting_value);
    cached = { value: config, at: Date.now() };
    return config;
  } catch {
    return { ...DEFAULT_RANK_MATH_CONFIG };
  }
}

export function clearRankMathConfigCache() {
  cached = null;
}

export async function saveRankMathConfig(config: RankMathConfig) {
  const normalized: RankMathConfig = {
    ...config,
    webmaster: {
      ...config.webmaster,
      google_verification: normalizeVerificationCode(config.webmaster.google_verification),
      bing_verification: normalizeVerificationCode(config.webmaster.bing_verification),
      yandex_verification: normalizeVerificationCode(config.webmaster.yandex_verification),
      pinterest_verification: normalizeVerificationCode(config.webmaster.pinterest_verification),
    },
  };
  await query(
    `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [RANK_MATH_SETTINGS_KEY, JSON.stringify(normalized)]
  );
  clearRankMathConfigCache();
}

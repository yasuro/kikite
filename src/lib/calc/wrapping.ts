/**
 * ラッピング料計算ロジック
 *
 * 1明細あたり「通常のし（有料）」と「フル包装（有料）」の合算上限は税込305円
 * - いずれか一方でも、両方選択しても、1明細あたり最大305円
 */

const MAX_WRAPPING_FEE_PER_LINE = 305;
const NOSHI_FEE = 305; // 通常のし料金
const FULL_WRAPPING_FEE = 305; // フル包装料金

export interface WrappingInput {
  noshiType: string | null; // "なし" | "シールのし" | "通常のし"
  wrappingType: string | null; // "なし" | "簡易包装" | "フル包装"
}

export function calculateWrappingFee(input: WrappingInput): number {
  // 簡易包装の場合は無料（シールのしも無料対応）
  if (input.wrappingType === "簡易包装") {
    return 0;
  }

  let fee = 0;

  // のしタイプがnullまたは"なし"の場合は料金なし
  if (input.noshiType && input.noshiType !== "なし" && input.noshiType === "通常のし") {
    fee += NOSHI_FEE;
  }

  // ラッピングタイプがnullまたは"なし"の場合は料金なし
  if (input.wrappingType && input.wrappingType !== "なし" && input.wrappingType === "フル包装") {
    fee += FULL_WRAPPING_FEE;
  }

  // 上限305円で正規化
  return Math.min(fee, MAX_WRAPPING_FEE_PER_LINE);
}

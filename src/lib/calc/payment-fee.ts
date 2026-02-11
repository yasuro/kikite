/**
 * 支払方法別手数料計算ロジック
 *
 * 代金引換: 金額帯別手数料（300,000円以上は受付不可）
 * 後払い: 一律250円
 * クレジットカード・銀行振込: 0円
 */

export type PaymentMethod = "代金引換" | "クレジットカード" | "銀行振込" | "後払い";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "代金引換",
  "クレジットカード",
  "銀行振込",
  "後払い",
];

const COD_FEE_TABLE: { max: number; fee: number }[] = [
  { max: 9999, fee: 330 },
  { max: 29999, fee: 440 },
  { max: 99999, fee: 660 },
  { max: 299999, fee: 1100 },
];

const COD_MAX_AMOUNT = 300000;
const DEFERRED_PAYMENT_FEE = 250;

export interface PaymentFeeResult {
  fee: number;
  error?: string; // 代引上限超過時のエラーメッセージ
}

export function calculatePaymentFee(
  method: PaymentMethod,
  totalBeforeFee: number
): PaymentFeeResult {
  switch (method) {
    case "代金引換": {
      if (totalBeforeFee >= COD_MAX_AMOUNT) {
        return {
          fee: 0,
          error: "代金引換は30万円以上のご注文にはご利用いただけません",
        };
      }
      const entry = COD_FEE_TABLE.find((e) => totalBeforeFee <= e.max);
      return { fee: entry?.fee ?? 1100 };
    }
    case "後払い":
      return { fee: DEFERRED_PAYMENT_FEE };
    case "クレジットカード":
    case "銀行振込":
      return { fee: 0 };
    default:
      return { fee: 0 };
  }
}

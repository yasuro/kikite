/**
 * 注文金額の一括計算
 * フロントエンド・サーバーサイド両方で使用する共通ロジック
 */

import {
  calculateShippingFees,
  type ShippingDetail,
} from "./shipping";
import { calculateWrappingFee, type WrappingInput } from "./wrapping";
import {
  calculatePaymentFee,
  type PaymentMethod,
} from "./payment-fee";

export interface DetailForCalc {
  lineIndex: number;
  unitPrice: number;
  quantity: number;
  deliveryPostalCode: string;
  deliveryAddress1: string;
  deliveryName: string;
  isFreeShipping: boolean;
  noshiType: string | null;
  wrappingType: string | null;
}

export interface CalcResult {
  lineTotals: number[]; // 各明細の小計
  shippingFees: number[]; // 各明細の送料
  wrappingFees: number[]; // 各明細のラッピング料
  subtotal: number; // 受注小計
  totalShippingFee: number; // 送料合計
  totalWrappingFee: number; // ラッピング料合計
  totalFee: number; // 手数料
  totalAmount: number; // 受注合計
  paymentFeeError?: string; // 代引上限エラー
}

export function calculateOrderTotal(
  details: DetailForCalc[],
  paymentMethod: PaymentMethod,
  discount: number = 0,
  defaultShippingFee: number = 880,
  freeShippingThreshold: number = 5000
): CalcResult {
  // 1. 各明細の小計
  const lineTotals = details.map((d) => d.unitPrice * d.quantity);

  // 2. 送料計算
  const shippingDetails: ShippingDetail[] = details.map((d, i) => ({
    lineIndex: d.lineIndex,
    deliveryPostalCode: d.deliveryPostalCode,
    deliveryAddress1: d.deliveryAddress1,
    deliveryName: d.deliveryName,
    lineTotal: lineTotals[i],
    isFreeShipping: d.isFreeShipping,
  }));

  const shippingResults = calculateShippingFees(
    shippingDetails,
    defaultShippingFee,
    freeShippingThreshold
  );
  const shippingFees = details.map((d) => {
    const result = shippingResults.find((r) => r.lineIndex === d.lineIndex);
    return result?.shippingFee ?? 0;
  });

  // 3. ラッピング料計算
  const wrappingFees = details.map((d) => {
    const input: WrappingInput = {
      noshiType: d.noshiType,
      wrappingType: d.wrappingType,
    };
    return calculateWrappingFee(input);
  });

  // 4. 集計
  const subtotal = lineTotals.reduce((sum, v) => sum + v, 0);
  const totalShippingFee = shippingFees.reduce((sum, v) => sum + v, 0);
  const totalWrappingFee = wrappingFees.reduce((sum, v) => sum + v, 0);

  // 5. 手数料計算（手数料計算前の合計 = 小計 + 送料 + ラッピング - 値引き）
  const totalBeforeFee = subtotal + totalShippingFee + totalWrappingFee - discount;
  const paymentFeeResult = calculatePaymentFee(paymentMethod, totalBeforeFee);

  // 6. 受注合計
  const totalAmount = totalBeforeFee + paymentFeeResult.fee;

  return {
    lineTotals,
    shippingFees,
    wrappingFees,
    subtotal,
    totalShippingFee,
    totalWrappingFee,
    totalFee: paymentFeeResult.fee,
    totalAmount,
    paymentFeeError: paymentFeeResult.error,
  };
}

/**
 * 送料計算ロジック
 *
 * DeliveryKey = 郵便番号 | 住所1 | 氏名
 * 同一DeliveryKeyグループ内の判定:
 * 1. グループ合計 >= 送料無料閾値 → 全行送料0
 * 2. グループ内に送料無料商品あり → 全行送料0
 * 3. それ以外 → 代表行（最小line_number）にデフォルト送料、他は0
 */

export interface ShippingDetail {
  lineIndex: number;
  deliveryPostalCode: string;
  deliveryAddress1: string;
  deliveryName: string;
  lineTotal: number;
  isFreeShipping: boolean;
}

export interface ShippingResult {
  lineIndex: number;
  shippingFee: number;
}

export function buildDeliveryKey(
  postalCode: string,
  address1: string,
  name: string
): string {
  return `${postalCode}|${address1}|${name}`;
}

export function calculateShippingFees(
  details: ShippingDetail[],
  defaultShippingFee: number = 880,
  freeShippingThreshold: number = 5000
): ShippingResult[] {
  // DeliveryKey でグルーピング
  const groups = new Map<string, ShippingDetail[]>();

  for (const detail of details) {
    const key = buildDeliveryKey(
      detail.deliveryPostalCode,
      detail.deliveryAddress1,
      detail.deliveryName
    );
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(detail);
  }

  const results: ShippingResult[] = details.map((d) => ({
    lineIndex: d.lineIndex,
    shippingFee: 0,
  }));

  for (const [, group] of groups) {
    const groupTotal = group.reduce((sum, d) => sum + d.lineTotal, 0);
    const hasFreeShippingProduct = group.some((d) => d.isFreeShipping);

    // 送料無料判定
    if (groupTotal >= freeShippingThreshold || hasFreeShippingProduct) {
      // 全行0円（デフォルト値のまま）
      continue;
    }

    // 代表行（最小lineIndex）に送料を設定
    const representative = group.reduce((min, d) =>
      d.lineIndex < min.lineIndex ? d : min
    );
    const resultIdx = results.findIndex(
      (r) => r.lineIndex === representative.lineIndex
    );
    if (resultIdx !== -1) {
      results[resultIdx].shippingFee = defaultShippingFee;
    }
  }

  return results;
}

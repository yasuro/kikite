"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryProps {
  subtotal: number;
  totalShippingFee: number;
  totalWrappingFee: number;
  totalFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentFeeError?: string;
  detailCount: number;
}

export function OrderSummary({
  subtotal,
  totalShippingFee,
  totalWrappingFee,
  totalFee,
  discount,
  totalAmount,
  paymentMethod,
  paymentFeeError,
  detailCount,
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">金額サマリー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">商品点数</span>
            <span>{detailCount}点</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">受注小計</span>
            <span className="font-mono">¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">送料合計</span>
            <span className="font-mono">
              ¥{totalShippingFee.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ラッピング料合計</span>
            <span className="font-mono">
              ¥{totalWrappingFee.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              手数料（{paymentMethod || "未選択"}）
            </span>
            <span className="font-mono">¥{totalFee.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>値引き</span>
              <span className="font-mono">
                -¥{discount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold">受注合計</span>
          <span className="text-xl font-bold font-mono">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>

        {paymentFeeError && (
          <div className="p-2 text-xs text-red-600 bg-red-50 rounded">
            {paymentFeeError}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface DetailSummary {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  delivery_name: string;
  delivery_address1?: string;
}

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
  details?: DetailSummary[];
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
  details = [],
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

      {/* 商品明細サマリー */}
      {details.length > 0 && (
        <>
          <Separator />
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-base">明細サマリー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {details.map((detail, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-gray-50 rounded border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <span className="font-mono text-gray-600">
                        {detail.product_code}
                      </span>
                      <span className="ml-2 font-medium">
                        {detail.product_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">
                        {detail.quantity}個
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600">
                      <span>配送先: {detail.delivery_name}</span>
                      {detail.delivery_address1 && (
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                          {detail.delivery_address1}
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-right">
                      ¥{(detail.unit_price * detail.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

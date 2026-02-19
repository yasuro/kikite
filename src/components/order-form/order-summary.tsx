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
      <CardHeader className="pb-2">
        <CardTitle className="text-base">金額サマリー</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
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
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-base">明細サマリー</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(() => {
                // 配送先ごとにグルーピング
                const groupedDetails = details.reduce((acc, detail) => {
                  const key = `${detail.delivery_name}_${detail.delivery_address1 || ''}`;
                  if (!acc[key]) {
                    acc[key] = {
                      delivery_name: detail.delivery_name,
                      delivery_address1: detail.delivery_address1,
                      items: []
                    };
                  }
                  acc[key].items.push(detail);
                  return acc;
                }, {} as Record<string, {
                  delivery_name: string;
                  delivery_address1?: string;
                  items: DetailSummary[];
                }>);

                return Object.entries(groupedDetails).map(([key, group], groupIndex) => (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* 配送先ヘッダー */}
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          配送先 {groupIndex + 1}: {group.delivery_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {group.items.length}点
                        </div>
                      </div>
                      {group.delivery_address1 && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {group.delivery_address1}
                        </div>
                      )}
                    </div>
                    
                    {/* 商品リスト */}
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="px-3 py-2 text-xs">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="font-mono text-gray-600">
                                {item.product_code}
                              </span>
                              <span className="ml-2">
                                {item.product_name}
                              </span>
                            </div>
                            <div className="text-right ml-2">
                              <div className="font-mono">
                                {item.quantity}個
                              </div>
                              <div className="font-mono text-gray-600">
                                ¥{(item.unit_price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 配送先小計 */}
                    <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium">配送先小計</span>
                        <span className="font-mono font-medium">
                          ¥{group.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

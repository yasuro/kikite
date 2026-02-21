"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerSimple } from "@/components/ui/date-picker-simple";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [earlyPriceDeadline, setEarlyPriceDeadline] = useState<Date | undefined>(undefined);
  const [defaultShippingFee, setDefaultShippingFee] = useState(880);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);

  // 設定読み込み
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const s = data.settings;

        if (s.early_price_deadline) {
          // ISO文字列→Date形式に変換
          const d = new Date(s.early_price_deadline);
          setEarlyPriceDeadline(d);
        }
        if (s.default_shipping_fee) {
          setDefaultShippingFee(parseInt(s.default_shipping_fee));
        }
        if (s.free_shipping_threshold) {
          setFreeShippingThreshold(parseInt(s.free_shipping_threshold));
        }
      } catch {
        toast.error("設定の読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 保存
  const handleSave = async () => {
    if (!earlyPriceDeadline) {
      toast.error("早割適用期限を設定してください");
      return;
    }
    if (defaultShippingFee < 0) {
      toast.error("送料は0以上で設定してください");
      return;
    }
    if (freeShippingThreshold < 0) {
      toast.error("送料無料閾値は0以上で設定してください");
      return;
    }

    setSaving(true);
    try {
      // Date → ISO文字列
      const isoDeadline = earlyPriceDeadline.toISOString();

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            early_price_deadline: isoDeadline,
            default_shipping_fee: String(defaultShippingFee),
            free_shipping_threshold: String(freeShippingThreshold),
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "保存に失敗しました");
      }

      toast.success("設定を保存しました");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "保存に失敗しました";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // 早割が現在有効かどうか判定
  const isEarlyActive = earlyPriceDeadline
    ? earlyPriceDeadline > new Date()
    : false;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">設定</h1>

      {/* 早割設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">早割価格設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>早割適用期限</Label>
            <DatePickerSimple
              value={earlyPriceDeadline}
              onChange={(date) => setEarlyPriceDeadline(date)}
              placeholder="早割適用期限を選択"
            />
            <div className="mt-2">
              {isEarlyActive ? (
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                  現在、早割期間中です
                </span>
              ) : (
                <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  早割期間は終了しています
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 送料設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">送料設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>デフォルト送料（税込・円）</Label>
            <Input
              type="number"
              min={0}
              value={defaultShippingFee}
              onChange={(e) =>
                setDefaultShippingFee(parseInt(e.target.value) || 0)
              }
              className="font-mono max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              配送先グループの代表行に適用される送料です。
            </p>
          </div>
          <div>
            <Label>送料無料閾値（税込・円）</Label>
            <Input
              type="number"
              min={0}
              value={freeShippingThreshold}
              onChange={(e) =>
                setFreeShippingThreshold(parseInt(e.target.value) || 0)
              }
              className="font-mono max-w-xs"
            />
            <p className="text-xs text-gray-500 mt-1">
              同一配送先グループの合計がこの金額以上で送料無料になります。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              設定を保存
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

export default function CsvExportPage() {
  // デフォルト: 今月1日〜今日
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(firstDay));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // プレビュー（件数確認）
  const handlePreview = async () => {
    if (!startDate || !endDate) {
      toast.error("開始日と終了日を指定してください");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/csv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (res.status === 404) {
        setPreviewCount(0);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "プレビューに失敗しました");
      }

      // CSVの行数からデータ件数を計算（ヘッダー1行を除外）
      const text = await res.text();
      const lines = text.trim().split("\n").length - 1; // BOM+ヘッダー除外
      setPreviewCount(lines);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "プレビューに失敗しました";
      toast.error(message);
      setPreviewCount(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  // CSV出力（ダウンロード）
  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error("開始日と終了日を指定してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/csv/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      if (res.status === 404) {
        toast.error("指定期間の対象データがありません");
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "CSV出力に失敗しました");
      }

      // ファイルダウンロード
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition") || "";
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "orders.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("CSVファイルをダウンロードしました");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "CSV出力に失敗しました";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">CSV出力</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">出力条件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>開始日</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPreviewCount(null);
                }}
              />
            </div>
            <div>
              <Label>終了日</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPreviewCount(null);
                }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            商品コード「9999」の明細は自動的に除外されます。
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  確認中...
                </>
              ) : (
                "件数を確認"
              )}
            </Button>

            {previewCount !== null && (
              <span className="text-sm">
                {previewCount === 0 ? (
                  <span className="text-amber-600">
                    対象データがありません
                  </span>
                ) : (
                  <span>
                    出力対象: <strong>{previewCount}</strong> 明細行
                  </span>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={loading || previewCount === 0}
          className="min-w-40"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              出力中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              CSV出力
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

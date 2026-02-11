import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// CSV項目ヘッダー（全55列）
const CSV_HEADERS = [
  "受注番号",
  "受注日",
  "受注チャネル",
  "受注担当者メール",
  "受注担当者名",
  "注文者氏名",
  "注文者氏名カナ",
  "注文者電話番号",
  "注文者メール",
  "注文者郵便番号",
  "注文者都道府県",
  "注文者住所１",
  "注文者住所２",
  "注文者会社名",
  "注文者部署名",
  "支払方法",
  "受注メモ",
  "明細行番号",
  "商品コード",
  "商品名",
  "SKU",
  "単価（税込）",
  "数量",
  "明細金額（税込）",
  "お届け先氏名",
  "お届け先氏名カナ",
  "お届け先電話番号",
  "お届け先郵便番号",
  "お届け先都道府県",
  "お届け先住所１",
  "お届け先住所２",
  "お届け先会社名",
  "お届け先部署名",
  "お届け希望日",
  "お届け時間帯",
  "配送方法",
  "送料（税込）",
  "配送メモ",
  "熨斗あり",
  "熨斗位置",
  "熨斗種類（選択）",
  "熨斗種類（自由入力）",
  "熨斗表書き",
  "熨斗名入れ",
  "ギフト包装",
  "ラッピング種別",
  "ラッピング料（税込）",
  "メッセージカード",
  "明細メモ",
  "受注小計（税込）",
  "受注送料合計（税込）",
  "受注ラッピング料合計（税込）",
  "手数料合計（税込）",
  "値引き（税込）",
  "受注合計（税込）",
];

function formatDatetime(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return dateStr; // YYYY-MM-DD形式のまま
}

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // カンマ、ダブルクオート、改行を含む場合はダブルクオートで囲む
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function boolToText(flag: boolean | null): string {
  return flag ? "あり" : "なし";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // リクエストボディ
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です" },
      { status: 400 }
    );
  }

  const { start_date, end_date } = body;
  if (!start_date || !end_date) {
    return NextResponse.json(
      { error: "開始日と終了日を指定してください" },
      { status: 400 }
    );
  }

  // 日付範囲で受注を取得（end_dateは当日末まで含む）
  const endDateEnd = `${end_date}T23:59:59.999+09:00`;
  const startDateBegin = `${start_date}T00:00:00.000+09:00`;

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .gte("order_datetime", startDateBegin)
    .lte("order_datetime", endDateEnd)
    .order("order_datetime", { ascending: true });

  if (ordersError) {
    return NextResponse.json(
      { error: `受注データの取得に失敗しました: ${ordersError.message}` },
      { status: 500 }
    );
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json(
      { error: "指定期間の対象データがありません", count: 0 },
      { status: 404 }
    );
  }

  // 全受注の明細を一括取得
  const orderIds = orders.map((o) => o.id);
  const { data: allDetails, error: detailsError } = await supabase
    .from("order_details")
    .select("*")
    .in("order_id", orderIds)
    .neq("product_code", "9999") // 商品コード9999を除外
    .order("line_number", { ascending: true });

  if (detailsError) {
    return NextResponse.json(
      { error: `明細データの取得に失敗しました: ${detailsError.message}` },
      { status: 500 }
    );
  }

  // 受注IDでグルーピング
  const detailsByOrder = new Map<string, typeof allDetails>();
  for (const detail of allDetails || []) {
    if (!detailsByOrder.has(detail.order_id)) {
      detailsByOrder.set(detail.order_id, []);
    }
    detailsByOrder.get(detail.order_id)!.push(detail);
  }

  // CSV行を生成
  const rows: string[] = [];

  // ヘッダー行
  rows.push(CSV_HEADERS.map(escapeCsvField).join(","));

  // データ行（明細展開方式）
  for (const order of orders) {
    const details = detailsByOrder.get(order.id) || [];

    // 9999除外後に明細がない場合はスキップ
    if (details.length === 0) continue;

    for (const detail of details) {
      const row = [
        order.order_number,                           // 1: 受注番号
        formatDatetime(order.order_datetime),          // 2: 受注日
        "電話",                                        // 3: 受注チャネル（固定値）
        order.operator_email,                          // 4: 受注担当者メール
        order.operator_name,                           // 5: 受注担当者名
        order.customer_name,                           // 6: 注文者氏名
        order.customer_name_kana,                      // 7: 注文者氏名カナ
        order.customer_phone,                          // 8: 注文者電話番号
        order.customer_email,                          // 9: 注文者メール
        order.postal_code,                             // 10: 注文者郵便番号
        order.prefecture,                              // 11: 注文者都道府県
        order.customer_address1,                       // 12: 注文者住所１
        order.customer_address2,                       // 13: 注文者住所２
        order.customer_company,                        // 14: 注文者会社名
        order.customer_department,                     // 15: 注文者部署名
        order.payment_method,                          // 16: 支払方法
        order.order_memo,                              // 17: 受注メモ
        detail.line_number,                            // 18: 明細行番号
        detail.product_code,                           // 19: 商品コード
        detail.product_name,                           // 20: 商品名
        "",                                            // 21: SKU（未使用）
        detail.unit_price,                             // 22: 単価（税込）
        detail.quantity,                               // 23: 数量
        detail.line_total,                             // 24: 明細金額（税込）
        detail.delivery_name,                          // 25: お届け先氏名
        detail.delivery_name_kana,                     // 26: お届け先氏名カナ
        detail.delivery_phone,                         // 27: お届け先電話番号
        detail.delivery_postal_code,                   // 28: お届け先郵便番号
        detail.delivery_prefecture,                    // 29: お届け先都道府県
        detail.delivery_address1,                      // 30: お届け先住所１
        detail.delivery_address2,                      // 31: お届け先住所２
        detail.delivery_company,                       // 32: お届け先会社名
        detail.delivery_department,                    // 33: お届け先部署名
        formatDate(detail.delivery_date),              // 34: お届け希望日
        detail.delivery_time,                          // 35: お届け時間帯
        detail.delivery_method,                        // 36: 配送方法
        detail.shipping_fee,                           // 37: 送料（税込）
        detail.delivery_memo,                          // 38: 配送メモ
        boolToText(detail.noshi_flag),                 // 39: 熨斗あり
        detail.noshi_position,                         // 40: 熨斗位置
        detail.noshi_type,                             // 41: 熨斗種類（選択）
        detail.noshi_inscription_custom,               // 42: 熨斗種類（自由入力）
        detail.noshi_inscription,                      // 43: 熨斗表書き
        detail.noshi_name,                             // 44: 熨斗名入れ
        boolToText(detail.wrapping_flag),              // 45: ギフト包装
        detail.wrapping_type,                          // 46: ラッピング種別
        detail.wrapping_fee,                           // 47: ラッピング料（税込）
        detail.message_card,                           // 48: メッセージカード
        detail.line_memo,                              // 49: 明細メモ
        order.subtotal,                                // 50: 受注小計（税込）
        order.total_shipping_fee,                      // 51: 受注送料合計（税込）
        order.total_wrapping_fee,                      // 52: 受注ラッピング料合計（税込）
        order.total_fee,                               // 53: 手数料合計（税込）
        order.discount > 0 ? -order.discount : 0,      // 54: 値引き（マイナス値で出力）
        order.total_amount,                            // 55: 受注合計（税込）
      ];

      rows.push(row.map(escapeCsvField).join(","));
    }
  }

  // BOM付きUTF-8 + CRLF
  const BOM = "\uFEFF";
  const csvContent = BOM + rows.join("\r\n") + "\r\n";

  // ファイル名生成
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const filename = `orders_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

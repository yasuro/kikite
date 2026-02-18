import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// 一度にインポートする件数
const BATCH_SIZE = 500;

interface PostalCodeData {
  postal_code: string;
  prefecture: string;
  city: string;
  town?: string;
  prefecture_kana?: string;
  city_kana?: string;
  town_kana?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // 管理者権限チェック（必要に応じて実装）
    // ここでは簡易的にメールアドレスでチェック
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // リクエストボディからデータ取得
    const { data, clear = false }: { data: PostalCodeData[]; clear?: boolean } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "データが不正です" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 既存データをクリアする場合
    if (clear) {
      const { error: deleteError } = await adminClient
        .from("postal_codes")
        .delete()
        .neq("id", 0); // すべて削除

      if (deleteError) {
        console.error("削除エラー:", deleteError);
        return NextResponse.json(
          { error: "既存データの削除に失敗しました" },
          { status: 500 }
        );
      }
    }

    // バッチ処理でインポート
    let totalImported = 0;
    let totalErrors = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);

      // データ整形
      const formattedBatch = batch.map((item) => ({
        postal_code: item.postal_code.replace(/-/g, ""), // ハイフン除去
        prefecture: item.prefecture,
        city: item.city,
        town: item.town || null,
        prefecture_kana: item.prefecture_kana || null,
        city_kana: item.city_kana || null,
        town_kana: item.town_kana || null,
      }));

      // Supabaseに挿入
      const { data: insertedData, error: insertError } = await adminClient
        .from("postal_codes")
        .upsert(formattedBatch, {
          onConflict: "postal_code",
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error(`バッチ ${i / BATCH_SIZE + 1} エラー:`, insertError);
        totalErrors += batch.length;
      } else {
        totalImported += batch.length;
      }

      // 進捗ログ
      if ((i + BATCH_SIZE) % 5000 === 0 || i + BATCH_SIZE >= data.length) {
        console.log(`進捗: ${Math.min(i + BATCH_SIZE, data.length)}/${data.length}件`);
      }
    }

    return NextResponse.json({
      success: true,
      totalImported,
      totalErrors,
      message: `${totalImported}件のデータをインポートしました（エラー: ${totalErrors}件）`,
    });
  } catch (error) {
    console.error("インポートエラー:", error);
    return NextResponse.json(
      { error: "データのインポート中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// データ件数を取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { count, error } = await supabase
      .from("postal_codes")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { error: "件数の取得に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: count || 0,
      message: `現在${count || 0}件のデータが登録されています`,
    });
  } catch (error) {
    console.error("件数取得エラー:", error);
    return NextResponse.json(
      { error: "件数の取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
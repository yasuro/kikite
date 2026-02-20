import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です" },
      { status: 400 }
    );
  }

  const { settings } = body;
  if (!settings || typeof settings !== "object") {
    return NextResponse.json(
      { error: "settings オブジェクトが必要です" },
      { status: 400 }
    );
  }

  // 各設定をupsert
  const allowedKeys = [
    "early_price_deadline",
    "default_shipping_fee",
    "free_shipping_threshold",
  ];

  for (const [key, value] of Object.entries(settings)) {
    if (!allowedKeys.includes(key)) continue;

    const { error } = await supabase
      .from("app_settings")
      .update({ value: String(value) })
      .eq("key", key);

    if (error) {
      return NextResponse.json(
        { error: `設定 "${key}" の更新に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

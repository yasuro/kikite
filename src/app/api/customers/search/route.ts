import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";

  if (q.length < 1) {
    return NextResponse.json({ customers: [] });
  }

  // 統合顧客番号または氏名で検索（有効な顧客のみ）
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("is_active", true)
    .or(`code.ilike.%${q}%,name.ilike.%${q}%`)
    .order("code")
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customers: data || [] });
}

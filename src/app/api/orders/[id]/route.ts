import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "受注が見つかりません" },
      { status: 404 }
    );
  }

  const { data: details } = await supabase
    .from("order_details")
    .select("*")
    .eq("order_id", id)
    .order("line_number");

  return NextResponse.json({ order, details: details || [] });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // 存在チェック
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", id)
    .single();

  if (!order) {
    return NextResponse.json(
      { error: "受注が見つかりません" },
      { status: 404 }
    );
  }

  // 削除（order_details は ON DELETE CASCADE で連動削除）
  const adminClient = createAdminClient();
  const { error } = await adminClient.from("orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: `削除に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

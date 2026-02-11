import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/order-form";

export default async function NewOrderPage() {
  const supabase = await createClient();

  // ログインユーザー情報
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const operatorName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "不明";
  const operatorEmail = user.email || "";

  // アプリ設定を取得
  const { data: settingsData } = await supabase
    .from("app_settings")
    .select("key, value");

  const settingsMap = new Map(
    (settingsData || []).map((s) => [s.key, s.value])
  );

  const settings = {
    defaultShippingFee: parseInt(settingsMap.get("default_shipping_fee") || "880"),
    freeShippingThreshold: parseInt(
      settingsMap.get("free_shipping_threshold") || "5000"
    ),
    earlyPriceDeadline:
      settingsMap.get("early_price_deadline") || "2025-11-28T23:59:59+09:00",
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">新規受注</h1>
      <OrderForm
        operatorName={operatorName}
        operatorEmail={operatorEmail}
        settings={settings}
      />
    </div>
  );
}

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const ALLOWED_DOMAIN = "aruno.co.jp";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // ドメインチェック
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || "";
      const domain = email.split("@")[1];

      if (domain !== ALLOWED_DOMAIN) {
        // 許可されていないドメインの場合はログアウトしてエラー表示
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=domain`
        );
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // エラー時はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/login?error=auth`);
}

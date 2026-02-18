import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 住所の正規化と分割処理
function parseAddress(address: string): { city: string; town: string } {
  // 全角数字を半角に変換
  let normalized = address.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );
  
  // ハイフンの統一
  normalized = normalized.replace(/[ー−－]/g, "-");
  
  // 番地部分を除去（最初の数字以降を除去）
  normalized = normalized.replace(/\d+.*$/, "").trim();
  
  // 市区町村と町名を分割
  let city = "";
  let town = "";
  
  // 政令指定都市の場合（〜市〜区）のパターンを先に処理
  const cityWithWardMatch = normalized.match(/^(.+?市.+?区)/);
  if (cityWithWardMatch) {
    city = cityWithWardMatch[1];
    town = normalized.substring(city.length).trim();
  } else {
    // 通常の市区町村を抽出（〜市、〜区、〜町、〜村）
    const cityMatch = normalized.match(/^(.+?[市区町村])/);
    if (cityMatch) {
      city = cityMatch[1];
      town = normalized.substring(city.length).trim();
    } else {
      city = normalized;
    }
  }
  
  return { city, town };
}

export async function POST(request: NextRequest) {
  try {
    const { prefecture, address } = await request.json();

    if (!prefecture || !address) {
      return NextResponse.json(
        { error: "都道府県と住所が必要です" },
        { status: 400 }
      );
    }

    // Supabaseクライアント作成
    const supabase = await createClient();

    // 住所をパース
    const { city, town } = parseAddress(address);
    
    console.log("検索対象:", { prefecture, city, town });
    
    // まず市区町村と町名の両方で検索
    let { data: postalCodes, error } = await supabase
      .from("postal_codes")
      .select("postal_code, prefecture, city, town")
      .eq("prefecture", prefecture)
      .eq("city", city)
      .limit(100);

    if (error) {
      console.error("郵便番号検索エラー:", error);
    }

    // 町名での絞り込み
    if (postalCodes && postalCodes.length > 0 && town) {
      // 完全一致を優先
      let bestMatch = postalCodes.find(pc => 
        pc.town && pc.town === town
      );
      
      // 完全一致がなければ部分一致
      if (!bestMatch) {
        bestMatch = postalCodes.find(pc => 
          pc.town && (pc.town.includes(town) || town.includes(pc.town))
        );
      }

      if (bestMatch) {
        return NextResponse.json({ 
          postalCode: bestMatch.postal_code,
          matched: true
        });
      }
    }

    // 市区町村のみで一致した場合
    if (postalCodes && postalCodes.length > 0) {
      // townがnullまたは空の郵便番号を優先（市区町村全体の郵便番号）
      const cityWideCode = postalCodes.find(pc => !pc.town || pc.town === "");
      if (cityWideCode) {
        return NextResponse.json({ 
          postalCode: cityWideCode.postal_code,
          partial: true,
          warning: "市区町村での一致です。正確な郵便番号を確認してください。"
        });
      }
      
      // 最初の結果を返す
      return NextResponse.json({ 
        postalCode: postalCodes[0].postal_code,
        partial: true,
        warning: "部分一致の結果です。正確な郵便番号を確認してください。"
      });
    }
    
    // データベースに登録がない場合は、フォールバック処理
    // 主要な地域の郵便番号（ハードコード）
    const fallbackMap: { [key: string]: string } = {
      "東京都千代田区千代田": "1000001",
      "東京都千代田区丸の内": "1000005",
      "東京都中央区銀座": "1040061",
      "東京都港区六本木": "1060032",
      "東京都新宿区西新宿": "1600023",
      "東京都渋谷区渋谷": "1500002",
      "大阪府大阪市北区梅田": "5300001",
      "愛知県名古屋市中村区名駅": "4500002",
      "福岡県福岡市博多区博多駅前": "8120011",
      "北海道札幌市中央区": "0600001",
    };
    
    for (const [key, value] of Object.entries(fallbackMap)) {
      if ((prefecture + city + town).includes(key)) {
        return NextResponse.json({ 
          postalCode: value,
          fallback: true
        });
      }
    }

    return NextResponse.json(
      { error: "該当する郵便番号が見つかりませんでした。手動で入力してください。" },
      { status: 404 }
    );
  } catch (error) {
    console.error("郵便番号検索エラー:", error);
    return NextResponse.json(
      { error: "郵便番号の検索中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
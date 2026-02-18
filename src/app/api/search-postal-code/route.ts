import { NextRequest, NextResponse } from "next/server";

interface HeartRailsLocation {
  prefecture: string;
  city: string;
  town: string;
  postal: string;
}

interface HeartRailsResponse {
  response: {
    location: HeartRailsLocation | HeartRailsLocation[];
    error?: string;
  };
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

    // 住所を結合して検索クエリを作成
    const searchQuery = encodeURIComponent(prefecture + address);

    const res = await fetch(
      `https://geoapi.heartrails.com/api/json?method=searchByAddress&address=${searchQuery}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "郵便番号の検索に失敗しました" },
        { status: 500 }
      );
    }

    const data: HeartRailsResponse = await res.json();

    if (data.response.error) {
      return NextResponse.json(
        { error: "該当する郵便番号が見つかりません" },
        { status: 404 }
      );
    }

    const location = data.response.location;

    if (!location) {
      return NextResponse.json(
        { error: "該当する郵便番号が見つかりません" },
        { status: 404 }
      );
    }

    // 配列の場合は最初の結果を使用
    const result = Array.isArray(location) ? location[0] : location;

    if (result && result.postal) {
      // ハイフンを除去して7桁の数字のみ返す
      const postalCode = result.postal.replace(/-/g, "");
      return NextResponse.json({ postalCode });
    }

    return NextResponse.json(
      { error: "該当する郵便番号が見つかりません" },
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
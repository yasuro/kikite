/**
 * HeartRails Geo API を使った住所→郵便番号逆引き
 */

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

export async function searchPostalCodeByAddress(
  prefecture: string,
  address: string
): Promise<string | null> {
  if (!prefecture || !address) {
    return null;
  }

  try {
    // 住所を結合して検索クエリを作成
    // 都道府県 + 市区町村部分を使用
    const searchQuery = encodeURIComponent(prefecture + address);
    
    const res = await fetch(
      `https://geoapi.heartrails.com/api/json?method=searchByAddress&address=${searchQuery}`
    );
    
    if (!res.ok) {
      console.error('HeartRails API error:', res.status);
      return null;
    }

    const data: HeartRailsResponse = await res.json();
    
    if (data.response.error) {
      console.error('HeartRails API error:', data.response.error);
      return null;
    }

    const location = data.response.location;
    
    if (!location) {
      return null;
    }

    // 配列の場合は最初の結果を使用
    const result = Array.isArray(location) ? location[0] : location;
    
    if (result && result.postal) {
      // ハイフンを除去して7桁の数字のみ返す
      return result.postal.replace(/-/g, '');
    }

    return null;
  } catch (error) {
    console.error('郵便番号検索エラー:', error);
    return null;
  }
}

/**
 * CORS回避のためのプロキシ経由でAPI呼び出し
 * （必要に応じて使用）
 */
export async function searchPostalCodeViaProxy(
  prefecture: string,
  address: string
): Promise<string | null> {
  try {
    const res = await fetch('/api/search-postal-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefecture, address }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    // 警告メッセージがある場合はコンソールに出力
    if (data.warning) {
      console.info('郵便番号検索:', data.warning);
    }
    
    return data.postalCode || null;
  } catch (error) {
    console.error('郵便番号検索エラー:', error);
    return null;
  }
}
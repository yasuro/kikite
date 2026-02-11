/**
 * zipcloud API を使った郵便番号→住所変換
 */

interface ZipcloudResult {
  address1: string; // 都道府県
  address2: string; // 市区町村
  address3: string; // 町域
}

interface ZipcloudResponse {
  status: number;
  results: ZipcloudResult[] | null;
}

export interface AddressResult {
  prefecture: string;
  city: string;
  town: string;
  fullAddress: string; // 市区町村 + 町域
}

export async function fetchAddressFromPostalCode(
  postalCode: string
): Promise<AddressResult | null> {
  if (!/^\d{7}$/.test(postalCode)) {
    return null;
  }

  try {
    const res = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`
    );
    const data: ZipcloudResponse = await res.json();

    if (data.status !== 200 || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    return {
      prefecture: result.address1,
      city: result.address2,
      town: result.address3,
      fullAddress: result.address2 + result.address3,
    };
  } catch {
    return null;
  }
}

-- 郵便番号マスターテーブル
CREATE TABLE IF NOT EXISTS postal_codes (
  id SERIAL PRIMARY KEY,
  postal_code VARCHAR(7) NOT NULL,
  prefecture VARCHAR(10) NOT NULL,
  city VARCHAR(50) NOT NULL,
  town VARCHAR(100),
  prefecture_kana VARCHAR(20),
  city_kana VARCHAR(100),
  town_kana VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成（高速検索用）
CREATE INDEX IF NOT EXISTS idx_postal_codes_postal_code ON postal_codes(postal_code);
CREATE INDEX IF NOT EXISTS idx_postal_codes_prefecture ON postal_codes(prefecture);
CREATE INDEX IF NOT EXISTS idx_postal_codes_city ON postal_codes(city);
CREATE INDEX IF NOT EXISTS idx_postal_codes_town ON postal_codes(town);

-- 複合インデックス（住所からの逆引き用）
CREATE INDEX IF NOT EXISTS idx_postal_codes_address 
  ON postal_codes(prefecture, city, town);

-- 全文検索用インデックス
CREATE INDEX IF NOT EXISTS idx_postal_codes_full_address 
  ON postal_codes USING gin(
    to_tsvector('simple', 
      COALESCE(prefecture, '') || ' ' || 
      COALESCE(city, '') || ' ' || 
      COALESCE(town, '')
    )
  );

-- RLSポリシー（読み取り専用）
ALTER TABLE postal_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公開読み取り" ON postal_codes
  FOR SELECT
  USING (true);

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_postal_codes_updated_at
  BEFORE UPDATE ON postal_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント追加
COMMENT ON TABLE postal_codes IS '日本郵便の郵便番号データ';
COMMENT ON COLUMN postal_codes.postal_code IS '郵便番号（ハイフンなし7桁）';
COMMENT ON COLUMN postal_codes.prefecture IS '都道府県名';
COMMENT ON COLUMN postal_codes.city IS '市区町村名';
COMMENT ON COLUMN postal_codes.town IS '町域名';
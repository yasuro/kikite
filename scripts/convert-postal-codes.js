const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const iconv = require('iconv-lite');

const CSV_FILE = path.join(__dirname, '..', 'data', 'KEN_ALL.CSV');
const JSON_FILE = path.join(__dirname, '..', 'data', 'postal_codes.json');
const SQL_FILE = path.join(__dirname, '..', 'data', 'postal_codes_insert.sql');

if (!fs.existsSync(CSV_FILE)) {
  console.error('❌ KEN_ALL.CSVが見つかりません。先にダウンロードしてください。');
  process.exit(1);
}

console.log('🔄 CSVファイルを変換中...');

// Shift-JISのCSVを読み込み
const csvBuffer = fs.readFileSync(CSV_FILE);
const csvString = iconv.decode(csvBuffer, 'Shift_JIS');

// CSVパース設定
const records = [];
const parser = parse({
  columns: false,
  skip_empty_lines: true
});

parser.on('readable', function() {
  let record;
  while (record = parser.read()) {
    // CSVのフォーマット:
    // 0: 全国地方公共団体コード
    // 1: 旧郵便番号
    // 2: 郵便番号
    // 3: 都道府県カナ
    // 4: 市区町村カナ
    // 5: 町域カナ
    // 6: 都道府県
    // 7: 市区町村
    // 8: 町域
    
    const postalCode = record[2];
    const prefecture = record[6];
    const city = record[7];
    const town = record[8] === '以下に掲載がない場合' ? '' : record[8];
    
    records.push({
      postal_code: postalCode,
      prefecture: prefecture,
      city: city,
      town: town,
      prefecture_kana: record[3],
      city_kana: record[4],
      town_kana: record[5]
    });
  }
});

parser.on('error', function(err) {
  console.error('❌ CSV解析エラー:', err.message);
});

parser.on('end', function() {
  console.log(`✅ ${records.length}件のデータを変換しました`);
  
  // JSON形式で保存（開発用）
  fs.writeFileSync(JSON_FILE, JSON.stringify(records, null, 2));
  console.log(`📝 JSONファイルを作成: ${JSON_FILE}`);
  
  // SQL INSERT文を生成（本番用）
  const sqlStatements = [];
  const batchSize = 1000;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const values = batch.map(r => {
      const town = r.town.replace(/'/g, "''");
      const city = r.city.replace(/'/g, "''");
      return `('${r.postal_code}', '${r.prefecture}', '${city}', '${town}')`;
    }).join(',\n  ');
    
    sqlStatements.push(`
INSERT INTO postal_codes (postal_code, prefecture, city, town)
VALUES
  ${values}
ON CONFLICT (postal_code) DO NOTHING;
`);
  }
  
  fs.writeFileSync(SQL_FILE, sqlStatements.join('\n'));
  console.log(`📝 SQLファイルを作成: ${SQL_FILE}`);
  console.log('\n✅ 変換完了！');
});

// パース開始
parser.write(csvString);
parser.end();

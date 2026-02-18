const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

// JSONファイルを読み込み
const JSON_FILE = path.join(__dirname, '..', 'data', 'postal_codes.json');

if (!fs.existsSync(JSON_FILE)) {
  console.error('❌ postal_codes.jsonが見つかりません');
  process.exit(1);
}

console.log('📂 JSONファイルを読み込み中...');
const postalCodes = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

console.log(`✅ ${postalCodes.length}件のデータを読み込みました`);

// バッチサイズと送信設定
const BATCH_SIZE = 100; // 一度に送信する件数を小さくする
const DELAY_MS = 500; // バッチ間の待機時間（ミリ秒）を短縮
const MAX_RECORDS = 999999; // 全データを取り込むため制限を撤廃

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createTable() {
  console.log('📋 テーブル作成を確認中...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/postal_codes?select=count`, {
    method: 'HEAD',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });

  if (response.status === 404) {
    console.log('⚠️ テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。');
    console.log('SQLファイル: sql/create_postal_codes_table.sql');
    return false;
  }

  return true;
}

async function clearTable() {
  console.log('🗑️ 既存データをクリア中...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/postal_codes?postal_code=neq.`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ データクリアに失敗:', response.statusText, errorText);
    // テーブルが空の場合はエラーではない
    if (response.status === 400 && errorText.includes('no rows')) {
      console.log('ℹ️ テーブルは既に空です');
      return true;
    }
    return false;
  }

  console.log('✅ 既存データをクリアしました');
  return true;
}

async function importBatch(batch, batchNumber) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/postal_codes`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(batch),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ バッチ ${batchNumber} の送信に失敗:`, error);
    return false;
  }

  return true;
}

async function main() {
  console.log('🚀 郵便番号データのインポートを開始します');
  console.log(`📊 設定: バッチサイズ=${BATCH_SIZE}, 最大件数=${MAX_RECORDS}`);

  // テーブルの存在確認
  const tableExists = await createTable();
  if (!tableExists) {
    process.exit(1);
  }

  // 既存データをクリアしない（追加インポート）
  console.log('📝 既存データを保持したまま追加インポートします');
  
  // 既に登録されている件数を確認
  const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/postal_codes?select=*&limit=1`, {
    method: 'HEAD',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'count=exact',
    },
  });
  
  const contentRange = countResponse.headers.get('content-range');
  let existingCount = 0;
  if (contentRange) {
    const match = contentRange.match(/\d+\-\d+\/(\d+)/);
    existingCount = match ? parseInt(match[1]) : 0;
  }
  console.log(`📊 既存データ: ${existingCount}件`);
  
  // 既にインポート済みのデータをスキップ
  const skipCount = existingCount;

  // インポート対象のデータ（既存データをスキップ）
  const targetData = postalCodes.slice(skipCount, Math.min(skipCount + MAX_RECORDS, postalCodes.length));
  console.log(`📝 ${skipCount}件目から${targetData.length}件のデータをインポートします`);

  let successCount = 0;
  let errorCount = 0;

  // バッチ処理
  for (let i = 0; i < targetData.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batch = targetData.slice(i, i + BATCH_SIZE);
    
    // データの整形（idフィールドを除外）
    const cleanBatch = batch.map(item => ({
      postal_code: item.postal_code,
      prefecture: item.prefecture,
      city: item.city,
      town: item.town || null,
      prefecture_kana: item.prefecture_kana || null,
      city_kana: item.city_kana || null,
      town_kana: item.town_kana || null,
    }));

    console.log(`📤 バッチ ${batchNumber}/${Math.ceil(targetData.length / BATCH_SIZE)} を送信中...`);
    
    const success = await importBatch(cleanBatch, batchNumber);
    if (success) {
      successCount += batch.length;
      console.log(`✅ バッチ ${batchNumber} 送信完了 (${successCount}/${targetData.length}件)`);
    } else {
      errorCount += batch.length;
      console.log(`⚠️ バッチ ${batchNumber} 送信失敗`);
    }

    // 次のバッチまで待機
    if (i + BATCH_SIZE < targetData.length) {
      console.log(`⏳ ${DELAY_MS}ms 待機中...`);
      await sleep(DELAY_MS);
    }
  }

  console.log('\n📊 インポート結果:');
  console.log(`✅ 成功: ${successCount}件`);
  console.log(`❌ 失敗: ${errorCount}件`);
  
  if (successCount > 0) {
    console.log('\n✨ インポートが完了しました！');
    console.log('郵便番号逆引き機能が使用可能になりました。');
  }
}

// 実行
main().catch(console.error);
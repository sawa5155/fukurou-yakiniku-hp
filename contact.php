<?php
/**
 * お問い合わせフォームの送信先。
 *
 * index.html の <form data-endpoint="contact.php"> から FormData が POST され、
 * assets/js/main.js は HTTP ステータスが 2xx かどうかだけを見る。
 *
 * 送るメールは 2 通:
 *   1. 店舗宛の通知（Reply-To に入力アドレスを入れ、返信ボタンだけで客に返せるようにする）
 *   2. 入力アドレス宛の自動返信（受付控え）
 *
 * From を @northsea2023.com にしているのは SPF を通すため。
 * gmail.com を From にすると、ロリポップのサーバは Gmail の SPF に含まれないので
 * 認証に失敗し、迷惑メール扱いか拒否になる。
 */

declare(strict_types=1);

mb_internal_encoding('UTF-8');
mb_language('uni');          // 件名・本文を UTF-8 Base64 で符号化する

// サーバ既定は UTC。本文に載せる送信日時が 9 時間ずれるので明示しておく。
date_default_timezone_set('Asia/Tokyo');

// ------------------------------------------------------------------
// 設定
// ------------------------------------------------------------------
define('MAIL_TO',      'northsea.contact@gmail.com');   // 通知の宛先。定数。ユーザー入力を混ぜない
define('MAIL_FROM',    'info@northsea2023.com');        // SPF が通るドメインのアドレス
define('FROM_NAME',    '焼肉 福朗');
define('SITE_URL',     'https://northsea2023.com/');
define('TEL_MAIN',     '088-612-8032');
define('RATE_SECONDS', 60);                              // 同一 IP の連投を弾く間隔

// 種別と店舗は index.html の <select> の選択肢に限定する。
// 種別は件名に入るため、自由入力を許すと件名に任意の文字列を差し込まれる。
// index.html の選択肢を編集したら、こちらも合わせて直すこと。
$TYPES = [
    'ご予約・空席について',
    'ご宴会・団体でのご利用',
    'アレルギー・お食事内容について',
    '求人・採用について',
    '取材・お取引のご相談',
    'その他',
];
$SHOPS = ['北島本店', '弐番館', '定食酒場みみずく'];

// 入力の上限。長大なデータを投げ込まれてメールが壊れるのを防ぐ
$LIMITS = [
    'name' => 100, 'kana' => 100, 'email' => 254, 'tel' => 40,
    'type' => 60,  'shop' => 60,  'message' => 5000,
];

// ------------------------------------------------------------------
// 応答ヘルパ
// ------------------------------------------------------------------
function respond($status, array $body)
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * メールヘッダに入れる値の無害化。
 * 改行を含む値をヘッダに入れると任意のヘッダ（Bcc 等）を追加されてしまう
 * ＝ヘッダインジェクション。改行と NUL を落としてから使う。
 */
function headerSafe($v)
{
    return trim(str_replace(["\r", "\n", "\0"], '', $v));
}

function field($key)
{
    global $LIMITS;
    $v = isset($_POST[$key]) ? $_POST[$key] : '';
    if (!is_string($v)) {
        return '';
    }
    $v = trim(str_replace("\0", '', $v));
    $max = isset($LIMITS[$key]) ? $LIMITS[$key] : 200;
    return mb_substr($v, 0, $max);
}

// ------------------------------------------------------------------
// 1. POST 以外は受け付けない
// ------------------------------------------------------------------
if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

// ------------------------------------------------------------------
// 2. ハニーポット
// 人には見えない入力欄に値が入っていればボット。
// エラーを返すと再送してくるので、成功を装って黙って捨てる。
// ------------------------------------------------------------------
if (field('_gotcha') !== '') {
    respond(200, ['ok' => true]);
}

// ------------------------------------------------------------------
// 3. 入力検証
// ------------------------------------------------------------------
$name    = field('name');
$kana    = field('kana');
$email   = field('email');
$tel     = field('tel');
$type    = field('type');
$shop    = field('shop');
$message = field('message');
$agree   = field('agree');

// 選択肢外の店舗は「指定なし」に丸める（必須項目ではないため弾かない）
if (!in_array($shop, $SHOPS, true)) {
    $shop = '';
}

$errors = [];
if ($name === '')                         { $errors[] = 'name'; }
if (!in_array($type, $TYPES, true))       { $errors[] = 'type'; }
if ($message === '') { $errors[] = 'message'; }
if ($agree === '')   { $errors[] = 'agree'; }
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { $errors[] = 'email'; }

if ($errors) {
    respond(422, ['ok' => false, 'error' => 'validation', 'fields' => $errors]);
}

// ------------------------------------------------------------------
// 4. 簡易レート制限
// 同一 IP からの連投を弾く。テンポラリ領域に最終送信時刻を置くだけなので
// 消えることもあるが、目的はボットの連射を鈍らせることなので十分。
// ------------------------------------------------------------------
$ip   = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
$lock = sys_get_temp_dir() . '/fukurou-contact-' . hash('sha256', $ip);
$now  = time();
if (is_readable($lock)) {
    $last = (int) @file_get_contents($lock);
    if ($last > 0 && ($now - $last) < RATE_SECONDS) {
        respond(429, ['ok' => false, 'error' => 'too_many_requests']);
    }
}
@file_put_contents($lock, (string) $now);

// ------------------------------------------------------------------
// 5. メール本文の組み立て
// 任意項目が空のまま「■ 電話番号」だけ並ぶと読みにくいので、
// 未記入だと分かる表示に置き換えてから本文に入れる。
// ------------------------------------------------------------------
$sentAt   = date('Y-m-d H:i:s');
$nameLine = $kana !== '' ? $name . '（' . $kana . '）' : $name;
$shopDisp = $shop !== '' ? $shop : '（指定なし）';
$telDisp  = $tel  !== '' ? $tel  : '（未記入）';
$rule     = str_repeat('─', 26);
$telMain  = TEL_MAIN . '（北島本店）';
$siteUrl  = SITE_URL;

$notify = <<<TXT
ホームページのお問い合わせフォームから送信がありました。

■ お問い合わせ種別
{$type}

■ ご希望の店舗
{$shopDisp}

■ お名前
{$nameLine}

■ メールアドレス
{$email}

■ 電話番号
{$telDisp}

■ お問い合わせ内容
{$message}

{$rule}
送信日時：{$sentAt}
送信元IP：{$ip}
このメールに「返信」すると、お客様（{$email}）へ直接届きます。
TXT;

$autoReply = <<<TXT
{$name} 様

このたびは焼肉 福朗へお問い合わせいただき、ありがとうございます。
下記の内容で承りました。内容を確認のうえ、担当者よりご返信いたします。

── ご記入内容 ──────────────
お問い合わせ種別：{$type}
ご希望の店舗：{$shopDisp}
お問い合わせ内容：
{$message}
{$rule}

※このメールは自動送信です。ご返信いただいても対応できません。
※お急ぎの場合は {$telMain}までお電話ください。

焼肉 福朗
{$siteUrl}
TXT;

// ------------------------------------------------------------------
// 6. 送信
// 第 5 引数の -f はエンベロープ送信者。これを自ドメインにしておかないと
// サーバ既定の送信者になり SPF の整合が崩れる。
// ------------------------------------------------------------------
$safeName  = headerSafe($name);
$safeEmail = headerSafe($email);
$safeType  = headerSafe($type);

$notifyHeaders = implode("\r\n", [
    'From: ' . mb_encode_mimeheader(FROM_NAME . ' お問い合わせ') . ' <' . MAIL_FROM . '>',
    'Reply-To: ' . mb_encode_mimeheader($safeName) . ' <' . $safeEmail . '>',
    'X-Mailer: fukurou-contact',
]);

$subject  = '【お問い合わせ】' . $safeType . '／' . $safeName . ' 様';
$okNotify = mb_send_mail(MAIL_TO, $subject, $notify, $notifyHeaders, '-f ' . MAIL_FROM);

// 店舗宛が飛ばないのは失敗。自動返信だけ失敗した場合は成功扱いにする
// （店舗には届いており、お客様の画面には受付済みと出ているため）
if (!$okNotify) {
    respond(500, ['ok' => false, 'error' => 'send_failed']);
}

$replyHeaders = implode("\r\n", [
    'From: ' . mb_encode_mimeheader(FROM_NAME) . ' <' . MAIL_FROM . '>',
    'Auto-Submitted: auto-replied',
    'X-Mailer: fukurou-contact',
]);
@mb_send_mail($safeEmail, '【焼肉 福朗】お問い合わせを受け付けました', $autoReply, $replyHeaders, '-f ' . MAIL_FROM);

respond(200, ['ok' => true]);

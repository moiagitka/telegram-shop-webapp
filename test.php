<?php

header('Content-Type: application/json; charset=utf-8');

// Получаем параметры из GET или POST
$bot_token = $_REQUEST['bot_token'] ?? '';
$chat_id   = $_REQUEST['chat_id']   ?? '';
$message   = $_REQUEST['message']   ?? '';
$parse_mode = $_REQUEST['parse_mode'] ?? 'HTML'; // HTML | Markdown | MarkdownV2

// Валидация
$errors = [];
if (empty($bot_token)) $errors[] = 'bot_token is required';
if (empty($chat_id))   $errors[] = 'chat_id is required';
if (empty($message))   $errors[] = 'message is required';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// Формируем запрос к Telegram API
$url = "https://api.telegram.org/bot{$bot_token}/sendMessage";

$params = [
    'chat_id'    => $chat_id,
    'text'       => $message,
    'parse_mode' => $parse_mode,
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query($params),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 10,
]);

$result   = curl_exec($ch);
$curl_err = curl_error($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Обработка ошибок cURL
if ($curl_err) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'curl_error' => $curl_err]);
    exit;
}

// Возвращаем ответ Telegram как есть
http_response_code($http_code);
echo $result;
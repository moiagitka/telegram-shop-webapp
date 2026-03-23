<?php
// CORS в самом начале!
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Только GET параметры (GitHub Pages не поддерживает POST)
$bot_token = $_GET['bot_token'] ?? '';
$chat_id   = $_GET['chat_id'] ?? '';
$message   = $_GET['message'] ?? '';

$errors = [];
if (empty($bot_token)) $errors[] = 'bot_token required';
if (empty($chat_id)) $errors[] = 'chat_id required';
if (empty($message)) $errors[] = 'message required';

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// URL encode сообщение для GET
$message = urlencode($message);

$url = "https://api.telegram.org/bot{$bot_token}/sendMessage?chat_id={$chat_id}&text={$message}&parse_mode=HTML";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$result = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($http_code);
echo $result;
?>

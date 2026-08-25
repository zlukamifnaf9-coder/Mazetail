<?php
header('Content-Type: application/json');

// Получаем ключ из переменных окружения или вставляем прямо здесь
$apiKey = 'sk-твой_реальный_ключ_сюда';

$input = json_decode(file_get_contents('php://input'), true);
$question = $input['message'] ?? '';

if (!$question) {
    http_response_code(400);
    echo json_encode(['error' => 'Пустой запрос']);
    exit;
}

$ch = curl_init('https://api.deepseek.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => 'deepseek-chat',
    'messages' => [['role' => 'user', 'content' => $question]],
    'max_tokens' => 500
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка API']);
    exit;
}

$data = json_decode($response, true);
$reply = $data['choices'][0]['message']['content'] ?? 'Не удалось получить ответ';

echo json_encode(['reply' => $reply]);

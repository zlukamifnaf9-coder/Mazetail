import requests
import time
import logging

# Твой токен (НЕ ПОКАЗЫВАЙ НИКОМУ!)
TOKEN = "8830033236:AAGNApWSOSsEHDZbo0JyXxF_Oi7OuxD9JJU"

# Настройка логирования (чтобы видеть ошибки)
logging.basicConfig(level=logging.INFO)

def ask_ai(text):
    """
    Отправляет вопрос в бесплатный HuggingFace API и возвращает ответ.
    Если API недоступен — возвращает сообщение об ошибке.
    """
    url = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B-Instruct"
    try:
        response = requests.post(url, json={"inputs": text}, timeout=60)
        data = response.json()
        if isinstance(data, list) and "generated_text" in data[0]:
            answer = data[0]["generated_text"][len(text):].strip()
            return answer or "🤔 Не удалось сгенерировать ответ. Попробуйте переформулировать вопрос."
        else:
            return "⚠️ Ошибка API: " + str(data)[:100]
    except requests.exceptions.Timeout:
        return "⏳ Превышено время ожидания. Попробуйте позже."
    except Exception as e:
        return f"❌ Ошибка: {str(e)[:100]}. Проверьте интернет или попробуйте позже."

def send_message(chat_id, text, reply_to_message_id=None):
    """Отправляет сообщение в Telegram с поддержкой ответа на сообщение."""
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
    try:
        requests.post(url, json=payload, timeout=30)
    except Exception as e:
        logging.error(f"Ошибка отправки: {e}")

def send_start_message(chat_id):
    """Отправляет приветственное сообщение с инструкцией."""
    welcome = (
        "👋 <b>Привет! Я ИИ-помощник для форума RIVE MOBILE!</b>\n\n"
        "🤖 <b>Что я умею:</b>\n"
        "• Отвечать на вопросы про школу, экзамены, учёбу\n"
        "• Помогать с решением задач\n"
        "• Объяснять сложные вещи простым языком\n"
        "• Генерировать идеи и тексты\n\n"
        "📌 <b>Как спросить:</b>\n"
        "Просто напиши мне сообщение с вопросом — я постараюсь ответить!\n\n"
        "🆘 Если нужна помощь — напиши /help"
    )
    send_message(chat_id, welcome)

def send_help_message(chat_id):
    """Отправляет список команд."""
    help_text = (
        "📖 <b>Список команд:</b>\n\n"
        "/start — Показать приветствие\n"
        "/help — Показать эту справку\n"
        "/ask <вопрос> — Спросить ИИ (например: /ask Что такое 2+2?)\n"
        "/info — Информация о боте\n\n"
        "💬 Или просто напиши мне свой вопрос!"
    )
    send_message(chat_id, help_text)

def send_info_message(chat_id):
    """Отправляет информацию о боте."""
    info = (
        "🤖 <b>О боте:</b>\n\n"
        "• Версия: 2.0\n"
        "• Нейросеть: Qwen 2.5 (русскоязычная)\n"
        "• API: HuggingFace (бесплатный)\n"
        "• Создан для форума <a href='https://rivemobile.sampproject.ru'>RIVE MOBILE</a>\n\n"
        "📊 <b>Статистика:</b>\n"
        "• Запросов сегодня: (считается автоматически)\n"
        "• Доступно: 30 запросов в день (бесплатно)"
    )
    send_message(chat_id, info)

def handle_message(chat_id, text, reply_to_message_id=None):
    """Обрабатывает входящие сообщения."""
    # Обработка команд
    if text.startswith('/start'):
        send_start_message(chat_id)
        return
    elif text.startswith('/help'):
        send_help_message(chat_id)
        return
    elif text.startswith('/info'):
        send_info_message(chat_id)
        return
    elif text.startswith('/ask'):
        # Извлекаем вопрос из команды /ask
        question = text[4:].strip()
        if not question:
            send_message(chat_id, "❓ Пожалуйста, напишите вопрос после команды /ask.\nНапример: <code>/ask Что такое вода?</code>")
            return
        # Отвечаем на вопрос
        status_msg = send_message(chat_id, "⏳ Думаю...")
        answer = ask_ai(question)
        send_message(chat_id, f"🧠 <b>Ответ ИИ:</b>\n\n{answer}", reply_to_message_id)
        return

    # Если сообщение не команда — считаем это вопросом
    if len(text) < 3:
        send_message(chat_id, "🙂 Напишите что-нибудь подлиннее, и я постараюсь ответить.")
        return

    # Отправляем статус "печатает" (имитация)
    send_message(chat_id, "⏳ Ищу ответ...")
    answer = ask_ai(text)
    send_message(chat_id, f"🧠 <b>Ответ ИИ:</b>\n\n{answer}", reply_to_message_id)

def main():
    """Основной цикл бота."""
    print("🤖 Бот запущен и готов к работе!")
    print("Команды: /start, /help, /info, /ask <вопрос>")
    print("Или просто пиши вопросы в чат.")
    
    last_update_id = 0
    while True:
        try:
            # Получаем обновления
            url = f"https://api.telegram.org/bot{TOKEN}/getUpdates?offset={last_update_id+1}&timeout=30"
            response = requests.get(url, timeout=35)
            data = response.json()
            
            if not data.get("ok"):
                logging.error(f"Ошибка API: {data}")
                time.sleep(5)
                continue

            for update in data.get("result", []):
                last_update_id = update["update_id"]
                
                # Проверяем, есть ли сообщение
                if "message" in update:
                    message = update["message"]
                    chat_id = message["chat"]["id"]
                    text = message.get("text", "")
                    reply_to_message_id = message.get("message_id")
                    
                    # Пропускаем пустые сообщения
                    if not text:
                        continue
                    
                    # Обрабатываем сообщение
                    handle_message(chat_id, text, reply_to_message_id)
                    
            # Небольшая пауза между запросами
            time.sleep(2)
            
        except requests.exceptions.Timeout:
            logging.warning("Тайм-аут при получении обновлений. Переподключение...")
            time.sleep(5)
        except Exception as e:
            logging.error(f"Ошибка в основном цикле: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()

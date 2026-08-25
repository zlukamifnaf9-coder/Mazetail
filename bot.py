import requests
import time

TOKEN = "8830033236:AAGNApWSOSsEHDZbo0JyXxF_Oi7OuxD9JJU"

def ask_ai(text):
    url = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-1.5B-Instruct"
    try:
        response = requests.post(url, json={"inputs": text}, timeout=60)
        data = response.json()
        if isinstance(data, list) and "generated_text" in data[0]:
            answer = data[0]["generated_text"][len(text):].strip()
            return answer or "Не удалось сгенерировать ответ"
        else:
            return "Ошибка API: " + str(data)
    except Exception as e:
        return f"Ошибка: {str(e)}"

def send_message(chat_id, text):
    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"
    try:
        requests.post(url, json={"chat_id": chat_id, "text": text}, timeout=30)
    except Exception as e:
        print(f"Ошибка отправки: {e}")

print("🤖 Бот запущен!")
last_update = 0

while True:
    url = f"https://api.telegram.org/bot{TOKEN}/getUpdates?offset={last_update+1}&timeout=30"
    try:
        data = requests.get(url, timeout=35).json()
        for update in data.get("result", []):
            last_update = update["update_id"]
            if "message" in update and "text" in update["message"]:
                chat_id = update["message"]["chat"]["id"]
                text = update["message"]["text"]
                print(f"📩 Вопрос: {text}")
                answer = ask_ai(text)
                send_message(chat_id, answer)
                print(f"✅ Ответ: {answer[:100]}...")
    except Exception as e:
        print(f"⚠️ Ошибка: {e}")
    time.sleep(2)

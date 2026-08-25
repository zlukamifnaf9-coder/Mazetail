(function() {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.ds-trigger').forEach(function(block) {
            var btn = block.querySelector('.ds-btn');
            var answer = block.querySelector('.ds-answer');
            var question = block.dataset.question;

            btn.addEventListener('click', function() {
                btn.disabled = true;
                btn.textContent = '⏳ Думаю...';
                answer.style.display = 'block';
                answer.innerHTML = '🔄 Генерирую...';

                fetch('https://твой-сайт.ru/api/index.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: question })
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.error) throw new Error(data.error);
                    answer.innerHTML = data.reply.replace(/\n/g, '<br>');
                    btn.style.display = 'none';
                })
                .catch(function(err) {
                    answer.innerHTML = '❌ Ошибка: ' + err.message;
                    btn.disabled = false;
                    btn.textContent = '🤖 Повтор';
                });
            });
        });
    });
})();

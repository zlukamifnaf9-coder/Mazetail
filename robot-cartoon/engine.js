/* ====== ЗВУК ====== */
let audioCtx = null;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(freq, dur, type='sine', vol=0.08, when=0) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + when;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  o.connect(g); g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur + 0.05);
}
function playMelody(notes, tempo=0.3) {
  notes.forEach((n, i) => {
    if (typeof n === 'object') playTone(n.f, n.d, n.t || 'sine', n.v || 0.08, i * tempo);
    else playTone(n, 0.25, 'triangle', 0.07, i * tempo);
  });
}
function playBark() { playTone(400,0.1,'sawtooth',0.12); playTone(300,0.1,'sawtooth',0.12,0.15); }
function playRobotBeep() { playTone(800,0.08,'square',0.06); playTone(1200,0.08,'square',0.06,0.1); }
function playHappyChime() { playTone(784,0.2,'triangle',0.1); playTone(988,0.2,'triangle',0.1,0.15); playTone(1175,0.4,'triangle',0.1,0.3); }

/* ====== СЦЕНА ====== */
const stage = document.getElementById('stage');
const scene = document.getElementById('scene');
const robot = document.getElementById('robot');
const dog = document.getElementById('dog');
const butterfly = document.getElementById('butterfly');
const moon = document.getElementById('moon');
const ground = document.getElementById('ground');
const lampGlow = document.getElementById('lampGlow');

/* звёзды */
for (let i = 0; i < 80; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const size = Math.random() * 2.5 + 1;
  s.style.width = size + 'px'; s.style.height = size + 'px';
  s.style.left = Math.random() * 100 + '%';
  s.style.top = Math.random() * 55 + '%';
  s.style.animationDelay = Math.random() * 2 + 's';
  s.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
  stage.appendChild(s);
}

/* дома */
function makeBuilding(left, width, height, floors, wp) {
  const b = document.createElement('div');
  b.className = 'building';
  b.style.left = left + '%'; b.style.width = width + '%'; b.style.height = height + '%';
  scene.appendChild(b);
  for (let f = 0; f < floors; f++) for (let w = 0; w < wp; w++) {
    if (Math.random() > 0.3) {
      const win = document.createElement('div');
      win.className = 'window';
      win.style.left = (8 + w * (84 / wp)) + '%';
      win.style.bottom = (12 + f * (76 / floors)) + '%';
      win.style.animationDelay = Math.random() * 4 + 's';
      win.style.animationDuration = (Math.random() * 3 + 2) + 's';
      if (Math.random() > 0.7) win.style.background = '#4ecdc4';
      b.appendChild(win);
    }
  }
}
makeBuilding(2,12,45,6,3); makeBuilding(16,10,60,8,2); makeBuilding(28,14,38,5,4);
makeBuilding(44,11,52,7,3); makeBuilding(58,9,44,6,2); makeBuilding(70,13,58,8,3);
makeBuilding(86,12,40,5,3);

/* деревья */
for (let i = 0; i < 4; i++) {
  const t = document.createElement('div');
  t.className = 'tree';
  t.style.left = (5 + i * 25) + '%';
  t.style.borderBottomColor = ['#1a4a2a','#2a5a3a','#0a3a1a','#1a4a2a'][i];
  scene.appendChild(t);
}

/* дождь */
const rainContainer = document.createElement('div');
scene.appendChild(rainContainer);
for (let i = 0; i < 60; i++) {
  const d = document.createElement('div');
  d.className = 'rain-drop';
  d.style.left = Math.random() * 100 + '%';
  d.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
  d.style.animationDelay = Math.random() * 2 + 's';
  d.style.opacity = Math.random() * 0.5 + 0.2;
  rainContainer.appendChild(d);
}
rainContainer.style.display = 'none';

/* ====== ДИАЛОГИ ====== */
const dialogue = document.getElementById('dialogue');
const speakerEl = dialogue.querySelector('.speaker');
const textEl = dialogue.querySelector('.text');
let typingTimer = null;

function showDialogue(speaker, text, duration=3000) {
  return new Promise(resolve => {
    speakerEl.textContent = speaker;
    textEl.textContent = '';
    dialogue.classList.add('show');
    let i = 0;
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = setInterval(() => {
      textEl.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(typingTimer);
        setTimeout(() => {
          dialogue.classList.remove('show');
          setTimeout(resolve, 300);
        }, duration);
      }
    }, 30);
  });
}
function showTitle(main, sub, duration=3000) {
  const tc = document.getElementById('title-card');
  tc.querySelector('h2').textContent = main;
  tc.querySelector('p').textContent = sub;
  tc.classList.add('show');
  return new Promise(res => setTimeout(() => {
    tc.classList.remove('show');
    setTimeout(res, 800);
  }, duration));
}
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ====== ДВИЖЕНИЯ ====== */
function robotWalkTo(percent, duration=4000) {
  robot.style.transition = `left ${duration}ms ease-in-out`;
  robot.classList.add('walking');
  robot.style.left = percent + '%';
  return wait(duration);
}
function robotStop() { robot.classList.remove('walking'); }
function robotHappy() {
  robot.classList.add('happy');
  document.querySelectorAll('.robot-eye').forEach(e => e.classList.add('happy'));
  setTimeout(() => {
    robot.classList.remove('happy');
    document.querySelectorAll('.robot-eye').forEach(e => e.classList.remove('happy'));
  }, 3000);
}
function dogAppear(x='60%') { dog.style.transition = 'left 3s ease-out'; dog.style.left = x; }
function dogHide() { dog.style.transition = 'left 3s ease-in'; dog.style.left = '-100px'; }
function setTimeOfDay(time) {
  if (time === 'day') {
    stage.style.background = 'linear-gradient(180deg,#87ceeb 0%,#b3e5fc 40%,#e1f5fe 70%,#fff9c4 100%)';
    moon.className = 'sun';
    moon.style.background = 'radial-gradient(circle,#fff9c4,#ffeb3b,#ff9800)';
    ground.style.background = 'linear-gradient(180deg,#4a7c3a,#2a5a2a)';
    document.querySelectorAll('.building').forEach(b => b.style.background = '#5a6a8a');
    document.querySelectorAll('.star').forEach(s => s.style.opacity = 0);
  } else if (time === 'sunset') {
    stage.style.background = 'linear-gradient(180deg,#2a1f4a 0%,#ff6b9d 40%,#ff9800 70%,#ffd700 100%)';
    moon.className = 'sun';
    moon.style.background = 'radial-gradient(circle,#fff9c4,#ff9800)';
    ground.style.background = 'linear-gradient(180deg,#4a3a2a,#2a1a1a)';
  } else {
    stage.style.background = 'linear-gradient(180deg,#0a0e27 0%,#1a1f4a 40%,#2a1f4a 70%,#3a1a2a 100%)';
    moon.className = 'moon';
    moon.style.background = 'radial-gradient(circle at 35% 35%,#fffde7,#ffd54f)';
    ground.style.background = 'linear-gradient(180deg,#1a1f4a,#0a0e27)';
    document.querySelectorAll('.building').forEach(b => b.style.background = '#0d1130');
    document.querySelectorAll('.star').forEach(s => s.style.opacity = 1);
  }
}
function addLeaves() {
  for (let i = 0; i < 15; i++) {
    const l = document.createElement('div');
    l.className = 'leaf';
    l.style.left = Math.random() * 100 + '%';
    l.style.animationDuration = (Math.random() * 4 + 4) + 's';
    l.style.animationDelay = Math.random() * 3 + 's';
    scene.appendChild(l);
  }
}
function addSnow() {
  for (let i = 0; i < 40; i++) {
    const s = document.createElement('div');
    s.className = 'snow';
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDuration = (Math.random() * 4 + 4) + 's';
    s.style.animationDelay = Math.random() * 5 + 's';
    scene.appendChild(s);
  }
}
function addClouds() {
  for (let i = 0; i < 5; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    c.style.width = (80 + Math.random() * 60) + 'px';
    c.style.height = (30 + Math.random() * 20) + 'px';
    c.style.top = (5 + Math.random() * 25) + '%';
    c.style.animationDuration = (30 + Math.random() * 30) + 's';
    c.style.animationDelay = -Math.random() * 30 + 's';
    scene.appendChild(c);
  }
}
function showRain() { rainContainer.style.display = 'block'; }
function hideRain() { rainContainer.style.display = 'none'; }

/* ====== ПРОПУСК И ФИНАЛ ====== */
let skipRequested = false;
function skipToEnd() {
  skipRequested = true;
  document.getElementById('skipBtn').style.display = 'none';
  finishEpisode();
}
function finishEpisode() {
  dialogue.classList.remove('show');
  setTimeout(() => {
    document.getElementById('final-screen').classList.add('show');
    playHappyChime();
  }, 500);
}
function restart() {
  location.reload();
}

/* ====== СЦЕНАРИЙ (ПОЛНЫЙ) ====== */
async function startEpisode() {
  initAudio();
  const intro = document.getElementById('intro');
  intro.style.transition = 'opacity 1s';
  intro.style.opacity = 0;
  setTimeout(() => intro.style.display = 'none', 1000);
  document.getElementById('skipBtn').style.display = 'block';
  scene.style.opacity = 1;

  playMelody([523, 659, 784, 1047, 784, 659, 523], 0.25);
  await wait(1000);

  /* === СЦЕНА 1: Ночной Петербург === */
  setTimeOfDay('night');
  showRain();
  await showTitle('🤖 Приключения Робота Пикселя', 'Серия 1: «Дом, который нашёлся»', 3500);

  await showDialogue('Рассказчик', 'Это Санкт-Петербург. Тёмная осенняя ночь. Над крышами идёт мелкий дождь...', 3000);
  await showDialogue('Рассказчик', 'Где-то на старом заводе жил маленький робот по имени Пиксель. Он мечтал найти свой дом.', 3000);

  robotWalkTo('15%', 1);
  await showDialogue('Пиксель', 'Бип-бип... Как же тут холодно и мокро. Мне бы куда-нибудь в тепло...', 2500);
  playRobotBeep();
  await showDialogue('Пиксель', 'Может, вон в том доме с жёлтыми окнами кто-то живёт и пустит меня погреться?', 2500);

  /* === СЦЕНА 2: Встреча с собакой === */
  dogAppear('60%');
  await wait(3000);
  playBark();
  await showDialogue('Бублик', 'Гав! Ты кто такой? Робот, что ли?', 2500);
  await showDialogue('Пиксель', 'Бип... Да, я робот. Меня зовут Пиксель. Я ищу дом. А ты кто?', 2500);
  await showDialogue('Бублик', 'А я Бублик! Живу под мостом. Холодно, но не скучно. Хочешь, вместе поищем дом?', 2500);
  await showDialogue('Пиксель', 'Вдвоём искать веселее! Бип-бип, пошли!', 2500);

  robotWalkTo('40%', 4000);
  await showDialogue('Бублик', 'Гав! Смотри, какие огни! Я всегда мечтал жить в доме, где светятся окна.', 2500);

  /* === СЦЕНА 3: Дождь усиливается === */
  await showDialogue('Рассказчик', 'Дождь усилился. Пиксель и Бублик спрятались под старым фонарём.', 3000);
  lampGlow.style.opacity = 1;
  playRobotBeep();
  await showDialogue('Пиксель', 'Бип... Мои схемы намокают. Если я не найду дом скоро, я сломаюсь.', 2500);
  await showDialogue('Бублик', 'Не бойся, Пиксель! Я тебя в обиду не дам. Гав!', 2500);

  /* === СЦЕНА 4: Утро, парк === */
  hideRain();
  setTimeOfDay('day');
  addClouds();
  butterfly.style.display = 'block';
  await showDialogue('Рассказчик', 'К утру дождь закончился. Друзья вышли в Летний сад — один из самых красивых парков города.', 3000);
  await showDialogue('Пиксель', 'Бип! Как тут красиво! Птицы поют, бабочки летают...', 2500);
  await showDialogue('Бублик', 'Гав-гав! Смотри, какая бабочка! Жёлтая, как солнышко!', 2500);
  robotWalkTo('70%', 5000);
  await showDialogue('Рассказчик', 'Друзья гуляли по аллеям, играли с бабочкой и смеялись. Впервые за долгое время Пиксель почувствовал себя счастливым.', 3500);

  /* === СЦЕНА 5: Осень, листопад === */
  butterfly.style.display = 'none';
  setTimeOfDay('sunset');
  addLeaves();
  await showDialogue('Рассказчик', 'Пришла осень. Листья кружились в воздухе, словно золотые монетки.', 3000);
  await showDialogue('Бублик', 'Гав! Осенью так вкусно пахнет... пирожками с яблоками!', 2500);
  await showDialogue('Пиксель', 'Бип-бип... А я никогда не пробовал пирожки. Интересно, какие они на вкус?', 2500);
  await showDialogue('Бублик', 'Не переживай, друг! Найдём дом — и пирожки найдём!', 2500);

  /* === СЦЕНА 6: Зима, снег === */
  setTimeOfDay('night');
  addSnow();
  await showDialogue('Рассказчик', 'Наступила зима. Город укрылся белым снегом. Стало совсем холодно.', 3000);
  playRobotBeep();
  await showDialogue('Пиксель', 'Бип... Б-б-бип... Мои батарейки замерзают... Я почти не могу двигаться...', 3000);
  await showDialogue('Бублик', 'Пиксель! Держись! Я найду тебе тёплое место! Гав!', 2500);
  await showDialogue('Рассказчик', 'Бублик бросился искать помощь. Он бегал по улицам, лаял у дверей, пока одна добрая женщина не открыла окно.', 3500);

  /* === СЦЕНА 7: Дом === */
  await showDialogue('Хозяйка', 'Ой, бедный пёсик! Что случилось? Тебе нужна помощь?', 2500);
  await showDialogue('Бублик', 'Гав! Гав! Там мой друг, робот! Он замерзает! Идём скорее!', 2500);
  await showDialogue('Рассказчик', 'Женщина выбежала на улицу, увидела замёрзшего робота и бережно взяла его на руки.', 3000);

  robotHappy();
  playHappyChime();
  await showDialogue('Хозяйка', 'Бедный малыш! Идёмте скорее в дом, там тепло и есть горячий чай.', 3000);

  /* === СЦЕНА 8: Финал === */
  lampGlow.style.opacity = 1;
  await showDialogue('Рассказчик', 'Так Пиксель и Бублик нашли свой дом. У тёплой печки, с доброй хозяйкой и запахом пирожков.', 3500);
  await showDialogue('Пиксель', 'Бип-бип! Бублик, спасибо тебе. Ты настоящий друг.', 2500);
  await showDialogue('Бублик', 'Гав! Друзья всегда помогают друг другу. Особенно когда ищут дом.', 2500);
  await showDialogue('Рассказчик', 'И с тех пор каждую зиму они пили чай, смотрели в окно на снег и радовались, что нашли друг друга.', 3500);

  await wait(1000);
  finishEpisode();
    }

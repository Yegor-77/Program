const priceInput = document.querySelector(".price");
const tgInput = document.querySelector(".tg");
const result = document.querySelector(".result");
const orderTextInput = document.querySelector(".orderText");
const platformInput = document.querySelector(".platform");
const orderNumInput = document.querySelector(".orderNum");
const copyBox = document.querySelector(".copyBox");

const playersDiv = document.getElementById("players");
const successBtn = document.getElementById("successBtn");
const failBtn = document.getElementById("failBtn");
const successBlock = document.getElementById("successBlock");
const failBlock = document.getElementById("failBlock");

let playerCount = 0;

// ==================== Функция расчета заказа ====================
function calculate() {
  const price = Number(priceInput.value);
  if (!price) {
    result.innerHTML = "Введите стоимость сопровода";
    return;
  }

  const tgUser = tgInput.value.trim() || "Не указан";
  const orderText = orderTextInput.value || "—";
  const platform = platformInput.value || "—";
  const orderNum = orderNumInput.value || "?";

  const after15 = Math.floor(price * 0.85);
  const zapas = Math.floor(after15 * 0.23);
  const r1 = Math.floor(after15 * 0.25);
  const r2 = Math.floor(after15 * 0.27);
  const r3 = Math.floor(after15 * 0.31);
  const zam = Math.floor(after15 * 0.33);
  const metro = Math.floor(price * 0.05);
  const finder = Math.floor(price * 0.1);

  result.innerHTML = `
    <p><u>Заказ №${orderNum}</u> | ${platform}</p>
    <p>После -15%: ${after15} руб</p>
    <p>Запасной: ${zapas} руб</p>
    <p>1 ранг: ${r1} руб</p>
    <p>2 ранг: ${r2} руб</p>
    <p>3 ранг: ${r3} руб</p>
    <p>Зам: ${zam} руб</p>
    <hr>
    <p>Метрошоп: ${metro} руб</p>
    <p>${tgUser}: ${finder} руб</p>
  `;

  copyBox.value = `Заказ [№${orderNum} - ${platform}]
${orderText}

ЗП за помощь:
Запасной - ${zapas}р
1 ранг - ${r1}р
2 ранг - ${r2}р
3 ранг - ${r3}р
Зам - ${zam}р

Метрошоп - ${metro}р
${tgUser} - ${finder}р

+ В чат кто идет`;

  // Показываем кнопки после расчета
  successBtn.style.display = "block";
  failBtn.style.display = "block";
}

// ==================== Показ блоков Удачного/Неудачного ====================
function showSuccess() {
  successBlock.style.display = "block";
  failBlock.style.display = "none";
}

function showFail() {
  failBlock.style.display = "block";
  successBlock.style.display = "none";
}

// ==================== Добавление игрока ====================
function addPlayer() {
  playerCount++;

  const div = document.createElement("div");
  div.style.marginBottom = "15px";
  div.style.paddingBottom = "15px";
  div.style.borderBottom = "2px solid rgba(255,255,255,0.2)";
  div.style.position = "relative";

  div.innerHTML = `
    <div style="margin-bottom:10px;font-weight:bold;">Участник №${playerCount}</div>
    <input class="user" placeholder="Юз (@user)" style="margin-bottom:10px;">
    <select class="rank" style="margin-bottom:10px;padding:12px;font-size:16px;">
      <option value="23">Запасной (23%)</option>
      <option value="25">1 ранг (25%)</option>
      <option value="27">2 ранг (27%)</option>
      <option value="31">3 ранг (31%)</option>
      <option value="33">Зам (33%)</option>
    </select>
    <input class="games" type="number" placeholder="Сыграно каток" style="margin-bottom:10px;">
  `;

  // Кнопка удаления для всех кроме первого
  if (playerCount > 1) {
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Удалить";
    removeBtn.style.background = "#e53935";
    removeBtn.style.marginBottom = "10px";
    removeBtn.onclick = () => {
      div.remove();
    };
    div.appendChild(removeBtn);
  }

  playersDiv.appendChild(div);
  div.scrollIntoView({ behavior: "smooth", block: "end" });
}

// ==================== Формирование текста Удачного выполнения ====================
function makeSuccess() {
  const price = Number(priceInput.value);
  const winGames = Number(document.getElementById("winGames").value);
  const orderNum = orderNumInput.value || "?";
  const platform = platformInput.value || "—";
  const tgUser = tgInput.value.trim() || "Не указан";

  if (!price || !winGames) {
    alert("Заполни цену и общее количество удачных каток!");
    return;
  }

  const rows = document.querySelectorAll("#players > div");
  if (rows.length === 0) {
    alert("Добавь хотя бы одного участника!");
    return;
  }

  const after15 = Math.floor(price * 0.85);
  let metro = Math.floor(price * 0.05);
  const finder = Math.floor(price * 0.1);

  let totalUsed = 0;
  const playersMoney = {};

  for (let row of rows) {
    const user = row.querySelector(".user").value.trim();
    const percent = Number(row.querySelector(".rank").value);
    const games = Number(row.querySelector(".games").value);

    if (!user || !games) {
      alert("Заполни все поля участников!");
      return;
    }
    if (games > winGames) {
      alert("Количество каток больше общего числа!");
      return;
    }

    const money = Math.floor(after15 * (percent / 100) * (games / winGames));
    totalUsed += money;

    if (playersMoney[user]) {
      playersMoney[user] += money;
    } else {
      playersMoney[user] = money;
    }
  }

  metro += after15 - totalUsed;

  // TG пользователь — если совпадает, добавляем к существующей сумме
  if (playersMoney[tgUser]) {
    playersMoney[tgUser] += finder;
  } else {
    playersMoney[tgUser] = finder;
  }

  // Формируем текст
  let text = `📊Удачное выполнение заказа [№${orderNum} - ${platform}]📊\n😍Зп за помощь 😍\n`;

  for (const user in playersMoney) {
    text += `${user} + ${playersMoney[user]}р\n`;
  }

  text += `\nМетрошоп + ${metro}р`;

  document.getElementById("successCopy").value = text;
}

// ==================== Формирование текста Неудачного выполнения ====================
function makeFail() {
  const users = document
    .getElementById("failUsers")
    .value.split(" ")
    .filter((u) => u);
  if (users.length === 0) {
    alert("Введи хотя бы одного участника!");
    return;
  }
  const text = users.map((u) => `${u} - 0р`).join("\n");
  document.getElementById("failCopy").value =
    `❌ Неудачное выполнение\n${text}`;
}

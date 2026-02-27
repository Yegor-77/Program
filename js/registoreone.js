// ===== Пользователи =====
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
function getCurrentUser() {
  const id = localStorage.getItem("currentUserId");
  if (!id) return null;
  return getUsers().find((u) => u.id === id);
}
function saveCurrentUser(user) {
  localStorage.setItem("currentUserId", user.id);
}
function logoutUser() {
  localStorage.removeItem("currentUserId");
  location.reload();
}

// ===== Выбор роли =====
let chosenRole = null;
function chooseRole(role) {
  chosenRole = role;
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("roleTitle").innerText =
    role === "admin" ? "Админ" : "Пользователь";
  showRegister();
}

// ===== Показ форм =====
function showRegister() {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}
function showLogin() {
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
}
function showWelcome() {
  document.getElementById("welcomeScreen").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}

// ===== Проверка корректности данных =====
function hasProfileErrors(user) {
  if (!user) return true;
  if (
    !user.username ||
    !user.email ||
    !user.phone ||
    !user.password ||
    !user.tg
  )
    return true;
  if (user.phone && !/^\d{9,}$/.test(user.phone)) return true;
  return false;
}

// ===== Регистрация =====
function register() {
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const tg = document.getElementById("regTG").value.trim();

  if (!username || !email || !phone || !password || !tg) return; // не пропускаем
  if (!/^\d{9,}$/.test(phone)) return; // не пропускаем

  const users = getUsers();
  if (chosenRole === "admin") {
    if (!/^admin([1-9]|1[0-9]|20)$/.test(username)) return;
    if (users.some((u) => u.username === username && u.role === "admin"))
      return;
  } else {
    if (users.some((u) => u.username === username)) return;
  }

  const newUser = {
    id: "user_" + (users.length + 1),
    role: chosenRole || "user",
    username,
    email,
    phone,
    tg,
    password,
    history: [],
  };
  users.push(newUser);
  saveUsers(users);
  saveCurrentUser(newUser);
  startDashboard();
}

// ===== Вход =====
function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const user = getUsers().find(
    (u) => u.username === username && u.password === password,
  );
  if (!user) return;
  saveCurrentUser(user);
  startDashboard();
}

// ===== Дашборд =====
const profileIcon = document.getElementById("profileIcon");
const profileSettings = document.getElementById("profileSettings");
profileIcon?.addEventListener("click", () => {
  profileSettings.style.display =
    profileSettings.style.display === "none" ? "block" : "none";
});
function saveProfile() {
  const user = getCurrentUser();
  if (!user) return;
  const setUsername = document.getElementById("setUsername").value.trim();
  const setEmail = document.getElementById("setEmail").value.trim();
  const setPhone = document.getElementById("setPhone").value.trim();
  const setTG = document.getElementById("setTG").value.trim();
  const setPassword = document.getElementById("setPassword").value.trim();

  const tempUser = {
    ...user,
    username: setUsername || user.username,
    email: setEmail || user.email,
    phone: setPhone || user.phone,
    tg: setTG || user.tg,
    password: setPassword || user.password,
  };
  if (hasProfileErrors(tempUser)) return; // не разрешаем сохранить, если есть ошибки

  Object.assign(user, tempUser);
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  users[idx] = user;
  saveUsers(users);
}

// ===== Кнопка назад =====
const backBtn = document.getElementById("backBtn");
backBtn?.addEventListener("click", () => {
  showWelcome();
});

// ===== Старт дашборда =====
function startDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  document.getElementById("showCalculatorBtn").style.display = "inline-block";
  document.getElementById("adminPanel").style.display =
    user.role === "admin" ? "block" : "none";
}

// ===== История калькулятора (максимум 100 записей) =====
function saveHistory(entry) {
  let history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
  history.push(entry);
  if (history.length > 100) history.shift();
  localStorage.setItem("calcHistory", JSON.stringify(history));
}

// ===== Просмотр истории калькулятора (только админ) =====
function viewHistory() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return;
  const secret = prompt("Введите секретное слово для просмотра истории:");
  if (secret !== "1") return;

  const history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
  const html = history
    .map((h, i) => `${i + 1}. ${JSON.stringify(h)}`)
    .join("\n");
  alert("История калькулятора:\n" + html);
}

// ===== Калькулятор =====
const orderTextInput = document.querySelector(".orderText");
const platformInput = document.querySelector(".platform");
const orderNumInput = document.querySelector(".orderNum");
const priceInput = document.querySelector(".price");
const tgInput = document.querySelector(".tg");
const result = document.querySelector(".result");
const copyBox = document.querySelector(".copyBox");
const successBtn = document.getElementById("successBtn");
const failBtn = document.getElementById("failBtn");

function showCalculator() {
  const user = getCurrentUser();
  if (!user) return;
  if (hasProfileErrors(user)) return; // блокируем доступ, пока не исправят
  document.getElementById("calculator").style.display = "block";
}

function calculate() {
  const price = Number(priceInput.value);
  if (!price) {
    result.innerHTML = "Введите стоимость";
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

  saveHistory({
    orderNum,
    platform,
    orderText,
    price,
    tgUser,
    after15,
    zapas,
    r1,
    r2,
    r3,
    zam,
    metro,
    finder,
  });
  successBtn.style.display = "block";
  failBtn.style.display = "block";
}

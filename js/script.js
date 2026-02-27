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
  showWelcome();
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

// ===== Выбор роли =====
let chosenRole = null;
function chooseRole(role) {
  chosenRole = role;
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("roleTitle").innerText =
    role === "admin" ? "Админ" : "Пользователь";
  showRegister();
}

// ===== Показ экранов =====
function showRegister() {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}
function showWelcome() {
  document.getElementById("welcomeScreen").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}

// ===== Регистрация =====
function register() {
  const username = document.getElementById("regUsername").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const tg = document.getElementById("regTG").value.trim();

  if (!username || !email || !phone || !password || !tg) return;
  if (!/^\d{9,}$/.test(phone)) return;

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

// ===== Настройки профиля =====
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

  if (hasProfileErrors(tempUser)) return;

  Object.assign(user, tempUser);
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  users[idx] = user;
  saveUsers(users);
}

// ===== Старт дашборда =====
function startDashboard() {
  const user = getCurrentUser();
  if (!user) {
    showWelcome();
    return;
  }

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  document.getElementById("showCalculatorBtn").style.display = "inline-block";
  document.getElementById("adminPanel").style.display =
    user.role === "admin" ? "block" : "none";

  // Проверка профиля для калькулятора
  const calcBtn = document.getElementById("showCalculatorBtn");
  if (hasProfileErrors(user)) {
    calcBtn.onclick = () => alert("❌ Ваш профиль неполный! Исправьте данные.");
  } else {
    calcBtn.onclick = showCalculator;
  }

  // Подставляем данные профиля в настройки
  document.getElementById("setUsername").value = user.username;
  document.getElementById("setEmail").value = user.email;
  document.getElementById("setPhone").value = user.phone;
  document.getElementById("setTG").value = user.tg;
}

// ===== Кнопка назад =====
const backBtn = document.getElementById("backBtn");
backBtn?.addEventListener("click", () => {
  const user = getCurrentUser();
  // если пользователь не залогинен — к меню выбора роли
  if (!user) showWelcome();
  else startDashboard();
});

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
  if (hasProfileErrors(user)) return;
  document.getElementById("calculator").style.display = "block";
}

// ===== При загрузке страницы =====
window.addEventListener("load", () => {
  const user = getCurrentUser();
  if (user) startDashboard();
  else showWelcome(); // показываем меню регистрации/входа
});

function updateBackButton() {
  const user = getCurrentUser();
  const welcomeVisible =
    document.getElementById("welcomeScreen").style.display !== "none";

  // Кнопка видна, если это не главное меню и есть пользователь
  if (!welcomeVisible && user) {
    backBtn.style.display = "block";
  } else {
    backBtn.style.display = "none";
  }
}

// Вызывать после каждой смены экрана
function showRegister() {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  updateBackButton();
}

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  updateBackButton();
}

function showWelcome() {
  document.getElementById("welcomeScreen").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
  updateBackButton();
}

function startDashboard() {
  const user = getCurrentUser();
  if (!user) return showWelcome();

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  updateBackButton();
}

// Обработчик кнопки назад
backBtn.addEventListener("click", () => {
  const user = getCurrentUser();
  // Если пользователь не залогинен — к выбору роли
  if (!user) showWelcome();
  else startDashboard();
});
// Открыть меню истории
document.getElementById("rightMenuBtn").addEventListener("click", () => {
  const historyScreen = document.getElementById("historyScreen");
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("calcHistory") || "[]");
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<p>История пуста</p>";
  } else {
    history.forEach((h, i) => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";
      div.style.padding = "10px";
      div.style.background = "rgba(255,255,255,0.1)";
      div.style.borderRadius = "8px";
      div.innerHTML = `<strong>${i + 1}.</strong> Заказ №${h.orderNum} | ${h.platform} | ${h.orderText}`;
      historyList.appendChild(div);
    });
  }
  historyScreen.style.display = "block";
});

// Кнопка назад в истории
document.getElementById("historyBackBtn").addEventListener("click", () => {
  document.getElementById("historyScreen").style.display = "none";
});

// Открыть экран истории по кнопке меню справа
document.getElementById("rightMenuBtn").addEventListener("click", () => {
  const historyScreen = document.getElementById("historyScreen");
  const historyList = document.getElementById("historyList");
  const history = JSON.parse(localStorage.getItem("calcHistory") || "[]");

  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = "<p>История пуста</p>";
  } else {
    history.forEach((h, i) => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";
      div.style.padding = "10px";
      div.style.background = "rgba(255,255,255,0.1)";
      div.style.borderRadius = "8px";
      div.innerHTML = `<strong>${i + 1}.</strong> Заказ №${h.orderNum} | ${h.platform} | ${h.orderText}`;
      historyList.appendChild(div);
    });
  }

  historyScreen.style.display = "block";
});

// Кнопка назад в истории
document.getElementById("historyBackBtn").addEventListener("click", () => {
  document.getElementById("historyScreen").style.display = "none";
});

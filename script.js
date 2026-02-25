const priceInput = document.querySelector(".price");
const tgInput = document.querySelector(".tg");
const result = document.querySelector(".result");
const orderTextInput = document.querySelector(".orderText");
const platformInput = document.querySelector(".platform");
const orderNumInput = document.querySelector(".orderNum");
const copyBox = document.querySelector(".copyBox");

function calculate() {
  const price = Number(priceInput.value);
  if (!price) {
    result.innerHTML = "Введите стоимость сопровода";
    return;
  }

  const tgUser = tgInput.value || "Не указан";
  const orderText = orderTextInput.value || "—";
  const platform = platformInput.value || "—";
  const orderNum = orderNumInput.value || "?";

  const after15 = Math.floor(price * 0.85);

  const zapas = Math.floor(after15 * 0.23);
  const r1 = Math.floor(after15 * 0.25);
  const r2 = Math.floor(after15 * 0.27);
  const r3 = Math.floor(after15 * 0.31);
  const zam = Math.floor(after15 * 0.33);
  const zamZapas = Math.floor(after15 * 0.2);

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
    <p>Запасной зам: ${zamZapas} руб</p>
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
Запасной зам - ${zamZapas}р

Метрошоп - ${metro}р
${tgUser} - ${finder}р

+ В чат кто идет`;
}

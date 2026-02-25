const nameInput = document.querySelector(".name");
const surnameInput = document.querySelector(".surname");
const phoneInput = document.querySelector(".phone");
const emailInput = document.querySelector(".email");
const list = document.querySelector(".list");

function addContact() {
  const contact =
    nameInput.value +
    " " +
    surnameInput.value +
    " | " +
    phoneInput.value +
    " | " +
    emailInput.value;

  list.innerHTML += `<li>${contact} <button onclick="this.parentElement.remove()">X</button></li>`;

  localStorage.setItem("contacts", list.innerHTML);

  clearInputs();
}

function clearInputs() {
  nameInput.value = "";
  surnameInput.value = "";
  phoneInput.value = "";
  emailInput.value = "";
}

list.innerHTML = localStorage.getItem("contacts") || "";

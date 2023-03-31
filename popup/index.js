const btnScripting = document.getElementById("btnPaginar");
const pMensaje = document.getElementById("mensajes");


btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ message: "start" });
  // port.onMessage.addListener(({ data }) => {
  //   pMensaje.innerText = JSON.stringify(data, null, 2);
  // });
});

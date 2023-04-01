const btnScripting = document.getElementById("btnPaginar");
const pMensaje = document.getElementById("mensajes");

btnScripting.addEventListener("click", async () => {
  const port = chrome.runtime.connect({ name: "popup-background" });
  port.postMessage({ message: "start" });
  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    pMensaje.innerText= JSON.stringify(request.data,null,2)
    
  });
});

const saveObjectInLocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ status: obj }).then(() => {
        resolve(obj);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

const getObjectInLocalStorage = async function (key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function ({ message }, sender, sendResponse) {
    if (message === "start") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab) return;

      await saveObjectInLocalStorage(message);
      let portContent = chrome.tabs.connect(tab.id, {
        name: "background-content",
      });
      portContent.postMessage({ message: "scrap" });
      return;
      // portContent.onMessage.addListener(async ({ message, data }) => {
      //   if (message === "ok") {
      //     port.postMessage({ data: data });
      //   }
      //   if (message === "nextPage") {
      //     portContent.postMessage({ message: "scrap" });
      //   }
      // });
    }
    // const status = await getObjectInLocalStorage("status");
    // if (message === "next") {
    //   await chrome.tabs.update(sender.sender.tab.id, {
    //     url: "https://www.occ.com.mx/empleos/trabajo-en-tecnologias-de-la-informacion-sistemas-cientifico-de-datos/?page=3",
    //   });
    //   //sendResponse({message: "scrap"})
    //   return;
    // }

    // if (message === "finish") {
    //  const status = await getObjectInLocalStorage("status");
    //  console.log(status);
    //   if (status.status === "start") {
    //     port.postMessage({ message: "nextpage" });
    //   }
    // }
  });
});

const saveObjectInLocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set({ status: obj }).then(() => {
        resolve(obj)
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
  port.onMessage.addListener(async function ({ message }) {
    if (message === "startscrap") {
      const status = "start";
      await saveObjectInLocalStorage(status);
    }
    if (message === "finish") {
      const status = await getObjectInLocalStorage("status");
      console.log(status)
      if (status.status === "start") {
        port.postMessage({ message: "nextpage" });
      }
    }
  });
});

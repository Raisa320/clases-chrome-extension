const saveObjectInLocalStorage = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.set(obj).then(() => {
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

chrome.storage.local.set({ status: "stop" }).then(() => {
  console.log("Background start status is: STOP");
});

function addPageToUrl(url) {
  const regex = /page=(\d+)/;
  const match = url.match(regex);
  const page = match && match[1];
  const newPage = parseInt(page) + 1;
  return url.replace(regex, `page=${newPage}`);
}

function groupByCity(jobsArray) {
  console.log(jobsArray.length);
  let personasPorEdad = jobsArray.reduce((acumulador, persona) => {
    if (persona) {
      if (!acumulador[persona?.companyCity]) {
        acumulador[persona.companyCity] = [];
      }
      acumulador[persona?.companyCity].push(persona);
    }
    return acumulador;
  }, {});

  console.log(personasPorEdad);
  // return jobsArray.reduce((groups, job) => {
  //   if (job.companyCity) {
  //     groups = groups ?? []
  //     const jobGroup = groups[property] || [];
  //     jobGroup.push(job);
  //     groups[property] = jobGroup;
  //     return groups;
  //   }
  // }, {});
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async function ({ message, data }, sender) {
    const { status } = await getObjectInLocalStorage(["status"]);

    if (message === "start") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab) return;

      await saveObjectInLocalStorage({ status: "start" });

      let port = chrome.tabs.connect(tab.id, { name: "background-content" });
      port.postMessage({ message: "scrap" });
      return;
    }

    if (message === "next") {
      const { dataJobs } = await getObjectInLocalStorage(["dataJobs"]);
      //console.log("OLD JOBS:",dataJobs)
      await saveObjectInLocalStorage({ dataJobs: data.concat(dataJobs) });
      //console.log("NEW JOBS",datapruen)
      const url = addPageToUrl(sender.sender.tab.url);
      await chrome.tabs.update(sender.sender.tab.id, {
        url: url,
      });
      return;
    }

    if (message === "stop") {
      const { dataJobs } = await getObjectInLocalStorage(["dataJobs"]);
      const dataJobsStorage = await saveObjectInLocalStorage({
        dataJobs: data.concat(dataJobs),
      }).then(
        chrome.storage.local.remove("dataJobs", function () {
          console.log("El objeto dataJobs ha sido eliminado.");
        })
      );
      console.log(dataJobsStorage.dataJobs);
      const dataJobsStadistic = groupByCity(dataJobsStorage.dataJobs);
      await saveObjectInLocalStorage({ status: "stop" });
      chrome.runtime.sendMessage({ message: "ok", data: "dataJobsStadistic" });
      return;
    }

    if (message === "online" && status === "start") {
      port.postMessage({ message: "scrap" });
      return;
    }
  });
});

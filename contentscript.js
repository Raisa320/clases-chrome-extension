console.log("Ejecutando el content script 1.0");
function verifyBenefits(benefits) {
  if (benefits.className.includes("fresnel-container")) {
    return "No se detalla";
  }
  return (benefits = benefits.innerText.split("\n"));
}

function getJobsInformation() {
  const elementCardJobs = [...document.querySelectorAll("[id^='jobcard-']")];
  const jobs = elementCardJobs.map((cardJob) => {
    let [
      { href: url },
      {
        children: [
          {
            children: [
              { innerText: date },
              { innerText: title },
              { innerText: salario },
              benefits,
              infoCompany,
            ],
          },
        ],
      },
    ] = cardJob.children;

    if (infoCompany.className.includes("fresnel-container")) {
      infoCompany = infoCompany.nextSibling;
    }

    [infoCompany] = infoCompany.children;
    const companyName = infoCompany?.querySelectorAll("label")[0].innerText;
    const companyCity = infoCompany?.querySelectorAll("p")[0].innerText;

    return {
      url,
      date: date.split("\n")[0],
      title,
      salario,
      benefits: verifyBenefits(benefits),
      companyName,
      companyCity,
    };
  });
  return jobs;
}
function clickNextButton() {
  const nextPageBtn = document.querySelector("[class*='next-']");
  nextPageBtn.click();
}
//Connect to background
const portBackground = chrome.runtime.connect({ name: "content-background" });
portBackground.postMessage({ message: "online" });
portBackground.onMessage.addListener(async ({ message }) => {
  if (message === "scrap") {
    const jobs = getJobsInformation();
    clickNextButton();
    //port.postMessage({ message: "ok", data: jobs });

    // portBackground.postMessage({ message: "finish" });
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function ({ message }) {
    console.log(`${port.name}: message`);

    if (message === "scrap") {
      const jobs = getJobsInformation();
      const nextPageBtn = document.querySelector("[class*='next-']");
      const message = !!nextPageBtn ? "next" : "";
      console.log(message);
      portBackground.postMessage({ message });
      //clickNextButton();
      //port.postMessage({ message: "ok", data: jobs });

      // portBackground.postMessage({ message: "finish" });
    }
  });
});

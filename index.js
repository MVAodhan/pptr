const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://github.com/trending");

  await page.on("load").click("#select-menu-language > summary");

  await page.waitForTimeout(2000);

  await page.type(
    "#select-menu-language > details-menu > div.select-menu-filters > filter-input > input",
    "javascript",
    { delay: 100 }
  );
  await page.waitForTimeout(2000);
  await page.keyboard.press("Enter");

  await page.waitForTimeout(2000);

  // await page.waitForNavigation();

  await page.exposeFunction("generateObjects", (filteredRepos) => {
    let parsedObjects = [];
    filteredRepos.forEach((repo) => {
      let repoInfo = {
        repoID: uuidv4(),
        repoName: repo.repoName,
        repoLanguage: repo.repoLanguage,
        repoStars: repo.repoStars,
      };
      parsedObjects = [...parsedObjects, repoInfo];
    });
    //returns from filteredRepo forEach
    return parsedObjects;
  });

  const repos = await page.evaluate(async () => {
    let repoContainers = document.querySelectorAll("article.Box-row");
    let repoContainersArray = [...repoContainers];

    let filteredRepos = repoContainersArray.map((repoContainer) => {
      let repoName = "";
      let repoLanguage = "";
      let repoStars = "";
      if (repoContainer.children.length === 4) {
        repoName = repoContainer.children[1].children[0].innerText;
        repoLanguage =
          repoContainer.children[3].children[0].children[1].innerText;
        repoStars = repoContainer.children[3].children[1].innerText;
      }

      return { repoName, repoLanguage, repoStars };
    });

    let parseObjects = await window.generateObjects(filteredRepos);

    //return from page.evaluate [repos]

    return parseObjects;
  });

  console.log(repos);

  await browser.close();
})();

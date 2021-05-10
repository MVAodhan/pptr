const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://github.com/trending");
  await page.on("load").click("#select-menu-language > summary");

  await page.type(
    "#select-menu-language > details-menu > div.select-menu-filters > filter-input > input",
    "javascript",
    { delay: 100 }
  );
  await page.keyboard.press("Enter");

  await page.exposeFunction("generateObjects", (filteredRepos) => {
    let parsedObjects = [];
    filteredRepos.forEach((repo) => {
      let repoInfo = {
        repoID: uuidv4(),
        repoName: repo,
      };
      parsedObjects = [...parsedObjects, repoInfo];
    });
    //returns from filteredRepo forEach
    return parsedObjects;
  });

  const repos = await page.evaluate(async () => {
    let repoContainer = document.querySelectorAll("article.Box-row");
    let repoContainersArray = [...repoContainer];

    let filteredRepos = repoContainersArray.map((repo) => {
      let repoContainerName = repo.children[1].children[0].innerText;

      return repoContainerName;
    });

    let parseObjects = await window.generateObjects(filteredRepos);

    //return from page.evaluate [repos]

    return parseObjects;
  });

  console.log(repos);

  await browser.close();
})();

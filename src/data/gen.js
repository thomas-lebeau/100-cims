const playwright = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await playwright.chromium.launch({
    headless: true,
    timeout: 0,
  });

  const page = await browser.newPage();
  await page.goto('https://www.feec.cat/activitats/100-cims/');
  // await page.locator('#cims_essencials').click();

  const urls = await getLinks(page);
  // const urls = [
  //   'https://www.feec.cat/activitats/100-cims/cim/bony-de-la-pica-o-pica-dos/',
  // ];

  console.log('found %d pages', urls.length);

  const cims = [];

  for (const url of urls) {
    console.log('parsing %d of %d', urls.indexOf(url) + 1, urls.length);
    cims.push(await getDetails(page, url));
  }

  fs.writeFileSync('cims.json', JSON.stringify(cims, null, 2));

  console.log('Done');

  await browser.close();
}

async function getLinks(page, pageCount = 1, urls = []) {
  console.log('page %d', pageCount);
  const links = page.locator('.ajax_results > a');

  await links.first().waitFor();
  await page.waitForTimeout(2000);

  const count = await links.count();

  for (let i = 0; i < count; i++) {
    urls.push(await links.nth(i).getAttribute('href'));
  }

  const nextPageCount = pageCount + 1;
  const nextPage = page.locator(
    `li:not(.disabled) a[data-page="${nextPageCount}"]`
  );

  if ((await nextPage.count()) <= 0) {
    return urls;
  }

  await nextPage.first().click();

  return await getLinks(page, nextPageCount, urls);
}

async function getDetails(page, url) {
  await page.goto(url);

  const name = await page.locator('h1').textContent();

  let img = null;

  try {
    img = await page.locator('.attachment-post-thumbnail').getAttribute('src');
  } catch {} // eslint-disable-line no-empty

  const comarca = (
    await page.locator(':text("Comarca:") + div').textContent()
  ).trim();

  const altitude = (
    await page.locator(':text("Altitud:") + div').textContent()
  ).match(/\d+/)[0];

  const latitude = (
    await page.locator(':text("Latitud:") + div').textContent()
  ).replace('º', '');

  const longitude = (
    await page.locator(':text("Longitud:") + div').textContent()
  ).replace('º', '');

  const essencial = (await page.locator(':text("Cim essencial")').count()) > 0;

  return {
    name,
    url,
    img,
    comarca,
    altitude,
    latitude,
    longitude,
    essencial,
  };
}

main();

const puppeteer = require('puppeteer');

let browser, page;
beforeEach(async () => {
    browser = await puppeteer.launch({});
    page  = await browser.newPage();
    await page.goto('localhost:3000');
});

test('launch a browser', async() => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML );
    expect(text).toEqual('Blogster');
    
});

afterEach( () => {
    browser.close();
})
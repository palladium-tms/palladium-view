import 'jasmine';
import { Builder, ThenableWebDriver, WebElement, By, WebElementPromise, until } from 'selenium-webdriver';
import { Browser } from '../framework/lib/browser';
import { AllPages } from '../framework/pages/all_pages';
describe('Login page', () => {
  let pages: AllPages;

  beforeEach(() => {
    pages = new AllPages(new Browser('chrome'));
  });

  it('can be opened', async () => {
    await pages.singinPage.navigate();

    expect(true).toBe(true);
  });

  afterEach(async () => {
    await this.instance.quit();
  });
});

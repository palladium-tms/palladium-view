import 'chromedriver';
import { Builder, ThenableWebDriver, WebElement, By, WebElementPromise, wait } from 'selenium-webdriver';
import {WaitCondition} from './conditions';

export class Browser {
  private driver: ThenableWebDriver;
  constructor(private browserName: string) {
    this.driver = new Builder().forBrowser(browserName).build();
  }
  async navigate(url: string): Promise<void> {
    await this.driver.navigate().to(url);
  }

  findElement(selector: string): WebElementPromise {
    return this.driver.findElement(By.css(selector));
  }

  async wait(condition: WaitCondition) {
    await this.waitAny(condition);
  }

  async waitAny(conditions: WaitCondition | WaitCondition[]): Promise<void> {
    const all = (!(conditions instanceof Array)) ? [ conditions ] : conditions;

    await this.driver.wait(async () => {
      for (const condition of all) {
        try {
          if (await condition(this) === true) {
            return true;
          }

        } catch (ex) {

        }
      }
    });
  }

  async close(): Promise<void> {
    await this.driver.quit();
  }
}


import { WebElementPromise } from 'selenium-webdriver';

export class WebComponent {
  constructor(protected element: WebElementPromise, public selector: string) { }

  async click() {
    try {
      return await this.element.click();
    } catch (clickErr) {
      try {
        await this.element.getDriver().executeScript('arguments[0].click();', this.element);
      } catch (jsErr) {
        throw clickErr;
      }
    }
  }

  async isDisplayed() {
    try {
      return await this.element.isDisplayed();
    } catch (ex) {
      return false;
    }
  }

  async getText() {
    return this.element.getText();
  }
}

export class Button extends WebComponent {
  constructor(element: WebElementPromise, selector: string) {
    super(element, selector);
  }

  async isDisabled() {
    try {
      return await this.element.getAttribute('disabled') === 'disabled';
    } catch (ex) {
      return false;
    }
  }
}

export class TextInput extends WebComponent {
  constructor(element: WebElementPromise, selector: string) {
    super(element, selector);
  }

  type(text: string) {
    return this.element.sendKeys(text);
  }
}

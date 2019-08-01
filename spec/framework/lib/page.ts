import { Browser } from './browser';
import { WaitCondition} from './conditions';

export abstract class Page {
  private url: string;

  protected setUrl(url: string) {
    this.url = url;
  }

  async navigate(): Promise<void> {
    await this.browser.navigate(this.url);
    await this.browser.wait(this.loadCondition());
  }

  abstract loadCondition(): WaitCondition;

  constructor(protected browser: Browser) {}
}

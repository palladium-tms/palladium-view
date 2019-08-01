import { SinginPage } from './singinPage';
import { Browser } from '../lib/browser';

export {
  SinginPage,
};

export class AllPages {
  singinPage: SinginPage;

  constructor(public browser: Browser) {
    this.singinPage = new SinginPage(browser);
  }

  async dispose(): Promise<void> {
    await this.browser.close();
  }
}

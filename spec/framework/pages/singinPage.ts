import {Page} from '../lib/page';
import {Browser} from '../lib/browser';
import {elementIsPresent} from '../lib/conditions';
import {TextInput} from '../lib/web_component';
import {findBy} from '../lib/utilits';

export class SinginPage extends Page {

  constructor(browser: Browser) {
    super(browser);
  }

  @findBy('#email')
  email: TextInput;

  loadCondition() {
    return elementIsPresent(() => this.email);
  }
}

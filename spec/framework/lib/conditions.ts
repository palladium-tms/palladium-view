import { Browser} from './browser';
import {WebComponent} from './web_component';

export type WaitCondition = (browser: Browser) => Promise<boolean>;

export function elementIsPresent(locator: () => WebComponent): WaitCondition {
  return async () => await locator() !== undefined;
}

import { PalladiumPage } from './app.po';

describe('palladium App', () => {
  let page: PalladiumPage;

  beforeEach(() => {
    page = new PalladiumPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

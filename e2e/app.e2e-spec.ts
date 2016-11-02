import { PimpFrontendPage } from './app.po';

describe('pimp-frontend App', function() {
  let page: PimpFrontendPage;

  beforeEach(() => {
    page = new PimpFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

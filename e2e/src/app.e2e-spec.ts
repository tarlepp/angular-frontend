import { browser, logging } from 'protractor';

import { AppPage } from './app.po';

describe('workspace-project App', (): void => {
  let page: AppPage;

  beforeEach((): void => {
    page = new AppPage();
  });

  it('should display welcome message', (): void => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('angular-frontend app is running!');
  });

  afterEach(async (): Promise<any> => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    }));
  });
});

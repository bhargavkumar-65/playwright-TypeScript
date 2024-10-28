import { Page,expect,test } from "@playwright/test";

function step(target: Function, context: ClassMethodDecoratorContext) {
    return function replacementMethod(...args: any) {
      const name = this.constructor.name + '.' + (context.name as string);
      return test.step(name, async () => {
        return await target.call(this, ...args);
      });
    };
  }
  
  class LoginPage {
    constructor(readonly page: Page) {}
  
    @step
    async login() {
      const account = { username: 'Alice', password: 's3cr3t' };
      await this.page.getByLabel('Username or email address').fill(account.username);
      await this.page.getByLabel('Password').fill(account.password);
      await this.page.getByRole('button', { name: 'Sign in' }).click();
      await expect(this.page.getByRole('button', { name: 'View profile and more' })).toBeVisible();
    }
  }
  
  test('example', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
  });

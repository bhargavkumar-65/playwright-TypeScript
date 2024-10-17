// my-test.ts
import { test as base } from '@playwright/test'
import { GoogleHomePageActions } from '../pages/actions/GoogleHomePageActions'
import { LoginPageActions } from '../pages/actions/LoginPageActions'
const envConfig = require('../../resources/env/envConfig.json')
import log from '../helpers/log'

// Declare the types of your fixtures.
type MyFixtures = {
    pg_GoogleHomePageActions:GoogleHomePageActions
    pg_LoginPageActions:LoginPageActions
    //environment: string | TestEnvironments
}

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({
    pg_GoogleHomePageActions: async ({ page }, use) => {
        return await use(new GoogleHomePageActions(page))
    },
    pg_LoginPageActions: async ({ page }, use) => {
        return await use(new LoginPageActions(page))
    },
    // pg_LoginPageActions: async ({ page, environment }, use) => {
    //     const envValue = environment ? environment : TestEnvironments.AUTRUN
    //     ApiMetadata.Environment = envValue
    //     log.info(`Test Execution Environment: ${envValue}`)
    //     process.env.BASEURL = envConfig[envValue].baseUrl!
    //     process.env.APIBASEURL = envConfig[envValue].apiBaseUrl!
    //     await page.goto(envConfig[envValue].baseUrl!)
    //     await page.reload()
    //     await use(new LoginPageActions(page))
    // },
})
export { expect } from '@playwright/test'


export function step(stepName?: string) {
    return function decorator(
      target: Function,
      context: ClassMethodDecoratorContext
    ) {
      return function replacementMethod(...args: any) {
        const name = `${stepName || (context.name as string)} (${this.name})`
        return test.step(name, async () => {
          return await target.call(this, ...args)
        })
      }
    }
  }


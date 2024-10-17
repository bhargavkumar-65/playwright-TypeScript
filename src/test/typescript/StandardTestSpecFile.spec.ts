import { test } from '../../main/typescript/base/customFixtures'

import { LoginPageActions } from '../../main/typescript/pages/actions/LoginPageActions'
import { GoogleHomePageActions } from '../../main/typescript/pages/actions/GoogleHomePageActions'
import log from '../../main/typescript/helpers/log'
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ pg_LoginPageActions }) => {
    //await pg_LoginPageActions.loginintoHome()
    await pg_LoginPageActions.page.waitForTimeout(5 * 1000)
})

test.describe(`TestSuite 1:`, () => {
    test('TestCase1', async ({ pg_GoogleHomePageActions },testInfo) => {
    log.info(`------------------------- ${testInfo.title} -----------------`)
        await pg_GoogleHomePageActions.page.goto('https://google.com')
        await pg_GoogleHomePageActions.googleSearch()
    })

    test('TestCase2', async ({ pg_GoogleHomePageActions },testInfo) => {
        log.info(`------------------------- ${testInfo.title} -----------------`)
        await pg_GoogleHomePageActions.page.goto('https://google.com')
        await pg_GoogleHomePageActions.googleSearch()
    })


})

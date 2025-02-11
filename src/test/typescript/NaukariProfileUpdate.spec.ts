import { test } from '../../main/typescript/base/customFixtures'
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(5 * 1000)
})

test.describe(`NaukariProfileUpdate :`, () => {
    test('Naukari', async ({ naukariPageActions }, testInfo) => {
        await naukariPageActions.loginintoNaukari()
    })

})

import { test } from '../../main/typescript/base/customFixtures'
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(5 * 1000)
})

test.describe(`TestSuite 1:`, () => {
    test('[306542],[306543] TestCase1 and 2', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })

    test('[306544] TestCase3', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })
})

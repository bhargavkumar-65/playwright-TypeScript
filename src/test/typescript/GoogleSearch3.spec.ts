import { test } from '../../main/typescript/base/customFixtures'
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(5 * 1000)
})

test.describe(`TestSuite - GooleSearch 3:`, () => {
    test('[306542],[306543] TestCase 7 and 8', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })

    test('[306544] TestCase9', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })
})

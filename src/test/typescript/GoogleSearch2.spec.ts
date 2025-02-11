import { test } from '../../main/typescript/base/customFixtures'
test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
    await page.waitForTimeout(5 * 1000)
})

test.describe(`TestSuite - GooleSearch2 :`, () => {
    test('[306542],[306543] TestCase 4 and 5', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })

    test('[306544] TestCase6', async ({ googleHomePageActions }, testInfo) => {
        await googleHomePageActions.googleSearch()
    })
})

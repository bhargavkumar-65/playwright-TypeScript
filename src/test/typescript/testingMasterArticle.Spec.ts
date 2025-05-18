import { expect } from '@playwright/test'

import { test } from '../../main/typescript/base/customFixtures'

test.describe.configure({ mode: 'parallel' })
test.beforeEach(async ({ page, homePageActions }) => {
    await homePageActions.launchApp()
    await page.waitForTimeout(5 * 1000)
})

test.describe(`Article Content`, () => {

test('Code block syntax highlighting', async ({ page, homePageActions, articlePageActions }) => {
    const count = await homePageActions.getTotalNumberOfArticles()
    for (let i = 0; i < count; i++) {
        await homePageActions.clickOnArticleCard(i)
        // Verify if the article Metadata is displayed
        await articlePageActions.verifyArticleCardMetaDataDisplay()
        // Verify if the article content is displayed
        await articlePageActions.verifyArticleCardMetaDataContentWithRegEX(`/\w+/`)
        // Look for a code block
        const codeBlock = page.locator('pre > code')
        if ((await codeBlock.count()) > 0) {
            await expect(codeBlock.first()).toBeVisible()
        }
        await page.goBack()
    }
})


test('Validate all article links (internal & external)', async ({ page, homePageActions,articlePageActions}) => {
    const count = await homePageActions.getTotalNumberOfArticles()
    for (let i = 0; i < count; i++) {
        await homePageActions.clickOnArticleCard(i)
        await articlePageActions.CheckForBrokenLinks()
    }
})

test('Content constraints', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    // Check that main content does not exceed max width
    const main = page.locator('main')
    const box = await main.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(1280)
})

})



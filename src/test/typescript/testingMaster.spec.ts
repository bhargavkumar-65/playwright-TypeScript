import { expect } from '@playwright/test'

import { test } from '../../main/typescript/base/customFixtures'

test.describe.configure({ mode: 'parallel' })
test.beforeEach(async ({ page, homePageActions }) => {
    await homePageActions.launchApp()
    await page.waitForTimeout(5 * 1000)
})

test.describe(`Home Page Content Validation`, () => {
test('Verify If any Article Images are Broken in Home Page', async ({ homePageActions}) => {
    await homePageActions.launchApp()
    await homePageActions.verifyIfAnyArticleCardImagesAreBroken()
})

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

test('Search filtering', async ({ homePageActions }) => {
    await homePageActions.search('Selenium')
    await homePageActions.clickOnFirstArticle()
})

test('Special character handling', async ({ homePageActions }) => {
    await homePageActions.search('!@#$%^&*()')
    // Should not throw, and should show either no results or handle gracefully
    // No articles found matching your criteria. Try adjusting your search or filters.
    expect(await homePageActions.validateIfFirstArticleIsDisplayed()).not.toBeTruthy()
})

test('Debounce behavior', async ({ homePageActions }) => {
    await homePageActions.search('Selenium')
    await homePageActions.search('Playwright')
    expect(await homePageActions.validateIfFirstArticleIsDisplayed()).toBeTruthy()
})

test('Theme switching (light/dark mode)', async ({ headerPageActions }) => {
    await headerPageActions.switchThemeAndVerify()
})

test('Navigation functionality', async ({ page, headerPageActions }) => {
    await headerPageActions.gotoAbout()
    await headerPageActions.gotoContact()
    await headerPageActions.gotoHome()
})

test('Category filtering', async ({ page, homePageActions }) => {
    await homePageActions.filterByCategory('API Testing')
})

const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
].forEach(vp => {
    test(`Layout for ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        // Check main sections are visible
        await expect(page.locator('#hero-section')).toBeVisible()
        await expect(page.locator('#featured-articles-section')).toBeVisible()
        await expect(page.locator('#article-list-section')).toBeVisible()
        await expect(page.locator('#about-section')).toBeVisible()
        await expect(page.locator('#contact-section')).toBeVisible()
    })
})

})

import { test as base } from '@playwright/test'

import { Utility } from '../helpers/Utility'
import { ArticlePageActions } from '../pages/actions/ArticlePageActions'
import { ContactPageActions } from '../pages/actions/ContactPageActions'
import { FooterPageActions } from '../pages/actions/FooterPageActions'
import { HeaderPageActions } from '../pages/actions/HeaderPageActions'
import { HomePageActions } from '../pages/actions/HomePageActions'
import {NaukariPageActions} from '../pages/actions/NaukariPageActions'

/**
 * Declare the Pages that you want to use in your test
 * */
type MyFixtures = {
    naukariPageActions: NaukariPageActions
    articlePageActions: ArticlePageActions
    contactPageActions: ContactPageActions
    footerPageActions: FooterPageActions
    headerPageActions: HeaderPageActions
    homePageActions: HomePageActions
    utility: Utility
}

/**
 * Create a custom fixture for above page that will be used in your test
 * */

export const test = base.extend<MyFixtures>({

    naukariPageActions: async ({ page }, use) => {
        return await use(new NaukariPageActions(page))
    },
    articlePageActions: async ({ page }, use) => {
        return await use(new ArticlePageActions(page))
    },
    contactPageActions: async ({ page }, use) => {
        return await use(new ContactPageActions(page))
    },
    footerPageActions: async ({ page }, use) => {
        return await use(new FooterPageActions(page))
    },
    headerPageActions: async ({ page }, use) => {
        return await use(new HeaderPageActions(page))
    },
    homePageActions: async ({ page }, use) => {
        return await use(new HomePageActions(page))
    },
    
    utility: async ({ page }, use) => {
        return await use(new Utility(page))
    },
})
export { expect } from '@playwright/test'

import { BasePage } from '../../base/BasePage'

import { step } from '../../helpers/Decorators'
import GoogleHomePageLocators from '../locators/GoogleHomePageLocators'

export class GoogleHomePageActions extends BasePage {
    @step('Google Search')
    async googleSearch() {
        await this.page.goto('https://google.com')
        await this.utility.waitUntilPageIsLoaded()
        // await this.utility.waitForLocator({ selector: GoogleHomePageLocators.searchBox })
        // await this.utility.click({ selector: GoogleHomePageLocators.searchBox })
        // await this.utility.typeText({ selector: GoogleHomePageLocators.searchBox, text: 'Playwright Automation' })
        // await this.utility.click({ selector: GoogleHomePageLocators.gooleImage })
        // await this.page.keyboard.press('Escape')
        // await this.utility.click({ selector: GoogleHomePageLocators.googleSearchBtn })
        // await this.utility.waitUntilPageIsLoaded()
    }
}

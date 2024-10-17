import GoogleHomePageLocators from '../locators/GoogleHomePageLocators'
import { BasePage } from '../../base/BasePage'
import { step } from '../../base/Decorators'


export class GoogleHomePageActions extends BasePage  {

    @step('GOOGLE SEARCH')
    async googleSearch() {
        await this.utility.waitUntilPageIsLoaded()
        await this.utility.waitForLocator({selector:GoogleHomePageLocators.searchBox})
        await this.utility.click({selector:GoogleHomePageLocators.searchBox})
        await this.utility.typeText({selector: GoogleHomePageLocators.searchBox, text: 'Kongsberg Digital'})
        await this.page.keyboard.press('Escape');
        await this.utility.click({selector:GoogleHomePageLocators.googleSearchBtn})
        await this.utility.waitUntilPageIsLoaded()
    }
}

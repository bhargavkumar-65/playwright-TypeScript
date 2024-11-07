import { BasePage } from '../../base/BasePage'
import MDHLoginPageLocators from '../locators/MDHLoginPageLocators'

export class LoginPageActions extends BasePage {
    async loginintoHome() {
        await this.page.goto(this.ENV.BASE_URL)
        await this.utility.waitUntilPageIsLoaded()
        await this.page.locator(MDHLoginPageLocators.emailTxtBox).waitFor({ state: 'visible', timeout: 120000 })
        await this.utility.click({ selector: MDHLoginPageLocators.emailTxtBox })
        await this.utility.typeText({ selector: MDHLoginPageLocators.emailTxtBox, text: this.ENV.USERNAME })
        await this.utility.click({ selector: MDHLoginPageLocators.NextBtn })
        await this.utility.waitUntilPageIsLoaded()
        await this.utility.click({ selector: MDHLoginPageLocators.passwordTxtBox })
        await this.utility.typeText({ selector: MDHLoginPageLocators.passwordTxtBox, text: this.ENV.PASSWORD })
        await this.utility.click({ selector: MDHLoginPageLocators.signinBtn })
        await this.utility.waitUntilPageIsLoaded()
        await this.utility.click({ selector: MDHLoginPageLocators.noBtnForDefaultSignIN })
        await this.utility.waitUntilPageIsLoaded()
    }
}

import { BasePage } from '../../base/BasePage'

export class NaukariPageActions extends BasePage {

    static loginBtn="//a[text()='Login']"
    static usernameField="//input[@placeholder='Enter your active Email ID / Username']"
    static passwordField="//input[@placeholder='Enter your password']"
    static signinBtn="//button[text()='Login']"
    static viewProfile="//div[@class='view-profile-wrapper']"
    static editResumeHeadLineBtn="//span[text()='Resume headline']//following-sibling::span[text()='editOneTheme']"
    static saveBtn="//button[text()='Save']"
    static successMsg="//p[text()='Success']"
    async loginintoNaukari() {
        await this.page.goto(this.ENV.BASE_URL)
        await this.utility.waitUntilPageIsLoaded()
        await this.page.locator(NaukariPageActions.loginBtn).waitFor({ state: 'visible',timeout:120000 })
        await this.utility.waitForLocator({ selector: NaukariPageActions.loginBtn })
        await this.utility.click({ selector: NaukariPageActions.loginBtn })
        await this.utility.typeText({ selector: NaukariPageActions.usernameField, text: process.env.NAUKARI_USERNAME})
        await this.utility.typeText({ selector: NaukariPageActions.passwordField, text: process.env.NAUKARI_PASSWORD})
        await this.utility.click({ selector: NaukariPageActions.signinBtn })
        await this.utility.waitUntilPageIsLoaded()
        await this.utility.click({ selector: NaukariPageActions.viewProfile })
        await this.utility.click({ selector: NaukariPageActions.editResumeHeadLineBtn })
        await this.utility.click({ selector: NaukariPageActions.saveBtn })
        await this.utility.waitForLocator({ selector: NaukariPageActions.successMsg })
        await this.utility.waitUntilPageIsLoaded()

    }
}

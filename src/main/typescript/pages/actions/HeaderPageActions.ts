import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'

export class HeaderPageActions extends BasePage {
  static themeToggle: string = '#theme-toggle-btn'
  static navHome: string = '#nav-home'
  static navArticles: string = '#nav-articles-btn'
  static navAbout: string = '#nav-about'
  static navContact: string = '#nav-contact'
  static htmlTag: string = 'html'
  static downToggle: string = '//svg[@class="lucide lucide-chevron-down w-8 h-8"]'
  

  // About Section

  static aboutMeHeader: string = '#about-title'

  // Contact Section

  static contactMeHeader: string = '#contact-info-title'

  @step()
  async switchThemeAndVerify() {
    await this.utility.click({ selector: HeaderPageActions.themeToggle })
        const initialClass = await this.utility.getAttributeValue({ selector: HeaderPageActions.htmlTag, attributeName: 'class' })
        await this.utility.click({ selector: HeaderPageActions.themeToggle })
        const toggledClass = await this.utility.getAttributeValue({ selector: HeaderPageActions.htmlTag, attributeName: 'class' })
        expect(initialClass).not.toBe(toggledClass)
  }

  @step()
  async gotoHome() {
    await this.utility.click({ selector: HeaderPageActions.navHome })
    expect(await this.utility.checkIfElementExists({ selector: HeaderPageActions.downToggle })).toBeTruthy()
  }

  @step()
  async gotoArticles() {
    await this.utility.click({ selector: HeaderPageActions.navArticles })
  }

  @step()
  async gotoAbout() {
    await this.utility.click({ selector: HeaderPageActions.navAbout })
    expect(await this.utility.checkIfElementExists({ selector: HeaderPageActions.aboutMeHeader })).toBeTruthy()
  }

  @step()
  async gotoContact() {
    await this.utility.click({ selector: HeaderPageActions.navContact })
    expect(await this.utility.checkIfElementExists({ selector: HeaderPageActions.contactMeHeader })).toBeTruthy()
  }
}

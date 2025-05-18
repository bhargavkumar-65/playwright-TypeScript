
import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'

export class FooterPageActions extends BasePage {
  static github: string = '#footer-github-link'
  static linkedin: string = '#footer-linkedin-link'

  @step('Verify Links in the footer')
  async clickGitHubLink() {
    await this.utility.click({ selector: FooterPageActions.github })
    await this.utility.click({ selector: FooterPageActions.linkedin })

  }

}

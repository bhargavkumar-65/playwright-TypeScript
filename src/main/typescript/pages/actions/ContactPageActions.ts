
import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'

export class ContactPageActions extends BasePage {
  static nameInput: string = 'input[data-testid="contact-form-name"]'
  static emailInput: string = 'input[data-testid="contact-form-email"]'
  static subjectInput: string = 'input[data-testid="contact-form-subject"]'
  static messageInput: string = 'textarea[data-testid="contact-form-message"]'
  static submitBtn: string = '#contact-form-submit-btn'
  static status: string = '#contact-form-status'

  @step('Fill in the contact form')
  async fillContactForm() {
    await this.utility.typeText({selector:ContactPageActions.nameInput, text:this.utility.getRandomString(5)})
    await this.utility.typeText({selector:ContactPageActions.emailInput, text:this.utility.getRandomString(5)})
    await this.utility.typeText({selector:ContactPageActions.subjectInput, text:this.utility.getRandomString(5)})
    await this.utility.typeText({selector:ContactPageActions.messageInput, text:this.utility.getRandomString(5)})
    await this.utility.click({selector:ContactPageActions.submitBtn})
  }
}

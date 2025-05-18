import ENV from '../../../resources/env/env'
export default class Common {
    static exampleXpathLocator = '(//td[contains(@class,"Welcome")])'
    static exampleCSSLocator = '#MainAccountManager-buttonEl'
    static examplePlaywrightLocator = 'text=Loading...'
    static exampleConditionBasedLocator = ENV.BASE_URL === 'https://google.com/' ? '#searchList-inputEl' : '[placeholder="Search"][type="search"]'
    static exampleParametarizedLocator = (buttonClass: string) => `xpath=//div[@class="ModalPanel ModalPanel-default"]//following::div[contains(@class,"${buttonClass}")]`
}

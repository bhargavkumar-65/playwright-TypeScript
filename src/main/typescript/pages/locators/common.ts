import ENV from '../../helpers/env'
export default class Common {
    static exampleXpathLocator = '(//td[contains(@class,"Welcome to KDI")])'
    static exampleCSSLocator = '#MainAccountManager-buttonEl'
    static examplePlaywrightLocator = 'text=Loading...'
    static exampleConditionBasedLocator = ENV.BASE_URL === 'https://doves.kognifailabs.com/' ? '#searchList-inputEl' : '[placeholder="Search"][type="search"]'
    static exampleParametarizedLocator = (buttonClass: string) => `xpath=//div[@class="ModalPanel ModalPanel-default"]//following::div[contains(@class,"${buttonClass}")]`
}

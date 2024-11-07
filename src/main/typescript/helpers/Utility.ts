import { APIRequestContext, expect, Locator, Page } from '@playwright/test'

import { step } from './Decorators'
import log from './log'

const fs = require('fs')
let currentPage: Page | null

export class Utility {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    /**
     * Click On An Element With text
     * @param selector Pass the selector of element for which Click action has to be performed
     **/
    @step('Click on element with text')
    async clickUsingText(args: { text: string; frame?: string; occurance?: number }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with text ${args.text}`)
        try {
            const noOfElementsFound = await pg.locator(`text=${args.text}`).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(`text=${args.text}`)
                    .nth(args.occurance ? args.occurance : 1)
                    .click()
            } else {
                await pg.locator(`text=${args.text}`).click()
            }
        } catch (ex) {
            log.error(`Clicking on element with text ${args.text} failed with exception ${ex}`)
        }
    }

    /**
     * Click On An Element With Selector
     * @param selector Pass the selector of element for which Click action has to be performed
     **/
    @step('Click on element')
    async click(args: { selector: string; frame?: string; occurance?: number; timeout?: number; window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 0)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 0)
                    .click()
            } else {
                await pg.locator(args.selector).waitFor()
                await pg.locator(args.selector).click()
            }
        } catch (ex) {
            log.error(`Clicking on element ${args.selector} failed with exception ${ex}`)
        }
    }

    /**
     * Checkbox click On An Element With Selector
     * @param selector Pass the selector of element for which Click action has to be performed
     **/
    @step('Checkbox click on element')
    async check(args: { selector: string; frame?: string; occurance?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor()
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .click()
            } else {
                await pg.locator(args.selector).waitFor()
                await pg.locator(args.selector).check()
            }
        } catch (ex) {
            log.error(`Clicking on element ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async waitUntilElementHaveValue(args: { element: string; value: any; frame?: string }) {
        await expect(await new Utility(this.page).getElement({ selector: args.element, frame: args.frame })).toHaveValue(args.value, { timeout: 60000 })
    }

    /**
     *
     * @param selector Element selector
     * @param attributeName Attribute Value that we want
     * @param frame frame name
     * @param occurance get the occurance of element when multiple elements are found
     * @returns
     */
    @step('Get Attribute Value')
    async getAttributeValue(args: { selector: string; frame?: string; occurance?: number; attributeName: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        const element = elCnt > 1 ? await pg.locator(args.selector).nth(args.occurance ? args.occurance : 1) : await pg.locator(args.selector)
        return await element.getAttribute(args.attributeName)
    }

    /**
     * Wait Until The Page Is Loaded
     */
    @step('Wait Until Page Is Loaded')
    async waitUntilPageIsLoaded() {
        try {
            log.info('Waiting for Network calls')
            await Promise.all([this.page.waitForLoadState('domcontentloaded'), this.page.waitForLoadState('networkidle', { timeout: 10000 })])
        } catch {
            log.error('Timed out waiting for load state')
        }
    }

    /**
     * Find Element And Send Keys
     * @param selector Selector of the element
     * @param text text to be entered     *
     * */
    @step('Type Text')
    async typeText(args: { selector: string; text: string; frame?: string; window?: Page }) {
        const pg = args.window ? args.window : args.frame ? this.page.frameLocator(args.frame) : this.page
        try {
            log.info(`Trying to get the selector ${args.selector} `)
            await pg.locator(args.selector).fill(args.text)
            log.info(`Sent Text ${args.text} to element ${args.selector}`)
        } catch (ex) {
            log.error(`Unable to find the element ${args.selector}`)
        }
    }
    /**
     *
     * @param selector of the element
     * @param frame frame selector
     * @returns
     */
    @step('Get Element By Label')
    async getElementByLabel(args: { selector: string; frame?: string }) {
        const pg = args.frame ? this.page.frameLocator(args.frame) : this.page
        try {
            log.info(`Trying to get the selector ${args.selector} by label`)
            return pg.getByLabel(args.selector).first()
        } catch (ex) {
            log.error(`Unable to find the element ${args.selector}`)
        }
    }

    /**
     * Wait Until The Element With Specified Selector Is Visible. In Case Of Multiple
     * Elements, It Waits For The Specified Occurance
     * @param selector Selector of the element
     * @param multiple Whether Selector returns multiple elements
     * @param occurance which occurance to wait for if there are multiple occurances
     */
    @step('Wait For Locator')
    async waitForLocator(args: { selector: string; multiple?: boolean; occurance?: number; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        if (args.multiple) {
            await pg
                .locator(args.selector)
                .nth(args.occurance ? args.occurance : 1)
                .waitFor({ timeout: 30000 })
        } else {
            await await pg.locator(args.selector).waitFor({ timeout: 30000 })
        }
        log.info(`Element with selector ${args.selector} found !!`)
    }
    /**
     *
     * @param args selector of element and Frame selector if any
     * @returns
     */
    @step()
    async scrollIntoView(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.locator(args.selector).scrollIntoViewIfNeeded()
        log.info(`scrolled until the element with selector ${args.selector} is in view`)
    }

    @step('focus on element')
    async focus(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.locator(args.selector).focus()
        log.info(`Focussed element ${args.selector}`)
    }

    /**
     * Gets The Count Of Elements Matching Selector
     * @param selector selector of the element
     */
    @step('Get Count Of Elements')
    async getCountOfElements(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const count = await pg.locator(args.selector).count()
        log.info(`No of Elements found with selector ${args.selector} is ${count}`)
        return count
    }

    /**
     *
     * @param text dropdown Item text
     * @param frame frame selector
     * @returns returns dropdowm
     */
    @step('Get Dropdown Item With Text')
    async getDropDownItemWithText(args: { text: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Getting the dropdown Item with text ${args.text}`)
        return await pg.locator(`li[role="option"]:has-text("${args.text}")`)
    }

    /**
     * Selects the Item with text in dropdown
     * @param text text of the element to be selected
     * @param frame frame selector if any     *
     */
    @step('Select Dropdown Option')
    async selectDropDownOption(args: { text: string; frame?: string }) {
        // get dropdown option
        await (await this.getDropDownItemWithText({ text: args.text, frame: args.frame })).click()
        log.info(`clicked on dropdown Item with text ${args.text}`)
    }
    /**
     * Selects the Item with text in dropdown
     * @param text text of the element to be selected
     * @param frame frame selector if any     *
     */
    @step('Select Dropdown Value')
    async selectDropDownValue(args: { selector: string; text: string; frame?: string; window?: Page }) {
        const pg = args.window ? args.window : args.frame ? this.page.frameLocator(args.frame) : this.page
        await pg.locator(args.selector).selectOption(args.text)
        log.info(`clicked on dropdown Item with text ${args.text}`)
    }
    /**
     * Waiting for new window
     * @param clickEvent
     * @returns
     */
    @step('Wait For New Window')
    async waitForWindow(clickEvent: any) {
        const [popup] = await Promise.all([this.page.waitForEvent('popup'), clickEvent])
        await popup.waitForLoadState()
        // expect(await popup.url()).toBe(expectedUrl)
        return popup
    }
    /**
     *
     * @param text dropdown Item text
     * @param frame frame selector
     * @returns returns dropdowm
     */
    @step('Get Dropdown Item With Text')
    async getDropDownItems(args: { frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.locator('li[role="option"]').allTextContents()
    }

    /**
     *
     * @param selector selector of the element
     * @param frame frame selector
     * @returns element
     */
    @step('Get Element')
    async getElement(args: { selector: string; frame?: string; occurance?: number }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        return elCnt > 1 ? await pg.locator(args.selector).nth(args.occurance ? args.occurance : 0) : await pg.locator(args.selector)
    }
    @step('Get First Element')
    async getElementFirst(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.locator(args.selector).first()
    }

    @step('Get Second Element')
    async getElementSecond(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.locator(args.selector).nth(1)
    }
    @step('Get Last Element')
    async getElementLast(args: { selector: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.locator(args.selector).last()
    }
    @step('Download File')
    async downloadFile(args: { selector: string; frame?: string; fileName: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const downloadPromise = this.page.waitForEvent('download')
        await pg.locator(args.selector).click()
        const download = await downloadPromise
        return await download.path()
    }

    /**
     *
     * @param selector selector of the element
     * @param frame frame selector
     * @returns element
     */
    @step('Get Element With Text')
    async getElementWithText(args: { text: string; frame?: string; occurance?: number }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(`text=${args.text}`).count()
        log.info(`No of elements found with text ${args.text} are ${elCnt}`)
        return elCnt > 1 ? await pg.locator(`text=${args.text}`).nth(args.occurance ? args.occurance : 1) : await pg.locator(`text=${args.text}`)
    }

    /**
     *
     * @param selector element selector
     * @param frame frame selector
     * @returns returns dropdowm
     */
    @step('Get Element Texts')
    async getElementTexts(args: { selector: string; frame?: string }): Promise<string[]> {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.locator(args.selector).allTextContents()
    }

    /**
     *
     * @param args checking for element exists
     * @returns
     */
    @step('Check If Element Exists')
    async checkIfElementExists(args: { selector: string; frame?: string; window?: Page }) {
        log.info(`checking if element ${args.selector} exists`)
        const pg = args.frame ? this.page.frame(args.frame.replace('#', ''))?.$$(args.selector) : this.page.$$(args.selector)
        log.info(`element with selector ${args.selector} ${pg && (await pg!).length > 0 ? 'exists' : 'does not exist'}`)
        return pg ? (await pg!).length > 0 : false
    }

    /**
     *
     * @param args checking for element Not exists
     * @returns
     */
    @step('Check If Element Not Exists')
    async checkIfElementNotExists(args: { selector: string; frame?: string }) {
        const pg = args.frame ? this.page.frame(args.frame.replace('#', ''))?.$$(args.selector) : this.page.$$(args.selector)
        return (await pg!).length > 0
    }

    /**
     *
     * @param args Expand Dropdown Item
     * @returns
     */
    @step('Expand Dropdown Item')
    async expandDropDownItem(args: { selector: string; frame?: string }) {
        const dropdownElement = await this.getElement(args)
        dropdownElement.locator('[arialabel="downArrow"]').click()
        log.info(`Expanded Dropdown Item with selector ${args.selector}`)
    }

    /**
     *
     * @param args Wait for Specific API calls
     */
    @step('Wait For API Calls')
    async waitForApiCalls(args: { endpoints: string[]; action: any }) {
        log.info(`waiting for API calls ${args.endpoints}`)
        const promises: any = []
        promises.push(args.action)
        promises.push(this.page.waitForTimeout(2000))
        args.endpoints.forEach(endpoint => {
            promises.push(this.page.waitForResponse(`**${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}*`))
        })
        const [response] = await Promise.all(promises)
    }

    /**
     *
     * @param args Press Keryboard Event
     */
    @step('Press KeyboardEvent')
    async keyboard(args: { keyboardEvent: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.keyboard.press(args.keyboardEvent)
        log.info(`Focussed element ${args.keyboardEvent}`)
    }

    /**
     *
     * @param args Press Keryboard Type
     */
    @step('Press Keyboard Type')
    async keyboardType(args: { inputString: string; frame?: string }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.keyboard.type(args.inputString)
        log.info(`Focussed element ${args.inputString}`)
    }

    /**
     *
     * @param args Double Click on a element
     */
    @step('Double Click')
    async doubleClick(args: { selector: string; frame?: string; occurance?: number }) {
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .dblclick()
            } else {
                await pg.locator(args.selector).dblclick()
            }
        } catch (ex) {
            log.error(`Clicking on element ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async waitUntilElementisHidden(args: { element: string; frame?: string }) {
        await expect(await this.getElement({ selector: args.element, frame: args.frame })).toBeHidden({ timeout: 60000 })
    }

    @step()
    async waitUntilSelectorDisappear(args: { selector: string; frame?: string }) {
        await this.page.waitForTimeout(1000)
        const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return await pg.waitForSelector(args.selector, { state: 'detached' })
    }

    @step()
    async handlePopup(buttonToClick: string, frame?: string) {
        const attributeValue = await this.getAttributeValue({ attributeName: 'class', selector: 'body[id*=ext-gen]', frame })
        if (attributeValue!.includes('x-body-masked')) {
            await this.click({ selector: buttonToClick, frame })
        }
    }
    @step()
    async waitForDocumentLoaded() {
        await this.page.waitForTimeout(5000)
        log.info('Waiting done for 5 seconds')
    }

    @step()
    async getInputValue(args: { selector: string; frame?: string; text: string }) {
        const objProcessIP = await this.getElement({ selector: args.selector, frame: args.frame })
        expect(
            await objProcessIP.evaluate(el => {
                return el.value
            }),
        ).toBe(args.text)
    }

    @step()
    async clear(args: { selector: string; frame?: string; occurance?: number; timeout?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`clearing on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .clear()
            } else {
                await pg.locator(args.selector).waitFor()
                await pg.locator(args.selector).clear()
            }
        } catch (ex) {
            log.error(`Clearing on element ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async dblclick(args: { selector: string; frame?: string; occurance?: number; timeout?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Duble Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .dblclick()
            } else {
                await pg.locator(args.selector).waitFor()
                await pg.locator(args.selector).dblclick()
            }
        } catch (ex) {
            log.error(`Duble Clicking on element ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async uploadImage(args: { selector: string; frame?: string; imagePath: string; imageName: string }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg
            .frameLocator(args.frame)
            .locator(args.selector)
            .setInputFiles({
                name: args.imageName,
                mimeType: 'image/png',
                buffer: Buffer.from(fs.readFileSync(args.imagePath)),
            })
    }

    @step()
    async uploadFile(args: { filePath: string; selector: string; frame?: string; occurance?: number; timeout?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`UploadFile on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .nth(args.occurance ? args.occurance : 1)
                    .setInputFiles(args.filePath)
            } else {
                await pg.locator(args.selector).waitFor()
                await pg.locator(args.selector).setInputFiles(args.filePath)
            }
        } catch (ex) {
            log.error(`uploadFile ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async hexToString(hexCode) {
        let str = ''
        for (let i = 0; i < hexCode.length; i += 2) {
            const hexValue = hexCode.substr(i, 2)
            const decimalValue = parseInt(hexValue, 16)
            str += String.fromCharCode(decimalValue)
        }
        return str
    }

    @step()
    async stringToHex(stringValue) {
        let hex = ''
        for (let i = 0; i < stringValue.length; i++) {
            const charCode = stringValue.charCodeAt(i)
            const hexValue = charCode.toString(16)

            // Pad with zeros to ensure two-digit representation
            hex += hexValue.padStart(2, '0')
        }
        return hex
    }

    @step()
    async getFrame(args: { selector: string }) {
        let frameSelectors: any[] = []
        if (args.selector.includes('|')) {
            frameSelectors = args.selector.split('|')
        } else {
            frameSelectors.push(args.selector)
        }
        let pg
        for (const frame in frameSelectors) {
            log.info(`Finding Frame with element selector ${frameSelectors[frame]}`)
            pg = await (pg ? pg : this.page).frameLocator(frameSelectors[frame])
        }
        return pg
    }
}

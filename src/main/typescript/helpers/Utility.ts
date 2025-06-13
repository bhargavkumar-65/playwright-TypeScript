import test, { APIRequestContext, expect, Locator, Page } from '@playwright/test'
import { time } from 'console'
import * as os from 'os'
import * as path from 'path'

import { step } from './Decorators'
import log from './log'

const fs = require('fs')
let currentPage: Page | null

export class Utility {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    private async resolvePageContext(args: { window?: Page; frame?: string }) {
    if (args.window) return args.window
    if (args.frame) return await this.getFrame({ selector: args.frame })
    return this.page
}
    /**
     * Click On An Element With text
     * @param selector Pass the selector of element for which Click action has to be performed
     **/
    @step('Click on element with text')
    async clickUsingText(args: { text: string; frame?: string; occurance?: number }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with text ${args.text}`)
        try {
            const noOfElementsFound = await pg.locator(`text=${args.text}`).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(`text=${args.text}`)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .click()
            } else {
                await pg.locator(`text=${args.text}`).filter({visible:true}).click()
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
        const pg = await this.resolvePageContext(args)
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            log.info(`Found ${noOfElementsFound} element(s) with selector ${args.selector}`)
                await pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 0).waitFor({ timeout: args.timeout ? args.timeout : 30000 })
                await pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 0).click()
                await this.waitUntilPageIsLoaded()    
        }
        
        catch (ex) {
            log.error(`Clicking on element ${args.selector} failed with exception ${ex}`)
            throw new Error(`Clicking on element ${args.selector} failed with exception ${ex}`)
        }

    }

    /**
     * Click On All Elements With Selector
     * @param selector Pass the selector of element for which Click action has to be performed
     **/
    @step('Click on all elements')
    async clickAll(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on all elements with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            for (let i = 0; i < noOfElementsFound; i++) {
                await pg.locator(args.selector).filter({visible:true}).nth(i).click()
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
    async check(args: { selector: string; frame?: string; occurance?: number;window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor()
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .click()
            } else {
                await pg.locator(args.selector).filter({visible:true}).waitFor()
                await pg.locator(args.selector).filter({visible:true}).check({force: true})
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        const element = elCnt > 1 ? pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 1) : pg.locator(args.selector).filter({visible:true})
        const attributeValue= await element.getAttribute(args.attributeName)
        log.info(`Attribute Value of ${args.attributeName} is ${attributeValue}`)
        return attributeValue

    }
    

    /**
     * Wait Until The Page Is Loaded
     */
    @step('Wait Until Page Is Loaded')
    async waitUntilPageIsLoaded() {
        try {
            log.info('Waiting for Page Load to complete')
            await Promise.all(
                [
                    this.page.waitForSelector('#loader',{state:'hidden',timeout: 60000}),
                    this.page.waitForLoadState('load'),
                    this.page.waitForLoadState('domcontentloaded'), 
                    this.page.waitForLoadState('networkidle', { timeout: 60000 })
                ])
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
        async typeText(args: { selector: string; text: string; frame?: string; window?: Page; occurance?: number }) {
            // const pg:Page = iargs.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            let pg: Page = this.page
            if(args.window) {
                pg = args.window
            }
            else if(args.frame) {
                pg = await this.getFrame({ selector: args.frame })
            } 

            try {
                log.info(`Trying to get the selector ${args.selector} `)
                const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
                if (noOfElementsFound > 1) {
                log.info(`No.Of Elements Found: ${noOfElementsFound} for Element: ${args.selector}`)
                    await pg
                        .locator(args.selector)
                        .nth(args.occurance ? args.occurance : 0)
                        .fill(args.text)
                } else {
                    await pg.locator(args.selector).filter({visible:true}).fill(args.text)
                }
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page

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
     * Default timeOut is 30 seconds
     * @param selector Selector of the element
     * @param multiple Whether Selector returns multiple elements
     * @param occurance which occurance to wait for if there are multiple occurances
     */
    @step('Wait For Locator')
    async waitForLocator(args: { selector: string; occurance?: number; frame?: string;timeOut?:number;window?:Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        // const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        try{
        const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
        if (noOfElementsFound>1) {
            log.info(`Element with selector ${args.selector} found with multiple: ${noOfElementsFound}  !!`)
            await pg
                .locator(args.selector)
                .nth(args.occurance ?? 0)
                .waitFor({ timeout: args.timeOut?? 30000, state: 'visible' })
        } else {
             await pg.locator(args.selector).filter({visible:true}).nth(0).waitFor({ state: 'visible',timeout: args.timeOut?? 30000 })
            log.info(`Element with selector ${args.selector} found !!`)
        }
    }
        catch(ex){
            log.error(`${ex}`)
            throw new Error(`${ex}`)
            }
    }
    /**
     *
     * @param args selector of element and Frame selector if any
     * @returns
     */
    @step()
    async scrollIntoView(args: { selector: string; frame?: string;occurance:number }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.locator(args.selector).filter({visible:true}).nth(args.occurance?? 1).scrollIntoViewIfNeeded()
        log.info(`scrolled until the element with selector ${args.selector} is in view`)
    }

    @step('focus on element')
    async focus(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.locator(args.selector).filter({visible:true}).focus()
        log.info(`Focussed element ${args.selector}`)
    }

    /**
     * Gets The Count Of Elements Matching Selector
     * @param selector selector of the element
     */
    @step('Get Count Of Elements')
    async getCountOfElements(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const count = await pg.locator(args.selector).filter({visible:true}).count()
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Getting the dropdown Item with text ${args.text}`)
        return pg.locator(`li[role="option"]:has-text("${args.text}")`)
    }

    /**
     * Selects the Item with text in dropdown
     * To be Used for Dropdowns with <ul><li></li></ul> tag
     * @param text text of the element to be selected
     * @param frame frame selector if any*
     */
    @step('Select Dropdown Option')
    async selectDropDownOption(args: { text: string; frame?: string;window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        // get dropdown option
        await pg.getByRole('option', { name: args.text,exact:true }).click()
        // await (await this.getDropDownItemWithText({ text: args.text, frame: args.frame })).click()
        log.info(`clicked on dropdown Item with text ${args.text}`)
    }
    /**
     * Selects the Item with text in dropdown
     * @param text text of the element to be selected
     * @param index index of the element to be selected
     * @param frame frame selector if any
     * @param selector Must be //select tag followed by <options> tags *
     * @UseWhen DOM is like <option value="Text">Text</option> And When <option value=1>Text</option>
     */
    @step('Select Dropdown Value')
    async selectDropDownValue(args: { selector: string; text?: string; frame?: string; index?: number; window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page

        if (args.index) {
            await pg.locator(args.selector).filter({visible:true}).selectOption({ index: args.index })
            log.info(`clicked on dropdown Item with Index ${args.index}`)
        }
        if (args.text) {
            log.info(`Trying to select dropdown Item ${args.selector} with text ${args.text}`)
            try{await pg.locator(args.selector).filter({visible:true}).selectOption(args.text)}
            catch(ex){await pg.locator(args.selector).filter({visible:true}).selectOption({label:args.text})}
            log.info(`clicked on dropdown Item with text ${args.text}`)
        }
        log.info(`Dropdown Value selection is performed on element with selector ${args.selector}`)
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        return elCnt > 1 ? pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 0) : pg.locator(args.selector).filter({visible:true})
    }
    @step('Get First Element')
    async getElementFirst(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return pg.locator(args.selector).filter({visible:true}).first()
    }

    @step('Get Second Element')
    async getElementSecond(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return pg.locator(args.selector).filter({visible:true}).nth(1)
    }
    @step('Get Last Element')
    async getElementLast(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        return pg.locator(args.selector).filter({visible:true}).last()
    }

    /**
     *
     * @param selector selector of the element
     * @param frame frame selector
     * @attach Downloaded File
     * @returns DownloadedFileName with Path
     */
    @step('Download File')
    async downloadFile(args: { selector: string; frame?: string}) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const downloadPromise = this.page.waitForEvent('download')
        await pg.locator(args.selector).filter({visible:true}).click()
        const download = await downloadPromise
        const homeDir = os.homedir()
        const downloadsPath = path.join(homeDir, 'Downloads', download.suggestedFilename())
        await download.saveAs(downloadsPath)
        test.info().attachments.push({
            name: download.suggestedFilename(),
            path: downloadsPath,
            contentType: 'application/octet-stream',
        })
        return downloadsPath
    }

    /**
     *
     * @param selector selector of the element
     * @param frame frame selector
     * @returns element
     */
    @step('Get Element With Text')
    async getElementWithText(args: { text: string; frame?: string; occurance?: number }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(`text=${args.text}`).count()
        log.info(`No of elements found with text ${args.text} are ${elCnt}`)
        return elCnt > 1 ? pg.locator(`text=${args.text}`).nth(args.occurance ? args.occurance : 1) : pg.locator(`text=${args.text}`)
    }

    /**
     *
     * @param selector element selector
     * @param frame frame selector
     * @returns returns text of all elements including hidden elements and returns array of strings
     */
    @step('Get Element Text')
    async getAllTextContents(args: { selector: string; frame?: string }): Promise<string[]> {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const text = await pg.locator(args.selector).filter({visible:true}).allTextContents()
        log.info(`extracted text from element with selector ${args.selector} is ${text}`)
        return text
    }

        /**
     *
     * @param selector element selector
     * @param frame frame selector
     * @returns returns text of all elements including hidden elements and returns array of strings
     */
    @step('Get Element Text content')
    async getTextContent(args: { selector: string; frame?: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const text = await pg.locator(args.selector).filter({visible:true}).textContent()
        log.info(`extracted text from element with selector ${args.selector} is ${text}`)
        return text
    }

    /**
     *
     * @param args checking for element exists
     * @returns boolean
     */
    @step('Check If Element Exists')
    async checkIfElementExists(args: { selector: string; frame?: string; window?: Page }) {
        log.info(`checking if element ${args.selector} exists or not`)
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`element with selector ${args.selector} ${pg && noOfElementsFound > 0 ? 'exists' : 'does not exist'}`)
        const isElementVisible = await pg.locator(args.selector).filter({visible:true}).nth(0).isVisible()
        log.info(`element with selector ${args.selector} is ${isElementVisible ? 'visible' : 'not visible'}`)
        return pg ? noOfElementsFound > 0 && isElementVisible : false
    }

    /**
     *
     * @param args checking for element Not exists
     * @returns
     */
    @step('Check If Element Not Exists')
    async checkIfElementNotExists(args: { selector: string; frame?: string; window?: Page }) {
        log.info(`checking if element ${args.selector} exists or Not`)
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`element with selector ${args.selector} ${pg && noOfElementsFound > 0 ? 'exists' : 'does not exist'}`)
        const isElementVisible = await pg.locator(args.selector).filter({visible:true}).isVisible()
        log.info(`element with selector ${args.selector} is ${isElementVisible ? 'visible' : 'not visible'}`)
        return pg ? noOfElementsFound === 0 && !isElementVisible : false
    }

    /**
     *
     * @param args Expand Dropdown Item
     * @returns
     */
    @step('Expand Dropdown Item')
    async expandDropDownItem(args: { selector: string; frame?: string }) {
        const dropdownElement = await this.getElement(args)
        await dropdownElement.locator('[arialabel="downArrow"]').filter({visible:true}).click()
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg.keyboard.press(args.keyboardEvent)
        log.info(`Focussed element ${args.keyboardEvent}`)
    }

    /**
     *
     * @param args Press Keryboard Type
     */
    @step('Press Keyboard Type')
    async keyboardType(args: { selector?: string; text: string; frame?: string; delayinMilliSec?: number; window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Typing on element with selector ${args.selector}`)
        if (args.selector) {
            await this.click({ selector: args.selector })
        }
        await pg.keyboard.type(args.text, { delay: args.delayinMilliSec ? args.delayinMilliSec : 200 })
        log.info(`keyboard element ${args.text}`)
    }

    /**
     *
     * @param args Double Click on a element
     */
    @step('Double Click')
    async doubleClick(args: { selector: string; frame?: string; occurance?: number }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .dblclick()
            } else {
                await pg.locator(args.selector).filter({visible:true}).dblclick()
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
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
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

    // @step()
    // async getInputValue(args: { selector: string; frame?: string; text: string }) {
    //     const objProcessIP = await this.getElement({ selector: args.selector, frame: args.frame })
    //     expect(
    //         await objProcessIP.evaluate(el => {
    //             return el.textContent
    //         }),
    //     ).toBe(args.text)
    // }

    @step()
    async clear(args: { selector: string; frame?: string; occurance?: number; timeout?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`clearing on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .clear()
            } else {
                await pg.locator(args.selector).filter({visible:true}).waitFor()
                await pg.locator(args.selector).filter({visible:true}).clear()
            }
        } catch (ex) {
            log.error(`Clearing on element ${args.selector} failed with exception ${ex}`)
        }
    }

    /**
     * double click if element is visible
     * @param selector Selector of the element
     * @param frame frame selector
     * @param occurance get the occurance of element when multiple elements are found
     * @param timeout timeout in milliseconds
     */
    @step()
    async dblclick(args: { selector: string; frame?: string; occurance?: number; timeout?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`Duble Clicking on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .dblclick()
            } else {
                await pg.locator(args.selector).filter({visible:true}).waitFor()
                await pg.locator(args.selector).filter({visible:true}).dblclick()
            }
        } catch (ex) {
            log.error(`Duble Clicking on element ${args.selector} failed with exception ${ex}`)
        }
    }

    @step()
    async uploadImage(args: { selector: string; frame?: string; imagePath: string; imageName: string }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await pg
            .locator(args.selector)
            .filter({visible:true})
            .setInputFiles({
                name: args.imageName,
                mimeType: 'image/png',
                buffer: Buffer.from(fs.readFileSync(args.imagePath)),
            })
    }

    /**
     * Upload File
     * @param filePath Path of the file to be uploaded
     * @param selector Selector of the element
     * @param frame frame selector
     * @param occurance get the occurance of element when multiple elements are found
     * @param timeout timeout in milliseconds
     */

    @step()
    async uploadFile(args: { filePath: string; selector: string; frame?: string; occurance?: number; timeout?: number; window?: Page }) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        log.info(`UploadFile on element with selector ${args.selector}`)
        try {
            const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
            if (noOfElementsFound > 1) {
                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .waitFor({ timeout: args.timeout ? args.timeout : 30000 })

                await pg
                    .locator(args.selector)
                    .filter({visible:true})
                    .nth(args.occurance ? args.occurance : 1)
                    .setInputFiles(args.filePath)
            } else {
                await pg.locator(args.selector).filter({visible:true}).waitFor()
                await pg.locator(args.selector).filter({visible:true}).setInputFiles(args.filePath)
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

    generateSSNNumber() {
        return Math.floor(Math.random() * 100000 + 3333300000).toString()
    }

    generateTTBCOLAID() {
        return Math.floor(Math.random() * 100000000000000).toString()
    }

    generateFEIN() {
        const randomNumber = (): number => Math.floor(Math.random() * 1_000_000_000)
        const lastNineDigits = randomNumber()
        const firstTwoDigits = Math.floor(Math.random() * 90) + 10 // Generates a number between 10 and 99
        return (lastNineDigits + firstTwoDigits * 1_000_000_000).toString()
    }

    /**
     * Generate Random String
     * @param length length of the string
    */

    getRandomString(length: number) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length)
            result += characters[randomIndex]
        }
        return result
    }

    /**
     * Generate Random Number based on length
     * @param length number of digits in the random number
     * @returns random number with specified number of digits
     */
    getRandomNumber(length: number): string {
        return Math.random().toString().slice(2, 2 + length)
    }

    /**
     * Hover On An Element With Selector
     * @param selector Pass the selector of element for which Hover action has to be performed
     * @param frame frame selector
     * @param occurance get the occurance of element when multiple elements are found
     * @param timeout timeout in milliseconds
     * @param window window selector if any multiple windows are open
     **/
        @step('Hover on element')
        async hover(args: { selector: string; frame?: string; occurance?: number; timeout?: number; window?: Page }) {
            const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            log.info(`Hovering on element with selector ${args.selector}`)
            try {
                const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
                log.info(`Found ${noOfElementsFound} element(s) with selector ${args.selector}`)
                if (noOfElementsFound > 1) {
                    await pg
                        .locator(args.selector)
                        .nth(args.occurance ? args.occurance : 0)
                        .waitFor({ timeout: args.timeout ? args.timeout : 30000 })
    
                    await pg
                        .locator(args.selector)
                        .nth(args.occurance ? args.occurance : 0)
                        .hover()
                } else {
                    await pg.locator(args.selector).filter({visible:true}).waitFor()
                    await pg.locator(args.selector).filter({visible:true}).hover()
                }
            } catch (ex) {
                log.error(`Hovering on element ${args.selector} failed with exception ${ex}`)
            }
        }
    
        /**
         * Drag And Drop An Element On Another Element With Selectors
         * @param sourceSelector Pass the selector of element to be dragged
         * @param targetSelector Pass the selector of element on which the element has to be dropped
         * @param frame frame selector
         * @param occurance get the occurance of element when multiple elements are found
         * @param timeout timeout in milliseconds
         * @param window window selector
         * @param force force the drag and drop action
         **/
        @step('Drag and drop an element on another element')
        async dragAndDrop(args: { sourceSelector: string; targetSelector: string; frame?: string; occurance?: number; timeout?: number; window?: Page; force?: boolean }) {
            const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            log.info(`Converting the elements with selector ${args.sourceSelector} & ${args.targetSelector} to draggable elements`)
            const sourceElement = pg.locator(args.sourceSelector).nth(args.occurance ? args.occurance : 0).toString()
                .replace('Locator@', '').replace(/\\/g, '').replace(`locator('`, '').replace(`').first()`, ' >> nth=0')
            const targetElement = pg.locator(args.targetSelector).nth(args.occurance ? args.occurance : 0).toString()
                .replace('Locator@', '').replace(/\\/g, '').replace(`locator('`, '').replace(`').first()`, ' >> nth=0')
            try {
                await pg.dragAndDrop(sourceElement, targetElement, { force: args.force ? args.force : false })
            } catch (ex) {
                log.error(`Drag and drop of element ${args.sourceSelector} on element ${args.targetSelector} failed with exception ${ex}`)
            }
        }

    /**
     * Get InnerText of an Element
     * @param selector Element selector
     * @param frame frame selector
     * @param occurance get the occurance of element when multiple elements are expected
     * @returns innerText of the element macthing the selector
     */
    @step('Get InnerText of Element')
    async getInnerText(args: { selector: string; frame?: string; occurance?: number;window?: Page }) {
        // const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        const element = elCnt > 1 ? pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 0) : pg.locator(args.selector).filter({visible:true})
        const innterText= await element.filter({visible:true}).innerText()
        log.info(`InnerText of element ${args.selector} is ${innterText}`)
        return innterText

    }

    /**
     * Get Html attribute value of an Element
     * @param selector Element selector
     * @param attributeName Attribute Value that we want
     * @returns html attribute value of the element
     */
    async getHtmlAttributeValue(args: { selector: string; frame?: string; occurance?: number; attributeName: string }) {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        const elCnt = await pg.locator(args.selector).filter({visible:true}).count()
        log.info(`No of elements found with locator ${args.selector} are ${elCnt}`)
        const element = elCnt > 1 ? pg.locator(args.selector).filter({visible:true}).nth(args.occurance ? args.occurance : 0) : pg.locator(args.selector).filter({visible:true})
        switch (args.attributeName) {
            case "value":
                return await element.evaluate(e => (e as HTMLInputElement).value)
            case "ariaSelected":
                return await element.evaluate(e => (e as HTMLInputElement).ariaSelected)
            case "disabled":
                return await element.evaluate(e => (e as HTMLInputElement).disabled)
        }
    }

    /**
     * Get Css property value of an Element
     * @param selector Element selector
     * @param attributeName Css property whose value we want
     * @returns Css property value of the element
     */
    async getCssValue(args: { selector: string; cssProperty: string; frame?: string; occurance?: number }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page

        return await pg
            .locator(args.selector)
            .nth(args.occurance ? args.occurance : 0)
            .evaluate((el, _cssProperty) => {
                return window.getComputedStyle(el).getPropertyValue(_cssProperty)
            }, args.cssProperty)
    }        

    /**
     * Find Element And Send Keys sequentially
     * @param selector Selector of the element
     * @param text text to be entered     *
     * @param frame frame selector
     * @param occurance get the occurance of element when multiple elements are found
     * @param window window selector
     * */
        async typeTextSequentially(args: { selector: string; text: string; frame?: string; window?: Page; occurance?:number}) {
            const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            try {
                log.info(`Trying to get the selector ${args.selector} `)
                const noOfElementsFound = await pg.locator(args.selector).filter({visible:true}).count()
                if (noOfElementsFound > 1) {
                    await pg
                        .locator(args.selector)
                        .nth(args.occurance ? args.occurance : 0)
                        .fill("")
    
                    await pg
                        .locator(args.selector)
                        .nth(args.occurance ? args.occurance : 0)
                        .pressSequentially(args.text)
                } else {
                    await pg.locator(args.selector).filter({visible:true}).fill("")
                    await pg.locator(args.selector).filter({visible:true}).pressSequentially(args.text)
                }
                log.info(`Sent Text ${args.text} to element ${args.selector}`)
            } catch (ex) {
                log.error(`Unable to find the element ${args.selector}`)
            }
        }
        
    /**
     * Returns a formatted date string based on the specified format.
     * @param format - The desired date format ('MM/DD/YYYY hh:mm:ss AM/PM', 'MM/DD/YYYY', 'yyyy-mm-dd--hh-mm-ss').
     * @param day - Number of days to add to the current date (optional).
     * @returns Formatted date string.
     */
    getFormattedDate(format: 'MM/DD/YYYY hh:mm:ss AM/PM' | 'MM/DD/YYYY' | 'YYYY_MM_DD_HH_MM_SS' | 'MM/DD/YYYY hh:mm AM/PM', day?: number): string {
        const today = new Date()
        const futureDate = new Date(today)

        if (day !== undefined) {
            futureDate.setDate(today.getDate() + day)
        }

        if (format === 'MM/DD/YYYY hh:mm:ss AM/PM') {
            futureDate.setHours(0, 0, 0, 0)
            const options: Intl.DateTimeFormatOptions = {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            }
            return futureDate.toLocaleString('en-US', options).replace(',', '')
        } else if (format === 'MM/DD/YYYY') {
            futureDate.setHours(0, 0, 0, 0)
            const options: Intl.DateTimeFormatOptions = {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
            }
            return futureDate.toLocaleString('en-US', options).replace(',', '')
        } else if (format === 'YYYY_MM_DD_HH_MM_SS') {
            const pad = (num: number) => num.toString().padStart(2, '0')
            const year = futureDate.getFullYear()
            const month = pad(futureDate.getMonth() + 1) // Months are zero-based
            const dayOfMonth = pad(futureDate.getDate())
            const hours = pad(futureDate.getHours())
            const minutes = pad(futureDate.getMinutes())
            const seconds = pad(futureDate.getSeconds())
            return `${year}_${month}_${dayOfMonth}_${hours}_${minutes}_${seconds}`
        } else if (format === 'MM/DD/YYYY hh:mm AM/PM') {
            const pad = (num: number) => num.toString().padStart(2, '0')
            const year = futureDate.getFullYear()
            const month = pad(futureDate.getMonth() + 1) // Months are zero-based
            const dayOfMonth = pad(futureDate.getDate())
            const hours = pad(futureDate.getHours())
            const minutes = pad(futureDate.getMinutes())
            return `${year}_${month}_${dayOfMonth}_${hours}_${minutes}`
        } 
            throw new Error(`Unsupported date format: ${format}`)
    }


    /**
     * Gets the text content of a specific cell in a Grid table based on row number and column Name.
     * @param rowNumber  - Row number (starting from 1) of Grid to fetch Data,
     * @param columnName - The column Name to fetch the Data.
     * @Optional frame   - The frame selector to use when searching for the element.
     * @returns A promise that resolves to the text content of the specified cell, or null if not found.
     */
    @step('Get Table Grid Cell Text by Row and Column Name')
    async getTableGridCellTextByRowAndColumnName(args: { rowNumber: number; columnName: string; frame?: string }): Promise<string | null> {
        const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await this.waitUntilPageIsLoaded()
        const allHeadersXpath='//table[@role="grid"]//tr/th[@style="touch-action: none;"]'
        let columnIndex:number|null = null

        await this.waitForLocator({selector:allHeadersXpath,timeOut:60000})
        
        try {
            // Get all header elements to find the index
            const allHeaderElements = await pg.locator(allHeadersXpath).elementHandles()
            for (let i = 0; i < allHeaderElements.length; i++) {
                const headerText = await pg.locator(allHeadersXpath).nth(i).innerText()
                log.info(`Verifying Header Text: ${headerText}`)
                if (headerText && headerText.trim() === args.columnName.trim()) {
                    columnIndex = i
                    log.info(`ColumnName ${headerText} is at index ${columnIndex}`)
                    break
                }
            }
            if (columnIndex === null) {
                log.error(`Column Name "${args.columnName}" not found in Table Grid.`)
                throw new Error(`Column Name "${args.columnName}" not found in Table Grid. for selector ${allHeadersXpath}`)
            }
            const cellSelector = `//table/tbody/tr[${args.rowNumber}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]`

            log.info(`Getting text from Table Grid cell with selector ${cellSelector}`)
            const textContent = await pg.locator(cellSelector)
                                        .filter({visible:true})
                                        .innerText()
            log.info(`Text content of Table Grid cell: ${textContent}`)
            return textContent
        } catch (ex) {
            log.error(`Failed to get text from Table Grid cell with exception ${ex}`)
            throw new Error(`Failed to get text from Table Grid cell with exception ${ex}`)
        }
    }

    /**
     * Clicks on a specific cell in a Grid table based on row number and column Name.
     * @param rowNumber  - Row number (starting from 1) of Grid to click,
     * @param columnName - The column Name to click.
     * @Optional frame   - The frame selector to use when searching for the element.
     */
        @step('Click Table Grid Cell by Row and Column Name')
        async clickTableGridCellByRowAndColumnName(args: { rowNumber: number; columnName: string; isHyperLink?:Boolean;frame?: string;window?: Page;hyperlinkOccurance?:number }) {
            log.info(`Clicking on Table Grid cell with Row Number: ${args.rowNumber} and Column Name: ${args.columnName}`)
            const pg: Page = args.window? args.window: args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            await this.waitUntilPageIsLoaded()
            const allHeadersXpath = '//table[@role="grid"]//tr/th'
            let columnIndex: number | null = null
    
            await this.waitForLocator({ selector: allHeadersXpath, timeOut: 60000 })
    
            try {
                // Get all header elements to find the index
                const allHeaderElements = await pg.locator(allHeadersXpath).filter({visible:true}).elementHandles()
                for (let i = 0; i < allHeaderElements.length; i++) {
                    const headerText = await pg.locator(allHeadersXpath).filter({visible:true}).nth(i).innerText()
                    log.info(`Verifying Header Text: ${headerText}`)
                    if (headerText && headerText.trim() === args.columnName.trim()) {
                        columnIndex = i
                        log.info(`ColumnName ${headerText} is at index ${columnIndex}`)
                        break
                    }
                }
                if (columnIndex === null) {
                    log.error(`Column Name "${args.columnName}" not found in Table Grid.`)
                    throw new Error(`Column Name "${args.columnName}" not found in Table Grid. for selector ${allHeadersXpath}`)
                }
                let cellSelector = args.isHyperLink? `//table/tbody/tr[${args.rowNumber}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]/a` : `//table/tbody/tr[${args.rowNumber}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]`
                    cellSelector=args.hyperlinkOccurance? `//table/tbody/tr[${args.rowNumber}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]/a[${args.hyperlinkOccurance}]` : cellSelector
                log.info(`Clicking Table Grid cell with selector ${cellSelector}`)
                await this.click({ selector: cellSelector })
                log.info(`Clicked on Table Grid cell with selector ${cellSelector}`)
            } catch (ex) {
                log.error(`Failed to click Table Grid cell with exception ${ex}`)
                throw new Error(`Failed to click Table Grid cell with exception ${ex}`)
            }
        }


        /**
     * Clicks on a specific row in a Grid table based on text in a given column.
     * @param rowText  - Text to find in the specified column.
     * @param columnName - The column Name to search for the text.
     * @Optional frame   - The frame selector to use when searching for the element.
     */
    @step('Click Table Grid Row by Column Name and Text')
    async clickTableGridRowByColumnNameAndText(args: { rowText: string; columnName: string; frame?: string }) {
        const pg: Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await this.waitUntilPageIsLoaded()
        const allHeadersXpath = '//table[@role="grid"]//tr/th'
        let columnIndex: number | null = null

        await this.waitForLocator({ selector: allHeadersXpath, timeOut: 60000 })

        try {
            // Get all header elements to find the index
            const allHeaderElements = await pg.locator(allHeadersXpath).filter({visible:true}).elementHandles()
            for (let i = 0; i < allHeaderElements.length; i++) {
                const headerText = await pg.locator(allHeadersXpath).filter({visible:true}).nth(i).innerText()
                log.info(`Verifying Header Text: ${headerText}`)
                if (headerText && headerText.trim() === args.columnName.trim()) {
                    columnIndex = i
                    log.info(`ColumnName ${headerText} is at index ${columnIndex}`)
                    break
                }
            }
            if (columnIndex === null) {
                log.error(`Column Name "${args.columnName}" not found in Table Grid.`)
                throw new Error(`Column Name "${args.columnName}" not found in Table Grid. for selector ${allHeadersXpath}`)
            }

            // Find the row number based on the text in the specified column
            let rowNumber: number | null = null
            const allRowsXpath = '//table[@role="grid"]/tbody/tr'
            const allRows = await pg.locator(allRowsXpath).filter({visible:true}).elementHandles()

            for (let i = 0; i < allRows.length; i++) {
                const cellSelector = `//table/tbody/tr[${i + 1}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]`
                const cellText = await pg.locator(cellSelector).filter({visible:true}).innerText()

                if (cellText && cellText.trim() === args.rowText.trim()) {
                    rowNumber = i + 1
                    log.info(`Row with text "${args.rowText}" found at row number ${rowNumber}`)
                    break
                }
            }

            if (rowNumber === null) {
                log.error(`Text "${args.rowText}" not found in column "${args.columnName}" in Table Grid.`)
                throw new Error(`Text "${args.rowText}" not found in column "${args.columnName}" in Table Grid.`)
            }

            const cellSelector = `//table/tbody/tr[${rowNumber}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]`
            log.info(`Clicking Table Grid cell with selector ${cellSelector}`)
            await this.click({ selector: cellSelector })
            log.info(`Clicked on Table Grid cell with selector ${cellSelector}`)

        } catch (ex) {
            log.error(`Failed to click Table Grid row with exception ${ex}`)
            throw new Error(`Failed to click Table Grid row with exception ${ex}`)
        }
    }

        /**
     * Gets the row number of a specific row in a Grid table based on text in a given column.
     * @param rowText  - Text to find in the specified column.
     * @param columnName - The column Name to search for the text.
     * @Optional frame   - The frame selector to use when searching for the element.
     * @returns A promise that resolves to the row number (starting from 1), or null if not found.
     */
        @step('Get Table Grid Row Number by Column Name and Text')
        async getTableGridRowNumberByColumnNameAndText(args: { rowText: string; columnName: string; frame?: string ; window?:Page}): Promise<number | null> {
            log.info(`Getting Table Grid row number with Row Text: ${args.rowText} and Column Name: ${args.columnName}`)
            const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            await this.waitUntilPageIsLoaded()
            const allHeadersXpath = '//table[@role="grid"]//tr/th'
            let columnIndex: number | null = null
    
            await this.waitForLocator({ selector: allHeadersXpath, timeOut: 60000 })
    
            try {
                // Get all header elements to find the index
                const allHeaderElements = await pg.locator(allHeadersXpath).filter({visible:true}).elementHandles()
                for (let i = 0; i < allHeaderElements.length; i++) {
                    const headerText = await pg.locator(allHeadersXpath).filter({visible:true}).nth(i).innerText()
                    log.info(`Verifying Header Text: ${headerText}`)
                    if (headerText && headerText.trim() === args.columnName.trim()) {
                        columnIndex = i
                        log.info(`ColumnName ${headerText} is at index ${columnIndex}`)
                        break
                    }
                }
                if (columnIndex === null) {
                    log.error(`Column Name "${args.columnName}" not found in Table Grid.`)
                    throw new Error(`Column Name "${args.columnName}" not found in Table Grid. for selector ${allHeadersXpath}`)
                }
    
                // Find the row number based on the text in the specified column
                let rowNumber: number | null = null
                const allRowsXpath = '//table[@role="grid"]/tbody/tr'
                const allRows = await pg.locator(allRowsXpath).filter({visible:true}).elementHandles()
    
                for (let i = 0; i < allRows.length; i++) {
                    const cellSelector = `//table/tbody/tr[${i + 1}]/td[not(contains(@style, 'display:none'))][${columnIndex + 1}]`
                    const cellText = await pg.locator(cellSelector).filter({visible:true}).innerText()
    
                    if (cellText && cellText.trim() === args.rowText.trim()) {
                        rowNumber = i + 1
                        log.info(`Row with text "${args.rowText}" found at row number ${rowNumber}`)
                        break
                    }
                }
    
                if (rowNumber === null) {
                    log.error(`Text "${args.rowText}" not found in column "${args.columnName}" in Table Grid.`)
                    throw new Error(`Text "${args.rowText}" not found in column "${args.columnName}" in Table Grid.`)
                }
    
                return rowNumber
    
            } catch (ex) {
                log.error(`Failed to get Table Grid row number with exception ${ex}`)
                throw new Error(`Failed to get Table Grid row number with exception ${ex}`)
            }
        }


            /**
     * Clicks on a specific cell in a Grid table based on row number and column Name.
     * @param rowNumber  - Row number (starting from 1) of Grid to click,
     * @param columnName - The column Name to click.
     * @Optional frame   - The frame selector to use when searching for the element.
     */
    @step('Click Table Grid Cell by Row and Column Name')
    async filterTable(args: { columnName: string;filterCondition: 'Contains';text:string;frame?: string;window?: Page }) {
        log.info(`Clicking on Table Grid cell with Column Name: ${args.columnName}`)
        const pg: Page = args.window? args.window: args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await this.waitUntilPageIsLoaded()
        const filterLocator = `//table[@role="grid"]//tr/th[@data-title="${args.columnName}"]/a`
        const filterByDropdown=`//span[@title="Operator"]//span[@role="option"]`
        const conditionTextBox=`//div/form[1]/div[1]/input[1]`
        try {

            await this.waitForLocator({ selector: filterLocator, timeOut: 60000 })
            log.info(`Clicking Table Grid cell with selector ${filterLocator}`)
            await this.click({ selector: filterLocator })
            await this.click({selector:filterByDropdown})
            await this.selectDropDownOption({text:args.filterCondition})
            await this.typeText({selector:conditionTextBox,text:args.text})
            await this.click({ selector: '//button[@type="submit"]' })
            
        } catch (ex) {
            log.error(`Failed to Filter Table Grid Header with exception ${ex}`)
            throw new Error(`Failed to Filter Table Grid Header with exception ${ex}`)

        }
    }

    /**
     * Verify if all checkboxes are checked, and check any unchecked checkboxes
     * @param selector Pass the XPath selector of the checkboxes to be checked
     **/
        @step('Verify and check all checkboxes if not checked')
        async VerifyAndCheckAllCheckboxes(args: { selector: string; frame?: string }) {
            const pg:Page = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
            log.info(`Checking and checking all checkboxes with selector ${args.selector}`)
            try {
                const checkboxes = pg.locator(args.selector).filter({visible:true})
                const noOfCheckboxes = await checkboxes.count()
                let allChecked = true
                for (let i = 0; i < noOfCheckboxes; i++) {
                    if (!(await checkboxes.nth(i).isChecked())) {
                        allChecked = false
                        await checkboxes.nth(i).check()
                        log.info(`Checkbox at index ${i} was not checked and has been checked.`)
                    }
                }
                if (allChecked) {
                    log.info('All checkboxes were already checked.')
                } else {
                    log.info('All checkboxes are now checked.')
                }
            } catch (ex) {
                log.error(`Checking and checking checkboxes with selector ${args.selector} failed with exception ${ex}`)
            }
        }
    

    /**
     * Clear the page cache by clearing cookies, permissions, and caches.
     * This method also reloads the page to ensure a fresh state.
     * */
    @step('Clear Page Cache')
    async clearCache() {
        const pg:Page = this.page
        log.info('Clearing page cache...')
        await pg.context().clearCookies()
        await pg.context().clearPermissions()
        await pg.evaluate(() => caches.keys().then(keys => keys.forEach(key => caches.delete(key))))
        await this.waitUntilPageIsLoaded()
        await pg.reload()
        await this.waitUntilPageIsLoaded()
        log.info('Page cache cleared successfully')
        }

    /**
     * Select a date from the calendar based on the input in MM/DD/YYYY format.
     * @param dateInput The date to select in MM/DD/YYYY format.
     */
    @step('Select Date from Calendar')
    async selectDateFromCalendar(args : {selector:string;dateInput: string;frame?: string;window?: Page}) {
        const pg: Page = args.window ? args.window : args.frame ? await this.getFrame({ selector: args.frame }) : this.page
        await this.click({selector:args.selector,window:pg})
        const [month, day, year] = args.dateInput.split('/').map(Number)
    
        // Open the calendar and navigate to the correct year and month
        const calendarHeaderSelector = '.k-header a[data-action="nav-up"]'
        const prevButtonSelector = '.k-header a[data-action="prev"]'
        const nextButtonSelector = '.k-header a[data-action="next"]'
        const calendarCellSelector = '.k-calendar-view td a[data-value]'
    
        // Wait for the calendar header to be visible
        await this.waitForLocator({ selector: calendarHeaderSelector ,window:pg})
    
        // Get the current month and year displayed in the calendar
        let currentMonthYear = await this.getInnerText({ selector: calendarHeaderSelector,window:pg })
        let [currentMonth, currentYearString] = currentMonthYear.split(' ')
        let currentYear = parseInt(currentYearString,10) // Explicitly parse the year as a number
    
        // Convert month names to numbers
        const monthMap: { [key: string]: number } = {
            January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
            July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
        }
        let currentMonthNumber = monthMap[currentMonth]
    
        // Navigate to the correct year
        while (currentYear !== year) {
            if (currentYear > year) {
                await this.click({ selector: prevButtonSelector,window:pg })
            } else {
                await this.click({ selector: nextButtonSelector,window:pg })
            }
            currentMonthYear = await this.getInnerText({ selector: calendarHeaderSelector,window:pg });
            [currentMonth, currentYearString] = currentMonthYear.split(' ')
            currentYear = parseInt(currentYearString,10) // Parse again after navigation
            currentMonthNumber = monthMap[currentMonth]
        }
    
        // Navigate to the correct month
        while (currentMonthNumber !== month) {
            if (currentMonthNumber > month) {
                await this.click({ selector: prevButtonSelector,window:pg})
            } else {
                await this.click({ selector: nextButtonSelector,window:pg })
            }
            currentMonthYear = await this.getInnerText({ selector: calendarHeaderSelector,window:pg });
            [currentMonth, currentYearString] = currentMonthYear.split(' ')
            currentMonthNumber = monthMap[currentMonth]
        }
    
        // Select the correct day
        const daySelector = `.k-calendar-view td a[data-value="${year}/${month -1}/${day}"]`
        await this.click({ selector: daySelector,window:pg })
        log.info(`Selected date: ${args.dateInput}`)
    }

    /**
     * Reload the page and wait until it is fully loaded.
     * */
    @step()
    async reloadPage(args?:{window?:Page}) {
        const pg:Page = args?.window ? args.window : this.page
        log.info('Reloading the page...')
        await pg.reload()
        await this.waitUntilPageIsLoaded()
        log.info('Page reloaded successfully')
    }
    
    /**
     * Wait for a specified amount of time (in milliseconds).
     * @param timeOut The time to wait in milliseconds.
     * */
    @step()
    async waitforTimeOut(args: { timeOut: number }) {
        log.info(`Waiting for ${args.timeOut} milliseconds`)
        await this.page.waitForTimeout(args.timeOut)
        log.info(`Waited for ${args.timeOut} milliseconds`)
    }

}
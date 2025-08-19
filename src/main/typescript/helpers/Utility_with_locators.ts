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

    /**
     * Click On An Element With text
     * @param text Pass the text of element for which Click action has to be performed
     **/
    @step('Click on element with text')
    async clickUsingText(args: { text: string; occurance?: number }) {
        const locator = this.page.locator(`text=${args.text}`)
        log.info(`Clicking on element with text ${args.text}`)
        try {
            const noOfElementsFound = await locator.count()
            if (noOfElementsFound > 1) {
                await locator.nth(args.occurance ? args.occurance : 0).click()
            } else {
                await locator.first().click()
            }
        } catch (ex) {
            log.error(`Clicking on element with text ${args.text} failed with exception ${ex}`)
        }
    }

    /**
     * Click On An Element With Locator
     * @param locator Pass the Playwright Locator for the element to click
     **/
    @step('Click on element')
    async click(args: { locator: Locator; occurance?: number; timeout?: number }) {
        log.info(`Clicking on element`)
        try {
            const targetLocator = args.occurance !== undefined 
                ? args.locator.nth(args.occurance)
                : args.locator.first()
            
            await targetLocator.waitFor({ timeout: args.timeout ?? 30000, state: 'visible' })
            await targetLocator.click()
            await this.waitUntilPageIsLoaded()    
        }
        catch (ex) {
            log.error(`Clicking on element failed with exception ${ex}`)
            throw new Error(`Clicking on element failed with exception ${ex}`)
        }
    }

    /**
     * Click On All Elements With Locator
     * @param locator Pass the Playwright Locator for elements to click
     **/
    @step('Click on all elements')
    async clickAll(args: { locator: Locator }) {
        log.info(`Clicking on all elements`)
        try {
            const count = await args.locator.count()
            for (let i = 0; i < count; i++) {
                await args.locator.nth(i).click()
            }
        } catch (ex) {
            log.error(`Clicking on elements failed with exception ${ex}`)
        }
    }

    /**
     * Checkbox click On An Element With Locator
     * @param locator Pass the Playwright Locator for the checkbox element
     **/
    @step('Checkbox click on element')
    async check(args: { locator: Locator; occurance?: number }) {
        log.info(`Checking checkbox element`)
        try {
            const targetLocator = args.occurance !== undefined
                ? args.locator.nth(args.occurance)
                : args.locator.first()
            
            await targetLocator.waitFor({ state: 'visible' })
            await targetLocator.check({ force: true })
        } catch (ex) {
            log.error(`Checking element failed with exception ${ex}`)
        }
    }

    @step()
    async waitUntilElementHaveValue(args: { element: Locator; value: any }) {
        await expect(args.element).toHaveValue(args.value, { timeout: 60000 })
    }

    /**
     * Get Attribute Value
     * @param locator Element locator
     * @param attributeName Attribute Value that we want
     * @param occurance get the occurance of element when multiple elements are found
     * @returns
     */
    @step('Get Attribute Value')
    async getAttributeValue(args: { locator: Locator; occurance?: number; attributeName: string }) {
        const targetLocator = args.occurance !== undefined
            ? args.locator.nth(args.occurance)
            : args.locator.first()
        
        const attributeValue = await targetLocator.getAttribute(args.attributeName)
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
            await Promise.all([
                this.page.waitForSelector('#loader', {state:'hidden', timeout: 60000}).catch(() => {}),
                this.page.waitForLoadState('load'),
                this.page.waitForLoadState('domcontentloaded'), 
                this.page.waitForLoadState('networkidle', { timeout: 60000 })
            ])
        } catch {
            log.error('Timed out waiting for load state')
        }
    }

    /**
     * Type Text into Element
     * @param locator Locator of the element
     * @param text text to be entered
     **/
    @step('Type Text')
    async typeText(args: { locator: Locator; text: string; occurance?: number }) {
        try {
            log.info(`Typing text into element`)
            const targetLocator = args.occurance !== undefined
                ? args.locator.nth(args.occurance)
                : args.locator.first()
            
            await targetLocator.fill(args.text)
            log.info(`Sent Text ${args.text} to element`)
        } catch (ex) {
            log.error(`Unable to type text: ${ex}`)
        }
    }

    /**
     * Get Element By Label
     * @param labelText text of the label
     * @returns Locator for the element
     */
    @step('Get Element By Label')
    async getElementByLabel(args: { labelText: string }): Promise<Locator> {
        try {
            log.info(`Trying to get element by label: ${args.labelText}`)
            return this.page.getByLabel(args.labelText)
        } catch (ex) {
            log.error(`Unable to find element with label: ${args.labelText}`)
            throw ex
        }
    }

    /**
     * Wait For Locator to be visible
     * @param locator Locator of the element
     * @param occurance which occurance to wait for if there are multiple occurances
     * @param timeOut timeout in milliseconds
     */
    @step('Wait For Locator')
    async waitForLocator(args: { locator: Locator; occurance?: number; timeOut?: number }) {
        try {
            const targetLocator = args.occurance !== undefined
                ? args.locator.nth(args.occurance)
                : args.locator.first()
            
            await targetLocator.waitFor({ 
                timeout: args.timeOut ?? 30000, 
                state: 'visible' 
            })
            log.info(`Element found!`)
        }
        catch(ex) {
            log.error(`${ex}`)
            throw new Error(`${ex}`)
        }
    }

    /**
     * Scroll element into view
     * @param locator Locator of element
     * @param occurance which occurance to scroll
     */
    @step()
    async scrollIntoView(args: { locator: Locator; occurance?: number }) {
        const targetLocator = args.occurance !== undefined
            ? args.locator.nth(args.occurance)
            : args.locator.first()
        
        await targetLocator.scrollIntoViewIfNeeded()
        log.info(`scrolled until the element is in view`)
    }

    /**
     * Focus on element
     * @param locator Locator of the element
     */
    @step('focus on element')
    async focus(args: { locator: Locator }) {
        await args.locator.first().focus()
        log.info(`Focussed element`)
    }

    /**
     * Gets The Count Of Elements Matching Locator
     * @param locator locator of the element
     */
    @step('Get Count Of Elements')
    async getCountOfElements(args: { locator: Locator }) {
        const count = await args.locator.count()
        log.info(`No of Elements found: ${count}`)
        return count
    }

    /**
     * Get Dropdown Item With Text
     * @param text dropdown Item text
     * @returns returns dropdown locator
     */
    @step('Get Dropdown Item With Text')
    async getDropDownItemWithText(args: { text: string }): Promise<Locator> {
        log.info(`Getting the dropdown Item with text ${args.text}`)
        return this.page.locator(`li[role="option"]:has-text("${args.text}")`)
    }

    /**
     * Selects the Item with text in dropdown
     * @param text text of the element to be selected
     */
    @step('Select Dropdown Option')
    async selectDropDownOption(args: { text: string }) {
        await this.page.getByRole('option', { name: args.text, exact: true }).click()
        log.info(`clicked on dropdown Item with text ${args.text}`)
    }

    /**
     * Select Dropdown Value
     * @param locator Locator of the select element
     * @param text text of the option to select
     * @param index index of the option to select
     */
    @step('Select Dropdown Value')
    async selectDropDownValue(args: { locator: Locator; text?: string; index?: number }) {
        if (args.index !== undefined) {
            await args.locator.selectOption({ index: args.index })
            log.info(`clicked on dropdown Item with Index ${args.index}`)
        }
        if (args.text) {
            log.info(`Trying to select dropdown Item with text ${args.text}`)
            try {
                await args.locator.selectOption(args.text)
            } catch(ex) {
                await args.locator.selectOption({ label: args.text })
            }
            log.info(`clicked on dropdown Item with text ${args.text}`)
        }
    }

    /**
     * Wait for new window
     * @param clickEvent
     * @returns Page object for the new window
     */
    @step('Wait For New Window')
    async waitForWindow(clickEvent: any) {
        const [popup] = await Promise.all([this.page.waitForEvent('popup'), clickEvent])
        await popup.waitForLoadState()
        return popup
    }

    /**
     * Get all dropdown items text
     * @returns array of dropdown item texts
     */
    @step('Get Dropdown Items')
    async getDropDownItems(): Promise<string[]> {
        return await this.page.locator('li[role="option"]').allTextContents()
    }

    /**
     * Get Element - returns a locator based on occurance
     * @param locator selector of the element
     * @param occurance which occurance to get
     * @returns Locator
     */
    @step('Get Element')
    async getElement(args: { locator: Locator; occurance?: number }): Promise<Locator> {
        const count = await args.locator.count()
        log.info(`No of elements found: ${count}`)
        return args.occurance !== undefined 
            ? args.locator.nth(args.occurance)
            : args.locator.first()
    }

    @step('Get First Element')
    async getElementFirst(args: { locator: Locator }): Promise<Locator> {
        return args.locator.first()
    }

    @step('Get Second Element')
    async getElementSecond(args: { locator: Locator }): Promise<Locator> {
        return args.locator.nth(1)
    }

    @step('Get Last Element')
    async getElementLast(args: { locator: Locator }): Promise<Locator> {
        return args.locator.last()
    }

    /**
     * Download File
     * @param locator locator of the download trigger element
     * @returns Downloaded file path
     */
    @step('Download File')
    async downloadFile(args: { locator: Locator }) {
        const downloadPromise = this.page.waitForEvent('download')
        await args.locator.click()
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
     * Get Element With Text
     * @param text text of the element
     * @param occurance which occurance to get
     * @returns Locator
     */
    @step('Get Element With Text')
    async getElementWithText(args: { text: string; occurance?: number }): Promise<Locator> {
        const locator = this.page.locator(`text=${args.text}`)
        const count = await locator.count()
        log.info(`No of elements found with text ${args.text}: ${count}`)
        return args.occurance !== undefined 
            ? locator.nth(args.occurance)
            : locator.first()
    }

    /**
     * Get all text contents from elements
     * @param locator element locator
     * @returns array of text contents
     */
    @step('Get Element Text')
    async getAllTextContents(args: { locator: Locator }): Promise<string[]> {
        const text = await args.locator.allTextContents()
        log.info(`extracted text from elements: ${text}`)
        return text
    }

    /**
     * Get text content from element
     * @param locator element locator
     * @returns text content
     */
    @step('Get Element Text content')
    async getTextContent(args: { locator: Locator }): Promise<string | null> {
        const text = await args.locator.textContent()
        log.info(`extracted text from element: ${text}`)
        return text
    }

    /**
     * Check if element exists and is visible
     * @param locator element locator
     * @returns boolean
     */
    @step('Check If Element Exists')
    async checkIfElementExists(args: { locator: Locator }): Promise<boolean> {
        log.info(`checking if element exists`)
        const count = await args.locator.count()
        if (count === 0) {
            log.info(`element does not exist`)
            return false
        }
        const isVisible = await args.locator.first().isVisible()
        log.info(`element is ${isVisible ? 'visible' : 'not visible'}`)
        return isVisible
    }

    /**
     * Check if element does not exist
     * @param locator element locator
     * @returns boolean
     */
    @step('Check If Element Not Exists')
    async checkIfElementNotExists(args: { locator: Locator }): Promise<boolean> {
        log.info(`checking if element does not exist`)
        const count = await args.locator.count()
        return count === 0
    }

    /**
     * Expand Dropdown Item
     * @param locator dropdown element locator
     */
    @step('Expand Dropdown Item')
    async expandDropDownItem(args: { locator: Locator }) {
        const dropdownArrow = args.locator.locator('[arialabel="downArrow"]')
        await dropdownArrow.click()
        log.info(`Expanded Dropdown Item`)
    }

    // Continue with more methods following the same pattern...
    // The key principles are:
    // 1. Accept Locator objects instead of string selectors
    // 2. Use Locator methods directly (nth, first, last, etc.)
    // 3. Remove page.locator() calls since we already have Locators
    // 4. Simplify the code by leveraging Locator's built-in capabilities
}
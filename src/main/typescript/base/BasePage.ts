import { Page } from '@playwright/test'

import { Utility } from '../helpers/Utility'
const envConfig = require('../../resources/env/envConfig.json')

export class BasePage {
    readonly page: Page
    readonly utility: Utility
    readonly ENV = envConfig[process.env.environmentToRun]
    constructor(page: Page) {
        this.page = page
        this.utility = new Utility(page)
    }
}

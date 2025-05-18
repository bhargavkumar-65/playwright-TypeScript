import { expect } from '@playwright/test'

import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'

export class ArticlePageActions extends BasePage {
    static title: string = '//div[@id="article-content"]//h2'
    static date: string = '#article-date-value'
    static author: string = '#article-author-name'
    static authorTitle: string = '#article-author-title'
    static content: string = '#article-content'
    static mainImage: string = '#article-image'

    @step()
    async verifyArticleCardMetaDataDisplay() {
        expect(await this.utility.checkIfElementExists({ selector: ArticlePageActions.title })).toBeTruthy()
        expect(await this.utility.checkIfElementExists({ selector: ArticlePageActions.date })).toBeTruthy()
        expect(await this.utility.checkIfElementExists({ selector: ArticlePageActions.author })).toBeTruthy()
    }

    @step()
    async verifyArticleCardMetaDataContentWithRegEX(regex:string) {
        expect(await this.utility.getInnerText({ selector: ArticlePageActions.content })).toMatch(/\w+/)
    }

    @step()
    async getArticleTitle() {
        return await this.utility.getTextContent({ selector: ArticlePageActions.title })
    }


    @step()
    async CheckForBrokenLinks()
    {
        const links = this.page.locator('a')
        const linkCount = await links.count()
        for (let j = 0; j < linkCount; j++) {
            const href = await links.nth(j).getAttribute('href')
            if (!isValidLink(href)) continue
            if (isExternal(href!)) {
                const resp = await this.page.request.get(href!)
                expect.soft(resp.status(), `External link broken: ${href}`).not.toBe(400)
                expect.soft(resp.status(), `External link broken: ${href}`).not.toBe(404)
            }
        }
        await this.page.goBack()
        
    }

}

function isExternal(url: string) {
    return /^https?:\/\//.test(url)
}

function isValidLink(href: string | null) {
    if (!href) return false
    if (href.startsWith('#') || href.startsWith('mailto:') || href.includes('linkedin')) return false
    return true
}

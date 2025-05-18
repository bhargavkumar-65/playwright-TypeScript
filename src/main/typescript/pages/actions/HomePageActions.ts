import { expect } from '@playwright/test'

import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'

export class HomePageActions extends BasePage {
  static featuredArticles: string = '#featured-articles-section'
  static articleList: string = '#article-list-section'
  static aboutSection: string = '#about-section'
  static contactSection: string = '#contact-section'
  static searchInput: string = 'input[placeholder="Search articles..."]'
  static articleCardImages: string = '#article-image'


  @step()
  async search(text: string) {
    await this.utility.typeText({ selector: HomePageActions.searchInput, text })
  }

  @step()
  async launchApp()
  {
        await this.page.goto(this.ENV.BASE_URL)
        await this.utility.waitUntilPageIsLoaded()
  }

  // ARTICLES 

  static categoryButtons= (categoryToSelect: string)=> `//div[@class="flex flex-wrap gap-2"]//button[text()="${categoryToSelect}"]`
    static articleCards: string = 'article[id^="article-card-"]'
    static articleHeader: string = `#article-headline`

    @step()
    async clickOnFirstArticle() {
        await this.utility.waitForLocator({ selector: HomePageActions.articleCards })
        await this.utility.click({ selector: HomePageActions.articleCards, occurance: 1 })
    }

    @step()
    async validateIfFirstArticleIsDisplayed() {
        return await this.utility.waitForLocator({ selector: HomePageActions.articleCards, occurance: 1 })
    }

    @step()
    async filterByCategory(category: string) {
        await this.utility.click({ selector: HomePageActions.categoryButtons(category) })
        // TODO ADD ids properly
        
    }

    @step()
    async getArticleHeaderText() {
        return await this.utility.getTextContent({ selector: HomePageActions.articleHeader })
    }

    @step()
    async verifyIfAnyArticleCardImagesAreBroken() {
        const count = await this.getTotalNumberOfArticles()
        for (let i = 0; i < count; i++) {
            // await this.clickOnArticleCard(i)
            // Main image
            await this.utility.scrollIntoView({ selector: HomePageActions.articleCards, occurance: i })
            const src = await this.utility.getAttributeValue({ selector: HomePageActions.articleCardImages, attributeName: 'src' })
            const resp = await this.page.request.get(src)
            expect.soft(resp.status(), `Main image broken: ${src}`).toBeLessThan(400)
            // // Images in content
            // const imgCount = await this.utility.getCountOfElements({ selector: ArticlePageActions.content })
            // for (let j = 0; j < imgCount; j++) {
            //     const src = await this.utility.getAttributeValue({ selector: ArticlePageActions.content, attributeName: 'src' })
            //     const resp = await this.page.request.get(src)
            //     expect.soft(resp.status(), `Content image broken: ${src}`).toBeLessThan(400)
            // }
        }
    }

    @step()
    async getTotalNumberOfArticles() {
        return await this.utility.getCountOfElements({ selector: HomePageActions.articleCards })
    }

    @step()
    async clickOnArticleCard(index: number) {
        await this.utility.click({ selector: HomePageActions.articleCards, occurance: index })
    }
  
}

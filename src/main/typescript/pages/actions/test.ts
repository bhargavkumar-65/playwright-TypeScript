import { expect,Page } from '@playwright/test'

export class BrowseTheWeb {
  constructor(private readonly _page: Page) {}
  
  get page() {
    return this._page
  }
}

// Enhanced actor with abilities
export class Actor {
  private abilities = new Map<any, any>()
  
  constructor(private readonly name: string) {}
  
  can<T>(ability: T): this {
    this.abilities.set(ability.constructor, ability)
    return this
  }
  
  ability<T>(abilityClass: new (...args: any[]) => T): T {
    const ability = this.abilities.get(abilityClass)
    if (!ability) {
      throw new Error(`${this.name} does not have the ability ${abilityClass.name}`)
    }
    return ability
  }
  
  async attemptsTo(...tasks: Array<(actor: Actor) => Promise<void>>): Promise<this> {
    for (const task of tasks) {
      await task(this)
    }
    return this
  }
}

// tasks.ts

export class Navigate {
  static to(url: string) {
    return async (actor: Actor) => {
      const browse = actor.ability(BrowseTheWeb)
      await browse.page.goto(url)
    }
  }
  
  static toGetStartedPage() {
    return async (actor: Actor) => {
      const browse = actor.ability(BrowseTheWeb)
      await browse.page.locator('a', { hasText: 'Get started' }).first().click()
    }
  }
}

export class Verify {
  static tocContains(items: string[]) {
    return async (actor: Actor) => {
      const browse = actor.ability(BrowseTheWeb)
      const tocList = browse.page.locator('article div.markdown ul > li > a')
      await expect(tocList).toHaveText(items)
    }
  }
}
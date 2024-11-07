import { test } from '@playwright/test'

export function step(description?: string) {
    return function (target: Function, context: ClassMethodDecoratorContext) {
        return function replacementMethod(...args: any) {
            const name = `${this.constructor.name}.${context.name as string}`
            const stepName = description ? `${name} - ${description}` : name
            return test.step(stepName, async () => {
                return await target.call(this, ...args)
            })
        }
    }
}

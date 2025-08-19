# Playwright Locator Migration Guide for Utility.ts

## Key Principles for Using Playwright Locators

### 1. **Understanding Locators**
- Locators are **NOT strings** - they are objects that represent a way to find elements
- Locators are **already bound** to their page/frame context
- You **cannot** do `page.locator(existingLocator)` - this is incorrect
- Locators are **lazy** - they don't find elements until an action is performed

### 2. **Function Signature Changes**

#### Before (String Selector):
```typescript
async click(args: { selector: string; frame?: string; occurance?: number }) {
    const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
    await pg.locator(args.selector).nth(args.occurance || 0).click()
}
```

#### After (Locator):
```typescript
async click(args: { locator: Locator; occurance?: number }) {
    const targetLocator = args.occurance !== undefined 
        ? args.locator.nth(args.occurance)
        : args.locator.first()
    await targetLocator.click()
}
```

### 3. **How to Call Functions with Locators**

#### Creating Locators (in calling code):
```typescript
// Instead of passing strings:
await utility.click({ selector: 'button.submit' })

// Pass Locator objects:
const submitButton = page.locator('button.submit')
await utility.click({ locator: submitButton })

// Or inline:
await utility.click({ locator: page.locator('button.submit') })

// Using semantic locators (recommended):
await utility.click({ locator: page.getByRole('button', { name: 'Submit' }) })
```

### 4. **Handling Frames with Locators**

Since Locators are bound to their context, frame handling changes:

#### Option 1: Create Locator with Frame Context
```typescript
// Create locator within frame context
const frameLocator = page.frameLocator('iframe').locator('button')
await utility.click({ locator: frameLocator })
```

#### Option 2: Use Page-level Methods for Frame Navigation
```typescript
// For complex frame scenarios, create locators at the page level
const frame = page.frame({ name: 'myFrame' })
const buttonLocator = frame!.locator('button')
await utility.click({ locator: buttonLocator })
```

### 5. **Benefits of Using Locators**

1. **Type Safety**: Full TypeScript support
2. **Auto-waiting**: Built-in retry mechanism
3. **Chaining**: Easy to refine locators
4. **Performance**: Reusable objects
5. **Best Practices**: Follows Playwright recommendations

### 6. **Common Patterns**

#### Multiple Elements:
```typescript
// Instead of counting and looping with selectors
const elements = page.locator('.item')
const count = await elements.count()
for (let i = 0; i < count; i++) {
    await elements.nth(i).click()
}
```

#### Filtering:
```typescript
// Chain filters on locators
const visibleButtons = page.locator('button').filter({ hasText: 'Submit' })
await utility.click({ locator: visibleButtons })
```

#### Waiting:
```typescript
// Locators have built-in waiting
await locator.waitFor({ state: 'visible', timeout: 30000 })
```

### 7. **Migration Strategy**

1. **Start with Core Functions**: Begin with frequently used functions like `click`, `typeText`, `waitForLocator`
2. **Update Function Signatures**: Change from `selector: string` to `locator: Locator`
3. **Remove Redundant Code**: 
   - Remove `pg.locator(args.selector)` patterns
   - Remove frame resolution logic (Locators are already bound to context)
4. **Update Calling Code**: Change how functions are called to pass Locators
5. **Test Thoroughly**: Ensure all functionality works with new Locator-based approach

### 8. **Example Migration**

#### Original Utility Function:
```typescript
async hover(args: { selector: string; frame?: string; occurance?: number }) {
    const pg = args.frame ? await this.getFrame({ selector: args.frame }) : this.page
    const element = await pg.locator(args.selector).nth(args.occurance || 0)
    await element.hover()
}
```

#### Migrated to Locator:
```typescript
async hover(args: { locator: Locator; occurance?: number }) {
    const targetLocator = args.occurance !== undefined
        ? args.locator.nth(args.occurance)
        : args.locator.first()
    await targetLocator.hover()
}
```

#### Calling the Migrated Function:
```typescript
// Before
await utility.hover({ selector: '#menu-item', occurance: 2 })

// After
const menuItems = page.locator('#menu-item')
await utility.hover({ locator: menuItems, occurance: 2 })
```

### 9. **Special Cases**

#### Dynamic Selectors:
For cases where you build selectors dynamically (like table cells), create the Locator at the call site:

```typescript
// Instead of passing a dynamic string
const cellSelector = `//table/tr[${row}]/td[${col}]`
await utility.click({ selector: cellSelector })

// Create the Locator with the dynamic selector
const cellLocator = page.locator(`//table/tr[${row}]/td[${col}]`)
await utility.click({ locator: cellLocator })
```

#### Getting Selector String from Locator:
If you absolutely need the selector string (rare cases), you can't extract it directly from a Locator. Design your functions to work with Locators instead.

### 10. **What NOT to Do**

❌ **Don't** try to extract selector strings from Locators
❌ **Don't** use `page.locator(existingLocator)`
❌ **Don't** try to change the page context of an existing Locator
❌ **Don't** store Locators for too long (page navigation invalidates them)

### 11. **Best Practices**

✅ Create Locators close to where they're used
✅ Use semantic locators (`getByRole`, `getByLabel`, `getByText`)
✅ Pass Locators to utility functions
✅ Let Locators handle waiting and retries
✅ Use Locator methods for refinement (`.filter()`, `.nth()`, etc.)

This migration will make your code more robust, maintainable, and aligned with Playwright best practices.
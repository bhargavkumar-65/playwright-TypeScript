# Playwright Test Decorators Implementation

## Overview

This implementation provides a set of custom test decorators for the Playwright automation framework. These decorators make it easier to create and organize tests using class-based structures while maintaining the power and flexibility of Playwright's test runner.

## Implemented Decorators

### 1. `@testDecorator`

A basic test decorator that transforms class methods into Playwright tests.

```typescript
@testDecorator('should login with valid credentials')
async testLogin({ page }) {
  // Test implementation
}
```

### 2. `@testMethod`

A simplified test decorator that accepts a title string directly.

```typescript
@testMethod('should display product details correctly')
async verifyProductDetails({ page }) {
  // Test implementation
}
```

### 3. `@conditionalTest`

A more advanced decorator with options for conditional execution and tagging.

```typescript
@conditionalTest({
  title: 'should process payment',
  tags: ['payment', 'e2e'],
  conditionalSkip: () => process.env.SKIP_PAYMENT_TESTS === 'true',
})
async testPaymentProcessing({ page }) {
  // Test implementation
}
```

## Example Files

1. **Decorators.ts** - Contains the implementation of all decorators
2. **BusinessEntityInformationTests.ts** - Example tests using the decorators with the Page Object Model pattern
3. **DecoratorExamples.ts** - Simple examples of how to use the decorators
4. **TestDecorators.md** - Documentation for using the decorators

## Benefits

- **Improved Organization** - Tests are grouped logically in classes
- **Better Readability** - Clean syntax and descriptive test titles
- **Environment Awareness** - Tests adapt to different environments
- **Conditional Testing** - Support for dynamic test skipping
- **Reusable Test Components** - Tests can leverage methods from the same class

## Using with Page Object Model

The test decorators work seamlessly with the Page Object Model pattern as demonstrated in the `BusinessEntityInformationPageActions` and `BusinessEntityInformationTests` classes.

## Best Practices

1. Group related tests in the same class
2. Use descriptive test names that explain the expected behavior
3. Use tags for filtering tests by feature or category
4. Use conditional skipping for environment-specific tests
5. Keep test methods focused on a single piece of functionality

## Future Enhancements

1. Support for test parameterization (data-driven tests)
2. Integration with test reporting tools
3. Additional fixture handling options
4. Support for test dependencies

## Summary

These decorators provide a more elegant and maintainable way to write Playwright tests, especially for larger test suites. They make it easier to organize tests logically and reduce boilerplate code while maintaining full access to Playwright's testing capabilities.

# Playwright Test Decorators Guide

This guide explains how to use the custom test decorators provided in the `Decorators.ts` file for writing cleaner and more maintainable Playwright tests using a class-based approach.

## Available Test Decorators

The framework provides the following test-related decorators:

1. **`@Test`** - Unified decorator that supports all test scenarios (recommended)
2. **`@testDecorator`** - Basic test decorator for class methods
3. **`@testMethod`** - Simplified test decorator that accepts a title string
4. **`@conditionalTest`** - Advanced test decorator with configuration options
5. **`@testWithData`** - Data-driven test decorator that creates separate tests for each data item

## Basic Usage

### `@testDecorator`

The most basic decorator that transforms a class method into a Playwright test.

```typescript
import { testDecorator } from '../main/typescript/helpers/Decorators';

class LoginTests {
  @testDecorator('should login with valid credentials')
  async testLogin({ page }) {
    await page.goto('/login');
    // Test implementation
  }

  @testDecorator() // Uses method name as title
  async verifyDashboard({ page }) {
    // Test implementation
  }
}
```

### `@testMethod`

A simplified decorator that only requires a title:

```typescript
import { testMethod } from '../main/typescript/helpers/Decorators';

class ProductTests {
  @testMethod('should display product details correctly')
  async verifyProductDetails({ page }) {
    // Test implementation
  }
}
```

### `@conditionalTest`

A more advanced decorator that supports conditional test execution and tagging:

```typescript
import { conditionalTest } from '../main/typescript/helpers/Decorators';

class CheckoutTests {
  @conditionalTest({
    title: 'should process payment',
    tags: ['payment', 'e2e'],
    conditionalSkip: () => process.env.SKIP_PAYMENT_TESTS === 'true',
  })
  async testPaymentProcessing({ page }) {
    // Test implementation
  }
}
```

## Unified Testing with `@Test`

The unified `@Test` decorator combines all testing functionality into one powerful decorator. It supports regular tests, data-driven tests, test metadata, and conditional execution.

### Basic Usage

```typescript
import { Test } from '../main/typescript/helpers/Decorators';

class LoginTests {
  // Simple test with just a title
  @Test('should display the login page')
  async testLoginDisplay({ page }) {
    await page.goto('/login');
    await expect(page.locator('h1')).toHaveText('Login');
  }
}
```

### With Metadata

```typescript
@Test({
  title: 'User can login with valid credentials',
  description: 'Verifies that users can successfully login with valid credentials',
  testCaseId: 'LOGIN-001',
  tags: ['login', 'smoke', 'critical-path'],
})
async testSuccessfulLogin({ page }) {
  // Test implementation
}
```

### Data-Driven Tests

```typescript
@Test({
  title: 'Login validation handles edge cases',
  testCaseId: 'LOGIN-002',
  data: [
    { username: 'valid@example.com', password: 'valid123', expectSuccess: true },
    { username: 'invalid@example.com', password: 'wrong', expectSuccess: false },
  ],
})
async testLoginValidation({ page }, testCase) {
  // Fill form using testCase data
  await page.fill('#username', testCase.username);
  await page.fill('#password', testCase.password);
  await page.click('button[type="submit"]');
  
  // Assert based on expected outcome
  if (testCase.expectSuccess) {
    await expect(page).toHaveURL(/dashboard/);
  } else {
    await expect(page.locator('.error-message')).toBeVisible();
  }
}
```

### Conditional Execution

```typescript
@Test({
  title: 'Password reset functionality works correctly',
  testCaseId: 'LOGIN-003',
  skip: () => process.env.RUN_FULL_SUITE !== 'true', // Only run in full test suite
})
async testPasswordReset({ page }) {
  // Test implementation
}
```

### Dynamic Test Data with Conditional Skipping

```typescript
@Test({
  title: 'Registration form validates user inputs',
  data: () => {
    // Generate test data dynamically
    return [
      { field: 'email', value: 'invalid-email', errorMsg: 'Invalid email' },
      { field: 'password', value: '123', errorMsg: 'Password too short' },
    ];
  },
  skip: (testItem) => testItem?.field === 'password', // Skip password tests
})
async testRegistrationValidation({ page }, testData) {
  // Test implementation using testData
}
```

### Configuration Options

The `@Test` decorator supports the following configuration options:

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Title of the test |
| `description` | string | Detailed description of the test purpose |
| `testCaseId` | string | ID for traceability to requirements/test cases |
| `tags` | string[] | Tags for categorizing and filtering tests |
| `data` | array or function | Test data for data-driven testing |
| `skip` | boolean or function | Controls whether test should be skipped |
| `timeout` | number | Custom timeout for the test in milliseconds |
| `retries` | number | Number of retry attempts for flaky tests |

## Environment-Aware Testing

All test decorators automatically prepend the current environment name to the test title:

```
DEVELOPMENT: should login with valid credentials
STAGING: should login with valid credentials
PRODUCTION: should login with valid credentials
```

The environment is determined by the `NODE_ENV` environment variable (defaults to 'development').

## Method Parameters

The decorated methods should accept an object parameter containing the Playwright fixtures:

```typescript
@testMethod('should navigate to about page')
async testNavigation({ page, context }) {
  // Use page and context fixtures
}
```

## Benefits of Using Test Decorators

1. **Organization** - Tests can be grouped logically in classes
2. **DRY Code** - Eliminates repetitive test boilerplate
3. **Environmental Awareness** - Built-in environment handling
4. **Conditional Testing** - Skip tests based on dynamic conditions
5. **Documentation** - Better code organization and documentation

## Best Practices

1. Group related tests in the same class
2. Use descriptive test names that explain the expected behavior
3. Use tags for filtering tests by feature or category
4. Use conditional skipping for environment-specific tests
5. Keep test methods focused on a single piece of functionality

## Data-Driven Testing with `@testWithData`

The `@testWithData` decorator allows you to create data-driven tests that run once for each item in a dataset.

```typescript
import { testWithData } from '../main/typescript/helpers/Decorators';

class LoginTests {
  static readonly TEST_DATA = [
    { username: 'valid@example.com', password: 'valid123', expectSuccess: true },
    { username: 'invalid@example.com', password: 'wrong', expectSuccess: false },
    { username: '', password: 'valid123', expectSuccess: false },
  ];

  @testWithData(() => LoginTests.TEST_DATA, {
    title: 'validates login form under various conditions',
    tags: ['login', 'data-driven'],
  })
  async loginTest({ page }, scenario) {
    await page.goto('/login');
    await page.fill('#username', scenario.username);
    await page.fill('#password', scenario.password);
    await page.click('#login-button');
    
    // Assert based on expected outcome
    if (scenario.expectSuccess) {
      await expect(page.locator('.welcome-message')).toBeVisible();
    } else {
      await expect(page.locator('.error-message')).toBeVisible();
    }
  }
}
```

### Key features of `@testWithData`:

1. Creates a separate test for each data item
2. Each test gets a unique name that includes the data being used
3. Supports conditional skipping of specific data cases
4. Can take static data or a function that returns data
5. The test data is passed as the second parameter to the test method
6. Environment name is prepended to all test titles

## Example Implementation

See the `DecoratorExamples.ts` and `TestWithDataExample.ts` files for practical examples of using these decorators in real tests.

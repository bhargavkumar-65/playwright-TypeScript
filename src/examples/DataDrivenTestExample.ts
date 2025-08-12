import { expect } from '@playwright/test';

import { testWithData } from '../main/typescript/helpers/Decorators';

/**
 * Example test class using testWithData decorator to demonstrate its usage
 */
class DataDrivenLoginTests {
  // Define some test data for login scenarios
  static readonly LOGIN_TEST_DATA = [
    { 
      username: 'valid@example.com', 
      password: 'Password123',
      expectSuccess: true,
      expectedMessage: 'Welcome, Valid User',
    },
    { 
      username: 'invalid@example.com', 
      password: 'wrongpassword',
      expectSuccess: false,
      expectedMessage: 'Invalid username or password',
    },
    { 
      username: '', 
      password: 'Password123',
      expectSuccess: false,
      expectedMessage: 'Username is required',
    },
    { 
      username: 'valid@example.com', 
      password: '',
      expectSuccess: false,
      expectedMessage: 'Password is required',
    },
  ];
  
  /**
   * Data-driven login test using testWithData decorator
   * This creates a separate test for each data item in LOGIN_TEST_DATA
   */
  @testWithData(DataDrivenLoginTests.LOGIN_TEST_DATA, { 
    title: 'should validate login scenarios',
    tags: ['login', 'validation'],
  })
  async testLoginScenarios({ page }, testCase) {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form
    await page.fill('#username', testCase.username);
    await page.fill('#password', testCase.password);
    await page.click('#login-button');
    
    // Check results based on expected outcome
    if (testCase.expectSuccess) {
      // Should see welcome message for successful login
      const welcomeMsg = await page.textContent('.welcome-message');
      expect(welcomeMsg).toBe(testCase.expectedMessage);
    } else {
      // Should see error message for failed login
      const errorMsg = await page.textContent('.error-message');
      expect(errorMsg).toBe(testCase.expectedMessage);
    }
  }
  
  /**
   * Example with conditional skipping based on the data
   * Tests with empty usernames will be skipped
   */
  @testWithData(DataDrivenLoginTests.LOGIN_TEST_DATA, {
    title: 'should handle different login scenarios',
    conditionalSkip: (data) => data.username === '', // Skip empty username tests
  })
  async testLoginWithConditionalSkip({ page }, testCase) {
    await page.goto('/login');
    
    await page.fill('#username', testCase.username);
    await page.fill('#password', testCase.password);
    await page.click('#login-button');
    
    if (testCase.expectSuccess) {
      const welcomeMsg = await page.textContent('.welcome-message');
      expect(welcomeMsg).toBe(testCase.expectedMessage);
    } else {
      const errorMsg = await page.textContent('.error-message');
      expect(errorMsg).toBe(testCase.expectedMessage);
    }
  }
  
  /**
   * Example using a function to generate test data dynamically
   */
  @testWithData(() => {
    // This function can contain any logic to generate test data
    return [
      { username: 'user1', password: 'pass1', expected: 'Welcome User1' },
      { username: 'user2', password: 'pass2', expected: 'Welcome User2' },
      { username: 'admin', password: 'admin123', expected: 'Welcome Admin' },
    ];
  })
  async testWithDynamicData({ page }, data) {
    await page.goto('/login');
    
    await page.fill('#username', data.username);
    await page.fill('#password', data.password);
    await page.click('#login-button');
    
    const message = await page.textContent('.welcome-message');
    expect(message).toBe(data.expected);
  }
}

export { DataDrivenLoginTests };

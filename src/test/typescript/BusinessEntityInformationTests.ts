import { expect } from '@playwright/test'
import { BasePage } from '../../main/typescript/base/BasePage'
import { conditionalTest, testDecorator, testMethod } from '../../main/typescript/helpers/Decorators'

/**
 * BusinessEntityInformationPageActions class that uses the Page Object Model pattern
 * and demonstrates the use of test decorators
 */
export class BusinessEntityInformationPageActions extends BasePage {
  // Locators
  static readonly addPrincipalBtn = '//button[text()="Add Principal"]'
  static readonly firstNameField = '//input[@id="firstName"]'
  static readonly lastNameField = '//input[@id="lastName"]'
  static readonly emailField = '//input[@id="email"]'
  static readonly phoneField = '//input[@id="phone"]'
  static readonly saveBtn = '//button[text()="Save"]'
  static readonly principalTable = '//table[@data-testid="principal-table"]'
  static readonly principalRow = (name) => `//tr[contains(., "${name}")]`
  static readonly deleteBtn = (name) => `//tr[contains(., "${name}")]//button[contains(@class, "delete")]`
  static readonly confirmDeleteBtn = '//button[text()="Confirm Delete"]'
  static readonly successMessage = '//div[contains(@class, "success-message")]'

  /**
   * Adds a new principal to the business entity
   * @param firstName - Principal's first name
   * @param lastName - Principal's last name
   * @param email - Principal's email
   * @param phone - Principal's phone number
   */
  async addPrincipal(firstName, lastName, email, phone) {
    await this.utility.click({ selector: BusinessEntityInformationPageActions.addPrincipalBtn })
    await this.utility.typeText({ selector: BusinessEntityInformationPageActions.firstNameField, text: firstName })
    await this.utility.typeText({ selector: BusinessEntityInformationPageActions.lastNameField, text: lastName })
    await this.utility.typeText({ selector: BusinessEntityInformationPageActions.emailField, text: email })
    await this.utility.typeText({ selector: BusinessEntityInformationPageActions.phoneField, text: phone })
    await this.utility.click({ selector: BusinessEntityInformationPageActions.saveBtn })
    await this.utility.waitForLocator({ selector: BusinessEntityInformationPageActions.successMessage })
  }

  /**
   * Deletes a principal by name
   * @param firstName - Principal's first name to delete
   * @param lastName - Principal's last name to delete
   */
  async deletePrincipal(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`
    await this.utility.click({ selector: BusinessEntityInformationPageActions.deleteBtn(fullName) })
    await this.utility.click({ selector: BusinessEntityInformationPageActions.confirmDeleteBtn })
    await this.utility.waitForLocator({ selector: BusinessEntityInformationPageActions.successMessage })
  }

  /**
   * Checks if a principal exists in the table
   * @param firstName - Principal's first name
   * @param lastName - Principal's last name
   * @returns boolean - Whether the principal exists
   */
  async principalExists(firstName, lastName) {
    const fullName = `${firstName} ${lastName}`
    const locator = this.page.locator(BusinessEntityInformationPageActions.principalRow(fullName))
    return await locator.isVisible()
  }
}

/**
 * Tests for the BusinessEntityInformationPage
 */
export class BusinessEntityInformationTests {
  /**
   * Test for adding a principal
   */
  @testMethod('should add a new principal to the business entity')
  async testAddPrincipal({ page }) {
    // Create page object instance
    const businessPage = new BusinessEntityInformationPageActions(page)
    
    // Test data
    const firstName = 'John'
    const lastName = 'Doe'
    const email = 'john.doe@example.com'
    const phone = '123-456-7890'
    
    // Navigate to the page
    await page.goto('/business-entity')
    
    // Add principal
    await businessPage.addPrincipal(firstName, lastName, email, phone)
    
    // Verify principal was added
    const exists = await businessPage.principalExists(firstName, lastName)
    expect(exists).toBe(true)
  }
  
  /**
   * Test for deleting a principal
   */
  @conditionalTest({
    title: 'should delete a principal from the business entity',
    tags: ['delete', 'business-entity'],
  })
  async testDeletePrincipal({ page }) {
    // Create page object instance
    const businessPage = new BusinessEntityInformationPageActions(page)
    
    // Test data
    const firstName = 'Jane'
    const lastName = 'Smith'
    const email = 'jane.smith@example.com'
    const phone = '987-654-3210'
    
    // Navigate to the page
    await page.goto('/business-entity')
    
    // First add the principal
    await businessPage.addPrincipal(firstName, lastName, email, phone)
    
    // Verify principal was added
    let exists = await businessPage.principalExists(firstName, lastName)
    expect(exists).toBe(true)
    
    // Delete the principal
    await businessPage.deletePrincipal(firstName, lastName)
    
    // Verify principal was deleted
    exists = await businessPage.principalExists(firstName, lastName)
    expect(exists).toBe(false)
  }
  
  /**
   * Test that verifies validation errors
   */
  @testDecorator('should show validation errors for missing fields')
  async testValidationErrors({ page }) {
    // Create page object instance
    const businessPage = new BusinessEntityInformationPageActions(page)
    
    // Navigate to the page
    await page.goto('/business-entity')
    
    // Click add principal button
    await businessPage.utility.click({ selector: BusinessEntityInformationPageActions.addPrincipalBtn })
    
    // Try to save without filling any fields
    await businessPage.utility.click({ selector: BusinessEntityInformationPageActions.saveBtn })
    
    // Verify error messages
    await expect(page.locator('text=First Name is required')).toBeVisible()
    await expect(page.locator('text=Last Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Phone is required')).toBeVisible()
  }
}

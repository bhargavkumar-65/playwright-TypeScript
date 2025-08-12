import { expect } from '@playwright/test'

import { Test } from '../../main/typescript/helpers/Decorators'
import { BusinessEntityInformationPageActions } from '../../main/typescript/pages/actions/BusinessEntityInformationPageActions'

// Test data for basic entity registration
const BUSINESS_DATA = [
    {
        businessName: 'ABC Corporation',
        businessType: 'Corporation',
        taxId: '123456789',
        dateFormed: '2020-01-01',
        stateFormed: 'California',
        countryFormed: 'United States',
        expectedResult: true,
    },
    {
        businessName: 'XYZ LLC',
        businessType: 'Limited Liability Company',
        taxId: '987654321',
        dateFormed: '2022-03-15',
        stateFormed: 'New York',
        countryFormed: 'United States',
        expectedResult: true,
    },
]

/**
 * Tests for Business Entity Registration flow
 * Demonstrates the unified @Test decorator
 */
export class BusinessEntityRegistrationTests {
    /**
     * Simple test using the single @Test decorator without data
     */
    @Test('should display business entity form')
    async verifyBusinessEntityForm({ page }) {
        // Create page object
        const businessEntityPage = new BusinessEntityInformationPageActions(page)
        
        // Navigate to registration page
        await page.goto('/business-entity-registration')
        
        // Verify form elements are visible
        const businessNameField = page.locator(BusinessEntityInformationPageActions.businessNameField)
        await expect(businessNameField).toBeVisible()
        
        const businessTypeDropdown = page.locator(BusinessEntityInformationPageActions.businessTypeDropdown)
        await expect(businessTypeDropdown).toBeVisible()
        
        const addPrincipalBtn = page.locator(BusinessEntityInformationPageActions.addPrincipalBtn)
        await expect(addPrincipalBtn).toBeVisible()
    }
    
    /**
     * Test with metadata using the @Test decorator
     */
    @Test({
        title: 'should validate required fields',
        description: 'Verifies that form validation works for required fields',
        testCaseId: 'BE-001',
        tags: ['validation', 'business-entity'],
    })
    async validateRequiredFields({ page }) {
        // Create page object
        const businessEntityPage = new BusinessEntityInformationPageActions(page)
        
        // Navigate to registration page
        await page.goto('/business-entity-registration')
        
        // Try to submit without filling required fields
        await businessEntityPage.saveAndContinue()
        
        // Verify error messages are displayed
        const errorMessage = page.locator(BusinessEntityInformationPageActions.errorMessage)
        await expect(errorMessage).toBeVisible()
        await expect(errorMessage).toContainText('Please fill all required fields')
    }
    
    /**
     * Data-driven test using the @Test decorator with data parameter
     */
    @Test({
        title: 'should register business entity with valid information',
        testCaseId: 'BE-002',
        data: BUSINESS_DATA,
    })
    async registerBusinessEntity({ page }, data) {
        // Create page object
        const businessEntityPage = new BusinessEntityInformationPageActions(page)
        
        // Navigate to registration page
        await page.goto('/business-entity-registration')
        
        // Fill business entity information
        await businessEntityPage.fillBusinessEntityInfo({
            businessName: data.businessName,
            businessType: data.businessType,
            taxIdNumber: data.taxId,
            dateOfFormation: data.dateFormed,
            stateOfFormation: data.stateFormed,
            countryOfFormation: data.countryFormed,
        })
        
        // Fill address information
        await businessEntityPage.fillBusinessAddress({
            addressLine1: '123 Main St',
            city: 'Silicon Valley',
            stateProvince: 'CA',
            postalCode: '94043',
            country: 'United States',
        })
        
        // Add a principal
        await businessEntityPage.addPrincipal({
            firstName: 'John',
            lastName: 'Doe',
            title: 'CEO',
            ownershipPercentage: '100',
        })
        
        // Submit the form
        await businessEntityPage.saveAndContinue()
        
        // Verify success message
        const successMessage = page.locator(BusinessEntityInformationPageActions.successMessage)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toContainText('Business entity information saved successfully')
    }
    
    /**
     * Conditional test using the @Test decorator with skip option
     */
    @Test({
        title: 'should save business entity information as draft',
        skip: () => process.env.SKIP_DRAFT_TESTS === 'true',
    })
    async saveBusinessEntityAsDraft({ page }) {
        // Create page object
        const businessEntityPage = new BusinessEntityInformationPageActions(page)
        
        // Navigate to registration page
        await page.goto('/business-entity-registration')
        
        // Fill minimal information
        await businessEntityPage.fillBusinessEntityInfo({
            businessName: 'Draft Business',
            businessType: 'Corporation',
            taxIdNumber: '555555555',
            dateOfFormation: '2023-01-01',
            stateOfFormation: 'Delaware',
            countryOfFormation: 'United States',
        })
        
        // Save as draft
        await businessEntityPage.saveAsDraft()
        
        // Verify draft saved
        const successMessage = page.locator(BusinessEntityInformationPageActions.successMessage)
        await expect(successMessage).toBeVisible()
        await expect(successMessage).toContainText('Draft saved')
    }
    
    /**
     * Test with timeout and retries using the @Test decorator
     */
    @Test({
        title: 'should handle large principal data sets',
        timeout: 120000,
        retries: 2,
    })
    async handleLargePrincipalDataSets({ page }) {
        // Create page object
        const businessEntityPage = new BusinessEntityInformationPageActions(page)
        
        // Navigate to registration page
        await page.goto('/business-entity-registration')
        
        // Fill basic business information
        await businessEntityPage.fillBusinessEntityInfo({
            businessName: 'Multi-Principal Corp',
            businessType: 'Corporation',
            taxIdNumber: '123456789',
            dateOfFormation: '2022-05-15',
            stateOfFormation: 'Nevada',
            countryOfFormation: 'United States',
        })
        
        // Add multiple principals
        for (let i = 0; i < 5; i++) {
            await businessEntityPage.addPrincipal({
                firstName: `Principal${i}`,
                lastName: 'Test',
                title: `Director${i}`,
                ownershipPercentage: `${20}`,
            })
        }
        
        // Verify all principals were added
        const principalCount = await page.locator('//div[contains(@data-test, "principal-")]').count()
        expect(principalCount).toBe(5)
        
        // Remove a principal
        await businessEntityPage.removePrincipal({ index: 2 })
        
        // Verify principal was removed
        const updatedPrincipalCount = await page.locator('//div[contains(@data-test, "principal-")]').count()
        expect(updatedPrincipalCount).toBe(4)
    }
}

import { BasePage } from '../../base/BasePage'
import { step } from '../../helpers/Decorators'
import log from '../../helpers/log'

/**
 * Page Actions for the Business Entity Information page
 * Contains selectors and methods for interacting with the Business Entity Information page
 */
export class BusinessEntityInformationPageActions extends BasePage {
    // Selectors for Business Entity Information form
    static businessNameField = '//input[@data-test="business-name"]'
    static businessTypeDropdown = '//select[@data-test="business-type"]'
    static taxIdNumberField = '//input[@data-test="tax-id-number"]'
    static dateOfFormationField = '//input[@data-test="date-of-formation"]'
    static stateOfFormationDropdown = '//select[@data-test="state-of-formation"]'
    static countryOfFormationDropdown = '//select[@data-test="country-of-formation"]'
    
    // Address fields
    static addressLine1Field = '//input[@data-test="address-line1"]'
    static addressLine2Field = '//input[@data-test="address-line2"]'
    static cityField = '//input[@data-test="city"]'
    static stateProvinceDropdown = '//select[@data-test="state-province"]'
    static postalCodeField = '//input[@data-test="postal-code"]'
    static countryDropdown = '//select[@data-test="country"]'
    
    // Contact information
    static emailField = '//input[@data-test="email"]'
    static phoneNumberField = '//input[@data-test="phone-number"]'
    static websiteField = '//input[@data-test="website"]'
    
    // Principal information
    static addPrincipalBtn = '//button[@data-test="add-principal"]'
    static principalFirstNameField = (index: number) => `//div[@data-test="principal-${index}"]//input[@data-test="first-name"]`
    static principalLastNameField = (index: number) => `//div[@data-test="principal-${index}"]//input[@data-test="last-name"]`
    static principalTitleField = (index: number) => `//div[@data-test="principal-${index}"]//input[@data-test="title"]`
    static principalOwnershipField = (index: number) => `//div[@data-test="principal-${index}"]//input[@data-test="ownership-percentage"]`
    static removePrincipalBtn = (index: number) => `//div[@data-test="principal-${index}"]//button[@data-test="remove-principal"]`
    
    // Form navigation and submission
    static saveAndContinueBtn = '//button[@data-test="save-continue"]'
    static saveAsDraftBtn = '//button[@data-test="save-draft"]'
    static cancelBtn = '//button[@data-test="cancel"]'
    static successMessage = '//div[@data-test="success-message"]'
    static errorMessage = '//div[@data-test="error-message"]'

    /**
     * Fill in basic business entity information
     * @param businessName The legal name of the business
     * @param businessType The type of business entity (e.g., LLC, Corporation)
     * @param taxIdNumber The tax identification number (EIN)
     * @param dateOfFormation The date the business was formed (YYYY-MM-DD)
     * @param stateOfFormation The state where business was formed
     * @param countryOfFormation The country where business was formed
     */
    @step('Fill basic business entity information')
    async fillBusinessEntityInfo(args: {
        businessName: string
        businessType: string
        taxIdNumber: string
        dateOfFormation: string
        stateOfFormation: string
        countryOfFormation: string
    }) {
        try {
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.businessNameField,
                text: args.businessName,
            })
            
            await this.utility.selectDropDownValue({
                selector: BusinessEntityInformationPageActions.businessTypeDropdown,
                text: args.businessType,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.taxIdNumberField,
                text: args.taxIdNumber,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.dateOfFormationField,
                text: args.dateOfFormation,
            })
            
            await this.utility.selectDropDownValue({
                selector: BusinessEntityInformationPageActions.stateOfFormationDropdown,
                text: args.stateOfFormation,
            })
            
            await this.utility.selectDropDownValue({
                selector: BusinessEntityInformationPageActions.countryOfFormationDropdown,
                text: args.countryOfFormation,
            })
            
            // Wait for page to process inputs
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error filling business entity information: ${error}`)
            throw new Error(`Failed to fill business entity information: ${error}`)
        }
    }

    /**
     * Fill in the business address information
     * @param addressLine1 The street address line 1
     * @param addressLine2 The street address line 2 (optional)
     * @param city The city name
     * @param stateProvince The state or province
     * @param postalCode The postal or ZIP code
     * @param country The country
     */
    @step('Fill business address information')
    async fillBusinessAddress(args: {
        addressLine1: string
        addressLine2?: string
        city: string
        stateProvince: string
        postalCode: string
        country: string
    }) {
        try {
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.addressLine1Field,
                text: args.addressLine1,
            })
            
            if (args.addressLine2) {
                await this.utility.typeText({
                    selector: BusinessEntityInformationPageActions.addressLine2Field,
                    text: args.addressLine2,
                })
            }
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.cityField,
                text: args.city,
            })
            
            await this.utility.selectDropDownValue({
                selector: BusinessEntityInformationPageActions.stateProvinceDropdown,
                text: args.stateProvince,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.postalCodeField,
                text: args.postalCode,
            })
            
            await this.utility.selectDropDownValue({
                selector: BusinessEntityInformationPageActions.countryDropdown,
                text: args.country,
            })
            
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error filling business address information: ${error}`)
            throw new Error(`Failed to fill business address information: ${error}`)
        }
    }

    /**
     * Fill in contact information for the business
     * @param email The business email address
     * @param phoneNumber The business phone number
     * @param website The business website (optional)
     */
    @step('Fill business contact information')
    async fillContactInfo(args: {
        email: string
        phoneNumber: string
        website?: string
    }) {
        try {
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.emailField,
                text: args.email,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.phoneNumberField,
                text: args.phoneNumber,
            })
            
            if (args.website) {
                await this.utility.typeText({
                    selector: BusinessEntityInformationPageActions.websiteField,
                    text: args.website,
                })
            }
            
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error filling contact information: ${error}`)
            throw new Error(`Failed to fill contact information: ${error}`)
        }
    }

    /**
     * Add a principal (owner/officer) to the business entity
     * @param firstName The first name of the principal
     * @param lastName The last name of the principal
     * @param title The title/position of the principal
     * @param ownershipPercentage The ownership percentage (0-100)
     */
    @step('Add principal to business entity')
    async addPrincipal(args: {
        firstName: string
        lastName: string
        title: string
        ownershipPercentage: string
    }) {
        try {
            // Click the add principal button
            await this.utility.click({
                selector: BusinessEntityInformationPageActions.addPrincipalBtn,
            })
            
            // Get the current count of principals to determine the index
            const principalElements = await this.page.locator('//div[contains(@data-test, "principal-")]').count()
            const index = principalElements - 1
            
            // Fill in the principal information
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.principalFirstNameField(index),
                text: args.firstName,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.principalLastNameField(index),
                text: args.lastName,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.principalTitleField(index),
                text: args.title,
            })
            
            await this.utility.typeText({
                selector: BusinessEntityInformationPageActions.principalOwnershipField(index),
                text: args.ownershipPercentage,
            })
            
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error adding principal: ${error}`)
            throw new Error(`Failed to add principal: ${error}`)
        }
    }

    /**
     * Remove a principal by index
     * @param index The index of the principal to remove (0-based)
     */
    @step('Remove principal')
    async removePrincipal(args: { index: number }) {
        try {
            await this.utility.click({
                selector: BusinessEntityInformationPageActions.removePrincipalBtn(args.index),
            })
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error removing principal at index ${args.index}: ${error}`)
            throw new Error(`Failed to remove principal at index ${args.index}: ${error}`)
        }
    }

    /**
     * Submit the business entity form by clicking Save and Continue
     */
    @step('Save and continue business entity information')
    async saveAndContinue() {
        try {
            await this.utility.click({
                selector: BusinessEntityInformationPageActions.saveAndContinueBtn,
            })
            
            // Wait for success message to appear
            await this.utility.waitForLocator({
                selector: BusinessEntityInformationPageActions.successMessage,
                timeOut: 60000,
            })
            
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error saving business entity information: ${error}`)
            throw new Error(`Failed to save business entity information: ${error}`)
        }
    }

    /**
     * Save the form as draft
     */
    @step('Save business entity information as draft')
    async saveAsDraft() {
        try {
            await this.utility.click({
                selector: BusinessEntityInformationPageActions.saveAsDraftBtn,
            })
            
            // Wait for success message to appear
            await this.utility.waitForLocator({
                selector: BusinessEntityInformationPageActions.successMessage,
                timeOut: 30000,
            })
            
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error saving business entity as draft: ${error}`)
            throw new Error(`Failed to save business entity as draft: ${error}`)
        }
    }

    /**
     * Cancel the form entry
     */
    @step('Cancel business entity form')
    async cancelForm() {
        try {
            await this.utility.click({
                selector: BusinessEntityInformationPageActions.cancelBtn,
            })
            await this.utility.waitUntilPageIsLoaded()
        } catch (error) {
            log.error(`Error canceling business entity form: ${error}`)
            throw new Error(`Failed to cancel business entity form: ${error}`)
        }
    }

    /**
     * Complete the full business entity registration form with all information
     * @param businessData Complete business entity data object
     */
    @step('Complete full business entity registration')
    async completeBusinessEntityRegistration(args: {
        businessInfo: {
            businessName: string
            businessType: string
            taxIdNumber: string
            dateOfFormation: string
            stateOfFormation: string
            countryOfFormation: string
        }
        address: {
            addressLine1: string
            addressLine2?: string
            city: string
            stateProvince: string
            postalCode: string
            country: string
        }
        contact: {
            email: string
            phoneNumber: string
            website?: string
        }
        principals: Array<{
            firstName: string
            lastName: string
            title: string
            ownershipPercentage: string
        }>
    }) {
        try {
            // Fill in the business information
            await this.fillBusinessEntityInfo(args.businessInfo)
            
            // Fill in the address
            await this.fillBusinessAddress(args.address)
            
            // Fill in contact information
            await this.fillContactInfo(args.contact)
            
            // Add all principals
            for (const principal of args.principals) {
                await this.addPrincipal(principal)
            }
            
            // Submit the form
            await this.saveAndContinue()
            
            // Verify success
            const isSuccess = await this.page.locator(BusinessEntityInformationPageActions.successMessage).isVisible()
            if (!isSuccess) {
                throw new Error('Business entity registration was not successful')
            }
            
            return isSuccess
        } catch (error) {
            log.error(`Error completing business entity registration: ${error}`)
            throw new Error(`Failed to complete business entity registration: ${error}`)
        }
    }
}

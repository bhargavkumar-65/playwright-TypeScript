import { expect } from '@playwright/test'

import { test } from '../../../main/typescript/base/customFixtures'
import {GET_PetByStatusSchema} from '../../../main/typescript/helpers/API/Schemas/GET_PetByStatus'
import { createdPetWithIdData, createPetData, deleteTestData, negativePetStatusData, petStatusData, updatePetData } from '../../../main/typescript/helpers/API/testData'
import { createPetRequestBody } from '../../../main/typescript/helpers/API/validRequestBodies'

test.describe.serial('Positive Tests (Status Code 2xx)', () => {
    createPetData.forEach(petData => {
        test(`POST Add New Pet ${petData.name}- Multiple pets with different statuses`, async ({ request }) => {
            const response = await request.post(`/v2/pet`, {
                data: createPetRequestBody(petData.name, petData.id, petData.status),
            })

            expect(response.status()).toBe(200)
            expect(response.headers()['content-type']).toContain('application/json')

            const responseBody = await response.json()
            expect(responseBody.status).toBe(petData.status)
            expect(responseBody.id).toBe(petData.id)
            expect(responseBody.name).toBe(petData.name)
        })
    })

    updatePetData.forEach(updateData => {
        test(`PUT Update Pet ${updateData.name} - Update existing pets with new status`, async ({ request }) => {
            const response = await request.put(`/v2/pet`, {
                data: createPetRequestBody(updateData.name, updateData.id, updateData.status),
            })

            expect(response.status()).toBe(200)
            expect(response.headers()['content-type']).toContain('application/json')

            const responseBody = await response.json()
            expect(responseBody.status).toBe(updateData.status)
            expect(responseBody.id).toBe(updateData.id)
            expect(responseBody.name).toBe(updateData.name)
        })
    })

    petStatusData.forEach(status => {
        test(`GET All Pets By Status: ${status} - Valid statuses`, async ({ request }) => {
            let petID: number | null = null

            const response = await request.get(`/v2/pet/findByStatus?status=${status}`)

            expect(response.status()).toBe(200)
            expect(response.headers()['content-type']).toContain('application/json')
            // Validate the response against the schema
            expect(()=> GET_PetByStatusSchema.parse(response.json())).not.toThrow()

            const pets = await response.json()
            expect(Array.isArray(pets)).toBeTruthy()
            expect(pets.length).toBeGreaterThan(0)

            // Verify any of the returned pets have the correct status
            const validPet = pets.find((pet: any) => pet.status === status && pet.id && pet.name && pet.photoUrls && pet.category && pet.category.name)

            expect(validPet).toBeDefined()

            // Store a pet ID for later use
            if (!petID && pets.length > 0) {
                petID = pets[0].id
            }
        })
    })

    test('GET Pet By ID - Retrieve existing pet', async ({ request }) => {
        // First create a pet
        const testPet = createPetData[0]
        await request.post(`/v2/pet`, {
            data: createPetRequestBody(testPet.name, testPet.id, testPet.status),
        })

        // Then retrieve it
        const response = await request.get(`/v2/pet/${testPet.id}`)

        expect(response.status()).toBe(200)
        expect(response.headers()['content-type']).toContain('application/json')

        const pet = await response.json()
        expect(pet.id).toBe(testPet.id)
        expect(pet.name).toBe(testPet.name)
        expect(pet.status).toBe(testPet.status)
    })

    createdPetWithIdData.forEach(data => {
        test(`POST Pet By ID: ${data.id} - Update pet with form data`, async ({ request }) => {
            // First create the pet
            await request.post(`/v2/pet`, {
                data: createPetRequestBody(data.name, data.id, 'available'),
            })

            // Then update with form data
            const formData = new URLSearchParams()
            formData.append('name', data.name)
            formData.append('status', data.status)

            const response = await request.post(`/v2/pet/${data.id}`, {
                data: formData.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })

            expect(response.status()).toBe(200)
            expect(response.headers()['content-type']).toContain('application/json')

            const responseBody = await response.json()
            expect(responseBody.message).toBeDefined()
        })
    })

    deleteTestData.forEach(petId => {
        test(`DELETE Pet By ID: ${petId} - Delete existing pets and verify deletion`, async ({ request }) => {
            // First create the pet
            await request.post(`/v2/pet`, {
                data: createPetRequestBody(`Pet${petId}`, petId, 'available'),
            })

            // Delete the pet
            const deleteResponse = await request.delete(`/v2/pet/${petId}`)
            expect(deleteResponse.status()).toBe(200)
            expect(deleteResponse.headers()['content-type']).toContain('application/json')

            // Verify deletion by trying to get the pet (should return 404)
            const getResponse = await request.get(`/v2/pet/${petId}`)
            expect(getResponse.status()).toBe(404)
        })
    })
})

test.describe('Negative Tests (Status Code 4xx)', () => {
    test(`POST Add New Pet - Invalid request body should return 405`, async ({ request }) => {
        const response = await request.post(`/v2/pet`, {
            data: '',
        })

        expect(response.status()).toBe(405)
    })

    negativePetStatusData.forEach(status => {
        test(`GET Pets By Status: ${status} - Invalid status values should return empty array`, async ({ request }) => {
            const response = await request.get(`/v2/pet/findByStatus?status=${status}`)

            expect(response.status()).toBe(200)

            const pets = await response.json()
            expect(Array.isArray(pets)).toBeTruthy()
            expect(pets.length).toBe(0)
        })
    })

    test(`GET Pet By ID - Non-existent pet should return 404`, async ({ request, utility }) => {
        const randomId = utility.getRandomNumber(10)

        const response = await request.get(`/v2/pet/${randomId}`)
        expect(response.status()).toBe(404)
    })

    test(`PUT Update Non-Existent Pet - Should return 200 (creates new pet)`, async ({ request }) => {
        const response = await request.put(`/v2/pet`, {
            data: createPetRequestBody('NonExistentPet', 0, 'sold'),
        })

        expect(response.status()).toBe(200)
        console.log(`Update non-existent pet response code: ${response.status()}`)
    })
})

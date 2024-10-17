import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'

async function globalSetup(_config: FullConfig) {
    // if (process.env.test_user) {
    //     dotenv.config({
    //         path: `../../resources/env/.env.${process.env.test_user}`,
    //         override: true,
    //     })
    // }
}
export default globalSetup

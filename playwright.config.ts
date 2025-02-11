import type { devices, PlaywrightTestConfig } from '@playwright/test'
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./src/main/typescript/helpers/global-setup.ts'),
    testDir: './src/test/typescript',
    testMatch: '/Naukari*.ts',
    /* Maximum time one test can run for. */
    timeout: 1200000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['line'],
        [
            'allure-playwright',
            {
                detail: true,
                outputFolder: 'allure-results',
                suiteTitle: false,
            },
        ],
        ['junit', { outputFile: 'results1.xml' }],
        ['html', { open: 'never' }],
        [process.env.CI === 'true' ? 'blob' : 'html', { open: 'never' }],
        ['./src/main/typescript/helpers/CustomReporter'], // Adding custom AzureDevopsReporter
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        screenshot: 'on',
        trace: 'on',
        acceptDownloads: true,
        permissions: ['clipboard-read', 'clipboard-write'],
        video: 'on',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                channel: 'chromium',
                acceptDownloads: true,
                headless: false,
                viewport: null,
                launchOptions: {
                    args: ['--start-maximized'],
                },
            },
        },
    ],
}

export default config
export const outputLocation = './logs/Playwright'
export const logLevelTest = 'INFO'

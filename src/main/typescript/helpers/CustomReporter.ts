// reporters/AzureDevopsReporter.ts
import { FullConfig, Reporter, Suite, TestCase, TestError, TestResult, TestStatus, TestStep } from '@playwright/test/reporter'

import log from './log'
const fs = require('fs')

export default class CustomReporterConfig implements Reporter {
    onTestBegin(test: TestCase): void {
        log.info(`-------------------------Test ${test.title} started---------------------`)
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const testTitle = test.title
        const testStatus = result.status.toLowerCase()
        const elapsedTime = (result.duration / 1000).toFixed(2)
        log.info('----------------------------------------------------------------------------')
        log.info('                              TEST SUMMARY                                  ')
        log.info('----------------------------------------------------------------------------')
        log.info(`Test : ${testTitle}`)
        log.info(`Status : ${testStatus}`)
        log.info(`Test Outcome: ${test.outcome()}`)
        log.info(`Time Elapsed: ${elapsedTime} sec`)
        log.info('----------------------------------------------------------------------------')

        // if (process.env.UPDATETESTRESULTS === 'true') {
        const TestCases: any = []
        const regex = /\[(\d+)\]/g
        let extractedTestcaseID
        while ((extractedTestcaseID = regex.exec(test.title)) !== null) {
            TestCases.push(parseInt(extractedTestcaseID[1], 10))
            log.info(`Parsed Cases : ${parseInt(extractedTestcaseID[1], 10)}`)
        }
        log.info(`Test Cases : ${TestCases}`)
        // iterate for each test case

        TestCases.forEach((testCase, index) => {
            log.info(`Processing index ${index}: testCase ID ${testCase}`)
            console.log(`Updating test with case ID ${testCase} in Azure DevOps`)
        })
    }
    // }

    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            log.info(`---------------Executing Step : ${step.title} --------------------`)
        }
    }

    onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
        if (step.category === 'test.step') {
            log.info(`------------------- Step ${step.title} Completed -------------------`)
            log.info(`Time Elapsed: ${(step.duration / 1000).toFixed(2)} sec`)
        }
    }

    onError(error: TestError): void {
        log.error(error.message)
    }
}

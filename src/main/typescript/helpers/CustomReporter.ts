/* eslint-disable quote-props */
import { request } from '@playwright/test'
import { FullConfig, Reporter, Suite, TestCase, TestError, TestResult, TestStatus, TestStep } from '@playwright/test/reporter'
const envConfig = require('../../resources/env/azDevOps.json')

import log from './log'
export default class CustomReporterConfig implements Reporter {
readonly ENV = envConfig['AzureDevOps']
  private readonly AZ_DEVOPS_USERNAME = this.ENV.AZ_DEVOPS_USERNAME
  private readonly AZ_DEVOPS_PAT_TOKEN = this.ENV.AZ_DEVOPS_PAT_TOKEN
  private readonly AZ_DEVOPS_BASE_URL= this.ENV.AZ_DEVOPS_BASE_URL
  private readonly AZ_DEVOPS_PROJECT= this.ENV.AZ_DEVOPS_PROJECT
  UpdateTestExecutionStatus:Boolean = false
    async onTestBegin(test: TestCase): Promise<void> {
        log.info(`-------------------------Test ${test.title} started---------------------`)
    }

    async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
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

        const TestCases: number[] = []
        const regex = /\[(\d+)\]/g
        let extractedTestcaseID
        while ((extractedTestcaseID = regex.exec(test.title)) !== null) {
            TestCases.push(parseInt(extractedTestcaseID[1], 10))
            log.info(`Parsed Cases : ${parseInt(extractedTestcaseID[1], 10)}`)
        }

        log.info(`Test Cases : ${TestCases}`)

        const outcome = result.status === 'passed' ? 'Passed' : 'Failed'

        // Iterate over each testCaseID extracted from test title
        for (const testCaseID of TestCases) {
            log.info(`Processing test case ID: ${testCaseID}`)
            if(this.UpdateTestExecutionStatus) {
                log.info(`Fetching test plans and suites for case ID ${testCaseID} in Azure DevOps`)
                log.info(`Updating test point outcome to "${outcome}" for test case ID ${testCaseID} in Azure DevOps`)
             await this.getTestPlanSuites(testCaseID,outcome)
            }
        }

        log.info('----------------------------------------------------------------------------')

    }

    async onStepBegin(test: TestCase, result: TestResult, step: TestStep): Promise<void> {
        if (step.category === 'test.step') {
            log.info(`---------------Executing Step : ${step.title} --------------------`)
        }
    }

    async onStepEnd(test: TestCase, result: TestResult, step: TestStep): Promise<void> {
        if (step.category === 'test.step') {
            log.info(`------------------- Step ${step.title} Completed -------------------`)
            log.info(`Time Elapsed: ${(step.duration / 1000).toFixed(2)} sec`)
        }
    }

    async onError(error: TestError): Promise<void> {
        log.error(error.message)
    }

  async getTestPlanSuites(testCaseID: number, outcome: string): Promise<void> {
  log.info(`username: ${this.AZ_DEVOPS_USERNAME}`)
  log.info(`pat token: ${this.AZ_DEVOPS_PAT_TOKEN}`)
  log.info(`base url: ${this.AZ_DEVOPS_BASE_URL}`)
  log.info(`project: ${this.AZ_DEVOPS_PROJECT}`)
  const apiContext = await request.newContext({
    baseURL: this.AZ_DEVOPS_BASE_URL,
    extraHTTPHeaders: {
      'Authorization': `Basic ${Buffer.from(`${this.AZ_DEVOPS_USERNAME}:${this.AZ_DEVOPS_PAT_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  })

  const response = await apiContext.get(`/_apis/testplan/suites?testCaseId=${testCaseID}&api-version=7.1`)
  if (response.ok()) {
    const data = await response.json()
    
    // Extract the count and log the number of test plans
    const count = data.count
    console.log(`This testcase is in ${count} testplan(s).`)
    
    // Loop through the value array to get TestSuiteID and TestplanID
    data.value.forEach(async (item: any) => {
      const TestSuiteID = item.id
      const TestplanID = item.plan.id
      log.info(`TestSuiteID: ${TestSuiteID}, TestplanID: ${TestplanID}`)
     await this.getTestPoint(testCaseID, TestplanID, TestSuiteID, outcome)
    })

    return data
  } 
    log.error(`Failed to fetch test plan suites: ${response.status()} ${response.statusText()}`)
    return null
  
}

    async getTestPoint(testCaseID: number, TestplanID: number, TestSuiteID: number, outcome: string): Promise<void> {
      
        const apiContext = await request.newContext({
          baseURL: this.AZ_DEVOPS_BASE_URL,
          extraHTTPHeaders: {
            'Authorization': `Basic ${Buffer.from(`${this.AZ_DEVOPS_USERNAME}:${this.AZ_DEVOPS_PAT_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        })
      
        const endpoint = `/${this.AZ_DEVOPS_PROJECT}/_apis/testplan/Plans/${TestplanID}/Suites/${TestSuiteID}/TestPoint?api-version=6.0-preview.2&testCaseId=${testCaseID}`
        const response = await apiContext.get(endpoint)
        
        if (response.ok()) {
          const data = await response.json()
      
          // Extract TestPointID from the response data
          const TestPointID = data.value?.[0]?.id
          log.info(`TestPointID: ${TestPointID}`)
      
          // Call updateTestPointOutcome with the extracted TestPointID and outcome
          if (TestPointID) {
            await this.updateTestPointOutcome(TestplanID, TestSuiteID, TestPointID, outcome)
          }
      
          return data
        } 
          log.error(`Failed to fetch test points: ${response.status()} ${response.statusText()}`)
          return null
        
    }

    async updateTestPointOutcome(testPlanID: number, testSuiteID: number, testPointID: number, outcome: string): Promise<void> {
        const apiContext = await request.newContext({
          baseURL: this.AZ_DEVOPS_BASE_URL,
          extraHTTPHeaders: {
            'Authorization': `Basic ${Buffer.from(`${this.AZ_DEVOPS_USERNAME}:${this.AZ_DEVOPS_PAT_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        })
      
        const endpoint = `/${this.AZ_DEVOPS_PROJECT}/_apis/testplan/Plans/${testPlanID}/Suites/${testSuiteID}/TestPoint?api-version=7.1-preview.2`
      
        const body = [
          {
            "id": testPointID,
            "results": {
              "outcome": outcome
            }
          }
        ]
      
        const response = await apiContext.patch(endpoint, { data: body })
      
        if (response.ok()) {
          log.info(`TestPointID ${testPointID} outcome updated to "${outcome}" successfully.`)
        } else {
          log.error(`Failed to update TestPoint outcome: ${response.status()} ${response.statusText()}`)
        }
    }


}
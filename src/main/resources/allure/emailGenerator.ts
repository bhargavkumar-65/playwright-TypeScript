import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

class EmailGenerator {

    private mainHtml = `<html>

    <head>
        <title>Execution Report</title>
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet">
    </head>
    
    <body class="em_body" style="margin:0px; padding:0px;" bgcolor="#efefef">
        <table class="em_full_wrap" valign="top" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#efefef"
            align="center">
            <tbody>
                <tr>
                    <td valign="top" align="center">
                        <table class="em_main_table" style="width:700px;" width="700" cellspacing="0" cellpadding="0"
                            border="0" align="center">
                            <!--Header section-->
                            <tbody>
                                <tr>
                                    <td style="padding:15px;" class="em_padd" valign="top" bgcolor="#f6f7f8" align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tbody>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:20px; line-height:15px; color:#160d21;"
                                                        valign="top" align="center">Automated UI Tests Execution Report</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr id="complete">
                                    <td style="padding:35px 70px 30px;" class="em_padd" valign="top" bgcolor="#0d1121"
                                        align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tbody>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:18px; line-height:30px; color:#f4f807;"
                                                        valign="top" align="center">Automation Test Run is complete for
                                                        <span id="appName"></span>
                                                    </td>
                                                </tr>
    
                                                <tr>
                                                    <td height="15" align="center">
                                                        <span style='font-size:60px;'>&#9989;</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size:0px; line-height:0px; height:15px;" height="15">
                                                        &nbsp;</td>
                                                </tr>
    
                                                <tr id="testDetails">
                                                    <td align="center">
                                                        <div
                                                            style="font-family:'Open Sans', Arial, sans-serif; font-size:14px; line-height:22px; color:#4a9fff; letter-spacing:2px;">
                                                            <h3>
                                                                Test Cases: <span id="tcc"
                                                                    style="color:#ffb23e;"></span><br>
                                                                Duration: <span id="dur" style="color:#ffb23e;"></span><br>
                                                                <span>Failed Count: <span id="fc"
                                                                        style="color:rgb(255, 0, 0);"></span></span>
                                                                <span style="color:rgb(255, 255, 255)"> ;</span>
                                                                <span>Skipped: <span id="sc"
                                                                        style="color:rgb(119, 119, 119);"></span></span>
                                                            </h3>
                                                            <h1 style="font-size:30px;color:#ffffff;"> <span
                                                                    id="passedPercent"></span>%
                                                                Passed</h1>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr id="testDetails">
                                                    <td>
                                                        <table align="center">
                                                            <tr>
                                                                <td><span id="passGrph"
                                                                        style="background-color: rgb(004, 128, 31);color:rgb(004, 128, 031)"></span>
                                                                    <span id="failGrph"
                                                                        style="background-color: rgb(241, 12, 12);color: rgb(241, 012, 012)"></span>
                                                                    <span id="skipGrph"
                                                                        style="background-color: rgb(119, 119, 119);color: rgb(119, 119, 119)"></span>
                                                                    <span id="otherGrph"
                                                                        style="background-color: rgb(255, 2, 255);color: rgb(255, 002, 255)"></span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size:0px; line-height:0px; height:15px;" height="15">
                                                        &nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:16px; line-height:22px; color:#07d4f8; letter-spacing:2px; padding-bottom:12px;"
                                                        valign="top" align="center">Please use the below link to view the
                                                        Execution Report</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:16px; line-height:22px; letter-spacing:1px; padding-bottom:12px;"
                                                        valign="top" align="center"> <a id="reportLink"
                                                            style="color:#ffb23e">Report Link</a></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
    
                                <tr id="abandon">
                                    <td style="padding:35px 70px 30px;" class="em_padd" valign="top" bgcolor="#0d1121"
                                        align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tbody>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:18px; line-height:30px; color:#f4f807;"
                                                        valign="top" align="center">Automation Test Execution was aborted
                                                        for
                                                        <span id="appName"></span>
                                                    </td>
                                                </tr>
    
                                                <tr>
                                                    <td height="15" align="center">
                                                        <span style='font-size:60px;'>&#9940;</span>
                                                    </td>
                                                </tr>
    
                                                <tr>
                                                    <td style="font-size:0px; line-height:0px; height:15px;" height="15">
                                                        &nbsp;</td>
                                                </tr>
    
                                                <tr id="testDetails">
                                                    <td align="center">
                                                        <div
                                                            style="font-family:'Open Sans', Arial, sans-serif; font-size:14px; line-height:22px; color:#fa0101; letter-spacing:2px;">
                                                            <h2>
                                                                Reason:
                                                                <br>
                                                                <span id="issue" style="color:#ffffff;font-size:16px;"></span>
                                                                <br>
                                                            </h2>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size:0px; line-height:0px; height:15px;" height="15">
                                                        &nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:16px; line-height:22px; color:#07d4f8; letter-spacing:2px; padding-bottom:12px;"
                                                        valign="top" align="center">Please look into the Test Environment
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
    
                                <tr>
                                    <td style="padding:18px 20px;" class="em_padd" valign="top" bgcolor="#f6f7f8"
                                        align="center">
                                        <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
                                            <tbody>
                                                <tr>
                                                    <td style="font-family:'Open Sans', Arial, sans-serif; font-size:11px; line-height:18px; color:#999999;"
                                                        valign="top" align="center">For any assistance with automation test please connect with Automation Team
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
    
    </html>`

    $main = cheerio.load(this.mainHtml)

    msToHMS = (ms: number) => {
        let seconds = ms / 1000 // 1- Convert to seconds
        const hours = Math.floor(seconds / 3600) // 2- Extract hours: 3,600 seconds in 1 hour

        seconds = seconds % 3600 // seconds remaining after extracting hours

        const minutes = Math.floor(seconds / 60) // 3- Extract minutes: 60 seconds in 1 minute

        seconds = Math.round(seconds % 60)// 4- Keep only seconds not extracted to minutes:

        let myTime = ""
        if (hours > 0) myTime = `${myTime + hours }h `
        if (minutes > 0) myTime = `${myTime + minutes }m `
        if (seconds > 0) myTime = `${myTime + seconds }s`
        return myTime
    }
    longBar = (character: string, length: number) => {
        const myLength = Math.round(length); let mybar = ""
        for (let i = 0; i < myLength; i++) mybar = mybar + character
        return mybar
    }
}

const generator = new EmailGenerator(); let executionSummary; let abandonedText

try {
    if (fs.existsSync(path.resolve('build-js/abandon.log')))
        {abandonedText = fs.readFileSync(path.resolve('build-js/abandon.log')).toString()}
    else
        {executionSummary = JSON.parse(fs.readFileSync(path.resolve('allure-report/widgets/summary.json'), { encoding: "utf8" }))}
}
catch (e) {
    console.log(e)
}

if (process.argv.length > 2) generator.$main('#appName').text(process.argv[2])
if (process.argv.length > 3) generator.$main('#reportLink').attr('href', process.argv[3])

if (!!abandonedText) {
    generator.$main('#issue').text(abandonedText)
    generator.$main('#complete').remove()
}
else if (!!executionSummary && !!executionSummary.statistic) {
    const passedTests = executionSummary.statistic.passed
        const failedTests = executionSummary.statistic.failed
        const totalTests = executionSummary.statistic.total
        const skippedTests = executionSummary.statistic.skipped
        const brokenTests = executionSummary.statistic.broken
        const actualFailCount= failedTests + brokenTests
        const passedPerCent = !!totalTests ? (passedTests / totalTests * 100) : 0
        const failedPercent = !!totalTests ? (actualFailCount / totalTests * 100) : 0
        const skippedPercent = !!totalTests ? (skippedTests / totalTests * 100) : 0
        const otherPercent = !!totalTests ? ((totalTests - (passedTests + skippedTests+actualFailCount)) / totalTests * 100) : 0
    // Updating summary values
    generator.$main('#dur').text(generator.msToHMS(executionSummary.time.duration))// updating Duration of execution;
    generator.$main('#tcc').text(totalTests)// updating total test case count;
    generator.$main('#fc').text(actualFailCount)// updating failed test case count;
    generator.$main('#sc').text(skippedTests)// updating skipped test case count;
    generator.$main('#passedPercent').text(passedPerCent.toFixed(2))// updating passed percent;

    // updating summary graph
    generator.$main('#passGrph').text(generator.longBar('\\', passedPerCent))
    generator.$main('#failGrph').text(generator.longBar('\\', failedPercent))
    generator.$main('#skipGrph').text(generator.longBar('\\', skippedPercent))
    generator.$main('#otherGrph').text(generator.longBar('\\', otherPercent))

    generator.$main('#abandon').remove()
}
else {
    generator.$main('#testDetails').remove()
}

const outputLoc = "emailReport.html"

if (fs.existsSync(outputLoc)) fs.unlinkSync(outputLoc)

fs.writeFileSync(outputLoc, generator.$main.html(), 'utf8')
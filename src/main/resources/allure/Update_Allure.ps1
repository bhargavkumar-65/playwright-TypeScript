param 
(   #Application Details
    [string]$teamProject = "",
    [string]$applicationName = "",
    [string]$appBuildNum = "",
    #Browser Details
    [string]$browserName = "chrome",
    #Build/Release Details
    [string]$buildOrRelease = "release", #inputs:"build" or "release"
    [string]$definitionName = "",
    [string]$buildOrReleaseId = "",
    [string]$buildOrReleaseNumber = "1.1",
    #Host Details
    [string]$reportHost = "",
    [string]$teamFoundationCollectionUri = "https://kognifai.visualstudio.com"
)

$solutionPath = "$PSScriptRoot\..\..\..\..\"
Set-Location $solutionPath

#Creating a temporary folder for saving local data
$tempLoc = $env:TMP + "\allureTmp\$applicationName\$browserName\";
if (!(test-path $tempLoc)) {
    New-Item -ItemType Directory -Force -Path $tempLoc
}

#Creating environment.json file with Environmental details:
$browserVersion = "";
if ($browserName.Length -gt 0) {
    if ($browserName.ToLower().Contains("internet explorer") -or ($browserName.ToLower() -eq "ie")) {
        $browserVersion = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Internet Explorer').svcVersion
    }
    elseif ($browserName.ToLower().Contains('chrome')) {
        $getVersionQuery = Get-ItemProperty 'HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' | Select-Object DisplayName, DisplayVersion | Where-Object {$_.DisplayName -like "*chrome*"}
        $browserVersion = $getVersionQuery.DisplayVersion
    }
    elseif ($browserName.ToLower().Contains('mozilla') -or $browserName.ToLower().Contains('firefox')) {
        $getVersionQuery = Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' | Select-Object DisplayName, DisplayVersion | Where-Object {$_.DisplayName -like "*firefox*"}
        $browserVersion = $getVersionQuery.DisplayVersion
    }
    else {
        $browserVersion = "undefined"
    }
}

if (!!(test-path "$tempLoc\environment.json")) {
    Remove-Item "$tempLoc\environment.json" -Force
}

Write-Output "[{
    `"name`": `"Application Name`",
    `"values`": [`"$applicationName`"]
},
{
    `"name`": `"Application Version`",
    `"values`": [`"$appBuildNum`"]
},
{
    `"name`": `"Browser Name`",
    `"values`": [`"$browserName`"]
},
{
    `"name`": `"Browser Version`",
    `"values`": [`"$browserVersion`"]
}]" > $tempLoc\environment.json

$allureResultPath = "$solutionPath\allure-results";

if (!(test-path $allureResultPath)) {
    New-Item -ItemType Directory -Force -Path $allureResultPath
}
elseif (!!(test-path "$allureResultPath\executor.json")) {
    Remove-Item "$allureResultPath\executor.json" -Force
}

#Getting the actual order of the build after removing the date part
$defaultNum = $buildOrReleaseNumber
$buildOrReleaseNumber = $buildOrReleaseNumber -replace "[^(\d+|.)]", "" #removing Non-numbers
$buildOrReleaseNumber = $buildOrReleaseNumber -replace (get-date).year, "" #removing year
$buildOrReleaseNumber = $buildOrReleaseNumber -replace "\.", "0" #replacing decimal(.)

#Getting the hostname of the report machine
$myHost = If ($reportHost.Length -gt 0) {$reportHost} Else {(Get-WmiObject win32_computersystem).DNSHostName}

#Creating the executor file in allure-results
$buildName = "";
$buildUrl = "";
if ($buildOrRelease.ToLower().IndexOf('build') -gt -1) {
    $buildName = "BuildDef.:$definitionName ::: Build#:$buildOrReleaseNumber"
    $buildUrl = "$teamFoundationCollectionUri/$teamProject/_build?buildId=$buildOrReleaseId"
}
else {
    $buildName = "ReleaseDef.:$definitionName ::: Release#:$buildOrReleaseNumber"
    $buildUrl = "$teamFoundationCollectionUri/$teamProject/_release?releaseId=$buildOrReleaseId"
}

Write-Output "{
    `"buildName`": `"$buildName`",
    `"buildOrder`": `"$buildOrReleaseNumber`",
    `"buildUrl`": `"$([uri]::EscapeUriString($buildUrl))`",
    `"name`": `"VSTS`",
    `"reportName`": `"AllureReport`",
    `"reportUrl`": `"$([uri]::EscapeUriString($myHost + '/' + $defaultNum))`",
    `"type`": `"vsts`",
    `"url`": `"$([uri]::EscapeUriString($myHost))`"
    }" > $allureResultPath\executor.json

Start-Sleep -s 5

#Copying history to allure-results
$sourceRoot = $tempLoc + "\history"
if (test-path $sourceRoot) {
    if (!!(test-path "$allureResultPath\history")) {
        Remove-Item "$allureResultPath\history" -Force -Recurse
    }
    Copy-Item -Path $sourceRoot -Recurse -Destination $allureResultPath -Container
}

#Creating allure report
$buildReport = "allure generate allure-results --clean"
Invoke-Expression $buildReport

#Copying videos to allure-reports
$vidSrc = "$solutionPath\build-js\reports\videos"
$vidDst = "$solutionPath\allure-report"
if (test-path $vidSrc) {
    Copy-Item -Path $vidSrc -Recurse -Destination $vidDst -Container
}

#Copying environment to allure-reports
$envSrc = $tempLoc + "\environment.json"
$envDst = "$solutionPath\allure-report\widgets"
if (test-path $envSrc) {
    Copy-Item -Path $envSrc -Destination $envDst #-Container
}

#Unzipping custom allure files into allure-reports
$envSrc = "$solutionPath\scripts\allureCstm.zip"
$envDst = "$solutionPath\allure-report\"
if (test-path $envSrc) {
    #Copy-Item -Path $envSrc -Destination $envDst -Force
    Expand-Archive $envSrc -DestinationPath $envDst -Force
}

#Copy logs into allure-reports
$logSrc = "$solutionPath\logs\*.log"
$logDst = "$solutionPath\allure-report"
if (test-path $logSrc) {
    Copy-Item -Path $logSrc -Destination $logDst
}

#Copying history to temp location
$histSrc = "$solutionPath\allure-report\history"
$histDest = $tempLoc + "\history"
if (test-path $histSrc) {
    if (!!(test-path "$histDest")) {
        Remove-Item "$histDest" -Force -Recurse
    }
    Copy-Item -Path $histSrc -Recurse -Destination $histDest -Container
}
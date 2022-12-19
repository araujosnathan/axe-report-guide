
import yargs from 'yargs'
import readResultFile ,
    { 
        populateDataToHTML, 
        replaceDataInHTML, 
        saveReport, 
        getAllResultFiles, 
        getMetrics, 
        replaceMetricsInHTML, 
        replaceSummaryInIndex, 
        saveHtml, 
        copyResourcesToReport,
        getSpecNameFromFileName,
        createLateralMenuNavigation
    } from "./src/generate_report.js"

const args = yargs(process.argv.slice(2))
    .option("result", {
        alias: "r",
        describe: "The Axe Result File with Violations"
    })
    .option("output", {
        alias: "o",
        describe: "The Path/Name to save Axe Result Report"
    })
    .demandOption(["result"], "Please specify the Axe Result File path")
    .demandOption(["output"], "Please specify the path where Axe Result Report will be saved")
    .help().argv;

let allData = new Array();

let resultFiles = getAllResultFiles(args.result);
if(resultFiles.includes("FOLDER_NOT_FOUND"))
    throw new Error(`The folder specified: ${args.result} with Axe Result was not found or the path is incorrect.`)

resultFiles.forEach(fileName =>{
    const a11yResults = readResultFile(args.result + "/" + fileName)
    if(a11yResults.includes("FILE_NOT_FOUND"))
        throw new Error(`The file specified: ${args.result} with Axe Result was not found or the path is incorrect.`)
    const dataToReplace = populateDataToHTML(a11yResults);
    dataToReplace.spec = getSpecNameFromFileName(fileName)
    allData.push(dataToReplace);
})

let metrics = getMetrics(allData);
let newIndexHtml = replaceMetricsInHTML(metrics);
let index = replaceSummaryInIndex(newIndexHtml, allData);
index = createLateralMenuNavigation(allData, index);
copyResourcesToReport()
saveHtml(index, "axe-report-pretty.html");

allData.forEach(data =>{
    let newHtmlReport = replaceDataInHTML(data)
    newHtmlReport = createLateralMenuNavigation(allData, newHtmlReport)
    saveHtml(newHtmlReport, `axe-result-${data.spec}.html`);
})

saveReport(args.output);



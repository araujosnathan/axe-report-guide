import readResultFile ,
    { 
        getImpactLabel,
        populateDataToHTML, 
        replaceDataInHTML,
        getAllResultFiles,
        getMetrics,
        getSpecNameFromFileName,
        replaceMetricsInHTML,
        createLateralMenuNavigation,
        replaceSummaryInIndex,
        saveHtml,
    } from "../generate_report.js"
import { expect } from "chai"
import { describe , it } from "mocha"

describe("Validation of GetImpactLabel" , ()=> {
    it('Should return danger label for critical impact', () => {
        const expectedLabel = '<td><label class="badge badge-danger">critical</label></td>'
        const element = getImpactLabel("critical");
        expect(element).to.equal(expectedLabel);
    });

    it('Should return warning label for serious impact', () => {
        const expectedLabel = '<td><label class="badge badge-warning">serious</label></td>'
        const element = getImpactLabel("serious");
        expect(element).to.equal(expectedLabel);
    });

    it('Should return info label for minor impact', () => {
        const expectedLabel = '<td><label class="badge badge-info">minor</label></td>'
        const element = getImpactLabel("minor");
        expect(element).to.equal(expectedLabel);
    });

    it('Should return light label for not specified impact', () => {
        const expectedLabel = '<td><label class="badge badge-light">medium</label></td>'
        const element = getImpactLabel("medium");
        expect(element).to.equal(expectedLabel);
    });
})

describe("Validation of ReadResultFile" ,()=> {
    it('Should return a11y result after reading from Json File ', () => {
        const pathFile = "src/test/resources/a11yResult.json"
        const a11yResults = readResultFile(pathFile);
        expect(Object.keys(a11yResults).length).to.gt(0);
    });


    it('Should return an error message when file is not found', () => {
        const pathFile = "src/test/resources/a11yResultWrong.json"
        const a11yResults = readResultFile(pathFile);
        const expectedErrorMessage = "FILE_NOT_FOUND"
        expect(a11yResults).to.eql(expectedErrorMessage);
    });
})

describe("Validation of GetAllResultFiles" ,()=> {
    it('Should return all file names that have only axe_result tag in the name of spec', () => {
        const folderPath = "src/test/resources"
        const filaNames = getAllResultFiles(folderPath);
        const expectedSpecNames = ["a11yResult.axe_result.json"]
        expect(filaNames).to.eql(expectedSpecNames);
    });

    it('Should return an error messsage if folder was not found', () => {
        const folderPath = "src/test/resources/not/found"
        const filaNames = getAllResultFiles(folderPath);
        expect(filaNames).to.eql("FOLDER_NOT_FOUND");
    });
})

describe("Validation of GetMetrics" ,()=> {
    it('Should return correct Metrics', () => {
      const allData = [{
        spec: "",
        violationSummaryHTML: "",
        issueSummaryHTML: "",
        totalViolationsHTML: "",
        totalNodesHTML: "",
        totalViolations: 4,
        totalNodes: 5,
        impacts: ""
    },{
        spec: "",
        violationSummaryHTML: "",
        issueSummaryHTML: "",
        totalViolationsHTML: "",
        totalNodesHTML: "",
        totalViolations: 4,
        totalNodes: 5,
        impacts: ""
    }]
    const metrics = getMetrics(allData);
    const expectedMetrics = {
        totalNodes: 10,
        totalViolations: 8,
        totalResults: 2
    }

        expect(metrics).to.eql(expectedMetrics);
    });

})

describe("Validation of getSpecNameFromFileName" ,()=> {
    it('Should return spec name from file name ', () => {
        const fileName = "a11yResult.axe_result.json"
        const specName = getSpecNameFromFileName(fileName);
        const expectSpecName = "A11yResult"
        expect(specName).to.eql(expectSpecName);
    });

    it('Should return an error message if fila name is not specified', () => {
        const specName = getSpecNameFromFileName();
        expect(specName).to.eql("FILA_NAME_NOT_SPECIFIED");
    });
})

describe("Validation of PopulateDataToHTML" ,()=> {
    it('Should return json data with main information to populate HTML', () => {
        const pathFile = "src/test/resources/a11yResult.json"
        const a11yResults = readResultFile(pathFile);
        const dataToReplace = populateDataToHTML(a11yResults);
        const expectTotalNodes = '<p class="h4 text-danger" id="total-nodes">Total Nodes found: 20</p>'
        const expectTotalViolation = '<p class="h4 text-danger" id="total-violations">Total violations found: 32</p>'
        const expectImpacts = "critical, serious, serious, critical"
        expect(dataToReplace.violationSummaryHTML).to.not.eq("");
        expect(dataToReplace.totalNodesHTML).to.eql(expectTotalNodes);
        expect(dataToReplace.issueSummaryHTML).to.not.eq("");
        expect(dataToReplace.totalViolationsHTML).to.eql(expectTotalViolation);
        expect(dataToReplace.impacts).to.eql(expectImpacts);
    });

    it('Should return json data without violations information to populate HTML', () => {
        const pathFileNoViolations = "src/test/resources/a11yResult_NoViolations.json"
        const a11yResults = readResultFile(pathFileNoViolations);
        const dataToReplace = populateDataToHTML(a11yResults);
        const expectTotalNodes = '<p class="h4 text-success" id="total-nodes">Total Nodes found: 0</p>'
        const expectTotalViolation = '<p class="h4 text-success" id="total-violations">Total violations found: 0</p>'
        expect(dataToReplace.violationSummaryHTML).to.eq("");
        expect(dataToReplace.totalNodesHTML).to.eql(expectTotalNodes);
        expect(dataToReplace.issueSummaryHTML).to.eq("");
        expect(dataToReplace.totalViolationsHTML).to.eql(expectTotalViolation);
    });
 
})

describe("Validation of ReplaceDataInHTML" ,()=> {
    it('Should return new HTML with information replaced', () => {
        const pathFile = "src/test/resources/a11yResult.json"
        const a11yResults = readResultFile(pathFile);
        const dataToReplace = populateDataToHTML(a11yResults);
        const newHtmlReport = replaceDataInHTML(dataToReplace);
        const expectTotalNodes = '<p class="h4 text-danger" id="total-nodes">Total Nodes found: 20</p>'
        const expectTotalViolation = '<p class="h4 text-danger" id="total-violations">Total violations found: 32</p>'

        expect(newHtmlReport).to.not.contain("<!-- violationaSummary data -->")
        expect(newHtmlReport).to.not.contain("<!-- issueSummary data -->")
        expect(newHtmlReport).to.not.contain("<!-- total node data -->")
        expect(newHtmlReport).to.not.contain("<!-- total violation data -->")
        expect(newHtmlReport).to.contain(expectTotalNodes)
        expect(newHtmlReport).to.contain(expectTotalViolation)
    });
})


describe("Validation of replaceMetricsInHTML" ,()=> {
    it('Should return new Index HTML with information replaced', () => {
        const metrics = {
            totalNodes: 10,
            totalViolations: 8,
            totalResults: 2
        }
        const indexHtml = replaceMetricsInHTML(metrics);
        const expectTotalNodes = `<h3 class="mb-0">${metrics.totalNodes}</h3>`
        const expectTotalViolation = `<h3 class="mb-0">${metrics.totalViolations}</h3>`

        expect(indexHtml).to.not.contain("<!-- Total Nodes Affected -->")
        expect(indexHtml).to.not.contain("<!-- Total Violations Found -->")
        expect(indexHtml).to.not.contain("<!-- Total Result -->")
        expect(indexHtml).to.contain(expectTotalNodes)
        expect(indexHtml).to.contain(expectTotalViolation)
    });
})

describe("Validation of createLateralMenuNavigation" ,()=> {
    it('Should return HTML with Sub Menus replaced', () => {
        const metrics = {
            totalNodes: 10,
            totalViolations: 8,
            totalResults: 2
        }
        const allData = [{
            spec: "",
            violationSummaryHTML: "",
            issueSummaryHTML: "",
            totalViolationsHTML: "",
            totalNodesHTML: "",
            totalViolations: 4,
            totalNodes: 5,
            impacts: ""
        },{
            spec: "",
            violationSummaryHTML: "",
            issueSummaryHTML: "",
            totalViolationsHTML: "",
            totalNodesHTML: "",
            totalViolations: 4,
            totalNodes: 5,
            impacts: ""
        }]

        let html = replaceMetricsInHTML(metrics);
        const newHtml = createLateralMenuNavigation(allData, html);
        const expectSubMenu1 =  `<li class="nav-item"> <a class="nav-link" href="axe-result-${allData[0].spec}.html">${allData[0].spec}</a></li>`
        const expectSubMenu2 =  `<li class="nav-item"> <a class="nav-link" href="axe-result-${allData[1].spec}.html">${allData[1].spec}</a></li>`

        expect(newHtml).to.not.contain("<!-- Link to Feature Axe Result -->")
        expect(newHtml).to.contain(expectSubMenu1)
        expect(newHtml).to.contain(expectSubMenu2)
    });
})



describe("Validation of replaceSummaryInIndex" ,()=> {
    it('Should return new Index HTML with Summary replaced', () => {
        const metrics = {
            totalNodes: 10,
            totalViolations: 8,
            totalResults: 2
        }
        const allData = [{
            spec: "",
            violationSummaryHTML: "",
            issueSummaryHTML: "",
            totalViolationsHTML: "",
            totalNodesHTML: "",
            totalViolations: 4,
            totalNodes: 5,
            impacts: ""
        },{
            spec: "",
            violationSummaryHTML: "",
            issueSummaryHTML: "",
            totalViolationsHTML: "",
            totalNodesHTML: "",
            totalViolations: 4,
            totalNodes: 5,
            impacts: ""
        }]

        let html = replaceMetricsInHTML(metrics);
        const newHtml = replaceSummaryInIndex(html, allData);
        const expectTotalViolation =  `<p class="text-muted mb-0">Violation(s): ${allData[0].totalViolations}  </p>`

        expect(newHtml).to.not.contain("<!-- Axe Feature Result Each File -->")
        expect(newHtml).to.contain(expectTotalViolation)
    });
})

describe("Validation of saveHtml" , async()=> {
    // after("", ()=> {
    //     let dir = "template/axe-report"
    //     remove(dir);
    // });

    // it('Should save HTML in the axe report folder', () => {
    //     const metrics = {
    //         totalNodes: 10,
    //         totalViolations: 8,
    //         totalResults: 2
    //     }
    //     const allData = [{
    //         spec: "",
    //         violationSummaryHTML: "",
    //         issueSummaryHTML: "",
    //         totalViolationsHTML: "",
    //         totalNodesHTML: "",
    //         totalViolations: 4,
    //         totalNodes: 5,
    //         impacts: ""
    //     },{
    //         spec: "",
    //         violationSummaryHTML: "",
    //         issueSummaryHTML: "",
    //         totalViolationsHTML: "",
    //         totalNodesHTML: "",
    //         totalViolations: 4,
    //         totalNodes: 5,
    //         impacts: ""
    //     }]

    //     let html = replaceMetricsInHTML(metrics);
    //     let dir = "template/axe-report"
    //     if (!existsSync(dir)){
    //         mkdirSync(dir);
    //     }
    //     saveHtml(html, "test.html").then(()=>{
    //         const isSaved = existsSync("template/axe-report/test.html")
    //         expect(isSaved).to.be.true
    //     })
      
    // });

    it('Should return an error message if file name is not specified', () => {
        const metrics = {
            totalNodes: 10,
            totalViolations: 8,
            totalResults: 2
        }

        let html = replaceMetricsInHTML(metrics);
        expect(saveHtml(html)).to.be.eql("FILA_NAME_NOT_SPECIFIED")
    });
})




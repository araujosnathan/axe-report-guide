'use strict';
import { readFileSync , writeFile , readdirSync} from 'fs';
import pkg from 'fs-extra';
const { copySync, move, remove } = pkg;

let jsonFile
let htmlTemplate = readFileSync('template/result.html', "utf-8");
let indexHtmlTemplate = readFileSync('template/index.html', "utf-8");

export default function readResultFile(resulstFilePath){
    try {
        jsonFile = readFileSync(resulstFilePath);
        let a11yResults = JSON.parse(jsonFile);
        return a11yResults;
    } catch (error) {
        if(error.message.includes("no such file or directory")) 
            return 'FILE_NOT_FOUND';
    }   
}

export function getAllResultFiles(resulstFolderPath){
    let fileNames = new Array();
    try {
        const files = readdirSync(resulstFolderPath) 
        files.forEach(function (file) {
            if(file.includes(".axe_result.json"))
                fileNames.push(file)
        });
        return fileNames
    } catch (error) {
        if(error.message.includes("no such file or directory")) 
            return 'FOLDER_NOT_FOUND';
    }   
}

export function getImpactLabel(impact){
    let labelImpact = "";
    if(impact == "critical")
        labelImpact = `<td><label class="badge badge-danger">${impact}</label></td>`
    else if(impact == "serious")
        labelImpact = `<td><label class="badge badge-warning">${impact}</label></td>`
    else if(impact == "minor")
        labelImpact = `<td><label class="badge badge-info">${impact}</label></td>`
    else
        labelImpact = `<td><label class="badge badge-light">${impact}</label></td>`
    return labelImpact;
}

export function getMetrics(allData){
    let metrics = {
        totalNodes: 0,
        totalViolations: 0,
        totalResults: allData.length
    }
    allData.forEach(data =>{
        metrics.totalNodes += data.totalNodes;
        metrics.totalViolations += data.totalViolations
    })
    return metrics;
}

export function getSpecNameFromFileName(fileName){
    if(fileName == "" || fileName == undefined)
        return 'FILA_NAME_NOT_SPECIFIED'
    let spec = fileName.replace(".axe_result.json", "")
    return spec.charAt(0).toUpperCase() + spec.slice(1)
}

export function populateDataToHTML(a11yResults){
    let data = {
        spec: "",
        violationSummaryHTML: "",
        issueSummaryHTML: "",
        totalViolationsHTML: "",
        totalNodesHTML: "",
        totalViolations: 0,
        totalNodes: 0,
        impacts: ""
    }

    let index = 1;
    let countNode = 1
    let totalViolations = 0
    let impacts = new Array();
    a11yResults.forEach(violation => {
            var tblRow = 
                "<tr>" + 
                "<td>" + index + "</td>" + 
                "<td>" + violation.id + "</td>" +
                getImpactLabel(violation.impact) + 
                "<td>" + violation.description + "</td>" + 
                "<td>" + violation.help + "</td>" + 
                "<td>" + violation.nodes.length + "</td>" + 
                "</tr>"
                data.violationSummaryHTML = data.violationSummaryHTML + tblRow;
                impacts.push(violation.impact);
                index++;
                
                violation.nodes.forEach(node =>{
                    let issueRow = ""
                    node.any.forEach(issue =>{
                        issueRow = issueRow +
                            "<tr>" + 
                            "<td>" + issue.id + "</td>" +
                            getImpactLabel(issue.impact) + 
                            "<td>" + issue.message + "</td>" + 
                            "</tr>"
                    })
      
                    totalViolations = totalViolations + node.any.length
                    var issueSummaryRow = 
                                    `<div class="col-lg-12 grid-margin stretch-card">
                                        <div class="card">
                                            <div class="card-body">
                                                <p><code class="h4">#${countNode}</code><br></br>
                                                    <blockquote class="blockquote blockquote-primary">
                                                        <h4>Target: ${node.target}</h4>
                                                        <h4 class='text-primary'>${node.html.slice(1).slice(0, -1)}</<h4>
                                                        <h4>Impact: ${getImpactLabel(node.impact)}</h4>
                                                    </blockquote>
                                                    <div class="table-responsive">       
                                                        <table class="table table-striped">
                                                            <thead>
                                                                <tr>
                                                                    <th>Rule Id</th>
                                                                    <th>Impact</th>
                                                                    <th>Message</th>
                                                                </tr>
                                                            </thead>
                                                            <h4> Issues: </h4>
                                                            <tbody id="issueTable">
                                                                ${issueRow}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                            </div>
                                        </div>
                                    </div><br>`
                    data.issueSummaryHTML = data.issueSummaryHTML + issueSummaryRow;
                    countNode++
                }) 
        });
   
    totalViolations > 0 ?  
        data.totalViolationsHTML = data.totalViolationsHTML + `<p class="h4 text-danger" id="total-violations">Total violations found: ${totalViolations}</p>` : 
        data.totalViolationsHTML = data.totalViolationsHTML+ `<p class="h4 text-success" id="total-violations">Total violations found: ${totalViolations}</p>`
    countNode = countNode  - 1
    countNode > 0 ?  
        data.totalNodesHTML = data.totalNodesHTML + `<p class="h4 text-danger" id="total-nodes">Total Nodes found: ${countNode}</p>` :
        data.totalNodesHTML = data.totalNodesHTML + `<p class="h4 text-success" id="total-nodes">Total Nodes found: ${countNode}</p>`                                                                                                                                                          
    
    data.totalNodes = countNode;
    data.totalViolations = totalViolations;
    data.impacts = impacts.toString().replaceAll(",", ", ");
    return data;
}

export function replaceMetricsInHTML(metrics){
    let newIndexHtml = indexHtmlTemplate.replace("<!-- Total Nodes Affected -->", `<h3 class="mb-0">${metrics.totalNodes}</h3>` );
    newIndexHtml = newIndexHtml.replace("<!-- Total Violations Found -->", `<h3 class="mb-0">${metrics.totalViolations}</h3>`);
    newIndexHtml = newIndexHtml.replace("<!-- Total Result -->", `<h3 class="mb-0">${metrics.totalResults}</h3>`);
    return newIndexHtml;
}

export function createLateralMenuNavigation(allData, html){
    let subMenusResults = ""
    allData.forEach(data =>{
        subMenusResults = subMenusResults + 
        `<li class="nav-item"> <a class="nav-link" href="axe-result-${data.spec}.html">${data.spec}</a></li>`
    })

    let newHtml = html.replace("<!-- Link to Feature Axe Result -->", subMenusResults );
    return newHtml;
}

export function replaceSummaryInIndex(indexHtml, allData){
    let list = ""
    allData.forEach(data =>{
        let item = `<div class="preview-item border-bottom">
        <div class="preview-thumbnail">
          <div class="preview-icon bg-primary">
            <i class="mdi mdi-file-document"></i>
          </div>
        </div>
        <div class="preview-item-content d-sm-flex flex-grow">
          <div class="flex-grow">
            <!-- Axe Feature Result Name -->
            <h6 class="preview-subject">${data.spec}</h6>
            <!-- Axe Feature Result Impacts -->
            <p class="text-muted mb-0">[ ${data.impacts} ] violation(s) found</p>
          </div>
          <div class="mr-auto text-sm-right pt-2 pt-sm-0">
            <!-- Axe Result Feature Nodes -->
            <p class="text-muted">Node(s): ${data.totalNodes} </p>
            <!-- Axe Result Feature Violations -->
            <p class="text-muted mb-0">Violation(s): ${data.totalViolations}  </p>
          </div>
        </div>
      </div>`
      list = list + item
    })
    let newIndexHtml = indexHtml.replace(" <!-- Axe Feature Result Each File -->", list );
    return newIndexHtml;
}


export function replaceDataInHTML(dataToReplace){
    let newHtmlReport = htmlTemplate.replace("<!-- violationaSummary data -->", dataToReplace.violationSummaryHTML);
    newHtmlReport = newHtmlReport.replace("<!-- issueSummary data -->", dataToReplace.issueSummaryHTML);
    newHtmlReport = newHtmlReport.replace("<!-- total node data -->", dataToReplace.totalNodesHTML);
    newHtmlReport = newHtmlReport.replace("<!-- total violation data -->", dataToReplace.totalViolationsHTML);
    newHtmlReport = newHtmlReport.replace("<!-- Feature Axe Result Title -->", `<h3 class="display-3">${dataToReplace.spec}</h3>`);
    newHtmlReport = newHtmlReport.replace("<!-- Feature Axe Result Page -->", `<li class="breadcrumb-item active" aria-current="page">${dataToReplace.spec}</li>`);
    
    return newHtmlReport;
}

export function saveReport(pathToSave){
    let dir = "template/axe-report"
    let path = ""
    if(pathToSave == true) path = "axe-report"
    else path = `${pathToSave}/axe-report`
    
    move(dir, path, {mkdirp: false, clobber: false}, function(err) {
        if(err) {
            remove(dir);
            if(err.message.includes("dest already exists."))
                return console.log("Error: the axe-report folder already exists in the destination!");
        }
        console.log(`√ Generated Axe Report Pretty Successful in ${path} `);
    }); 
}

export function copyResourcesToReport(){
    let dir = "template/axe-report"
    copySync("template/assets", `${dir}/assets`, { overwrite: true}, function(err) {
        if(err) {
            return console.log(err);
        }
    }); 
}
export function saveHtml(newHtmlReport, filaName){
    let dir = "template/axe-report"
    if(filaName == "" || filaName == undefined)
        return 'FILA_NAME_NOT_SPECIFIED'
    writeFile(`${dir}/${filaName}`, newHtmlReport, function(err) {
        if(err) {
            return console.log(err);
        }
    });  
}

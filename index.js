<<<<<<< HEAD
/**
*   "css-heatmap-generator v 1.0.0",
*   "author": "gaurav.techgeek@gmail.com",
*   "description": "Utility to build css heat map"
*/

const fs = require('fs');
const glob = require('glob');
const path = require('path');
var json2html = require('node-json2html');
let globalRuleSet = {};
const options = require('../../cssHeatMap.conf');
const sourcePath = path.resolve(__dirname, options.sourcePath);
const excludeDirs = options.excludeDirs;
const targetPath = path.resolve(__dirname, "../../" + options.target);
/**
 * Template to generate HTML report 
 */
const rulesTemplate = {
    "<>": "div",
    "style": function () {
        if (options.showSensitveOnly) {
            if (this.senistivity < 2) {
                return "display:none";
            }
        }
        else {
            return "background: #EEE";
        }
    },
    "html": [{
        "<>": "div",
        "html": "<hr>"
    }, {
        "<>": "span",
        "html": "CSS RULE: ${rule}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "html": "FILE: ${files}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "html": "USAGE: ${usage}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "style": function () {
            if (this.isDuplicate) {
                return ('border-radius:2px; background-color: orange; color: white');
            } else {
                return ('display:none');
            }
        },
        "html": "DUPLICATE"
    }, {
        "<>": "span",
        "style": function () {
            if (this.senistivity > 1) {
                return ('border-radius:2px; background-color: red; color: white');
            } else {
                return ('display:none');
            }
        },
        "html": "SENSITIVE"
    }]
};


/**
 * Util to keep common code for adding contents in globalruleset
 * @param {string} rule 
 * @param {string} filename 
 */
let putUsageInGlobalRuleSet = (rule, filename) => {
    if (globalRuleSet[rule].usage) {
        globalRuleSet[rule].usage.push(filename);
    }
    else {
        globalRuleSet[rule].usage = [filename];
    }
}

/**
 * Read all CSS files
 */
glob(sourcePath + "/**/*.css", (error, files) => {
    let componentsCSS = files;
    let promiseArr = [];
    componentsCSS = componentsCSS.filter((file) => {
        return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
    });
    componentsCSS.forEach((filename) => {
        promiseArr.push(parseCSSFile(filename));
    });
    Promise.all(promiseArr).then(() => {
        glob(sourcePath + "/**/*.html", (error, htmlFiles) => {
            let htmlPromiseArr = [];
            htmlFiles = htmlFiles.filter((file) => {
                return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
            });
            htmlFiles.forEach((htmlFile) => {
                htmlPromiseArr.push(findCSSRuleInMarkup(htmlFile));
            });
            Promise.all(htmlPromiseArr).then(() => {
                glob(sourcePath + "/**/*.tmpl", (error, tmplFiles) => {
                    let tmplPromiseArr = [];
                    tmplFiles = tmplFiles.filter((file) => {
                        return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
                    });
                    tmplFiles.forEach((tmplFile) => {
                        tmplPromiseArr.push(findCSSRuleInMarkup(tmplFile));
                    });
                    Promise.all(tmplPromiseArr).then(() => {
                        let allRulesArray = [];
                        for (let key in globalRuleSet) {
                            let isDuplicate = globalRuleSet[key].files.length > 1 ? true : false;
                            let usage = globalRuleSet[key].usage && globalRuleSet[key].usage.length > 1 ? globalRuleSet[key].usage.join("<br>") : globalRuleSet[key].usage;
                            let files = globalRuleSet[key].files && globalRuleSet[key].files.join("<br>");
                            allRulesArray.push({ rule: key, files: files, usage: usage, isDuplicate: isDuplicate, senistivity: usage ? usage.length : 0 });
                        }
                        let allRulesHTML = json2html.transform(allRulesArray, rulesTemplate);
                        fs.writeFile(targetPath + "\\cssHeatMap.html", allRulesHTML, (err) => {
                            if (err) throw err;
                            console.log('CSS HeatMap Generated: ' + targetPath + "\cssHeatMap.html");
                        });
                    });
                });
            });
        });
    });
});

/**
 * @method parseCSSFile
 * Get all rules from a given CSS file path
 * @param {string} filename 
 */
let parseCSSFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: "utf8" }, function (err, data) {
            if (err) reject();
            let fileContent = data.toString();
            let matches = fileContent.match(/{([^}]+)}/g);
            let comments = fileContent.match(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm);
            matches.forEach((match) => {
                fileContent = fileContent.replace(match, "");
            });
            if (comments) {
                comments.forEach((comment) => {
                    fileContent = fileContent.replace(comment, "");
                });
            }
            fileContent = fileContent.split('\n');
            fileContent = fileContent.filter((content) => {
                return content !== "\r";
            });
            let rules = [];
            fileContent.forEach((rule) => {
                rule = rule.split('\r')[0];
                rule = rule.split(",");
                rule.forEach((finalRule) => {
                    if (finalRule.trim() !== "")
                        rules.push(finalRule.trim());
                });
            });
            rules.forEach((rule) => {
                if (globalRuleSet[rule]) {
                    globalRuleSet[rule].files.push(filename);
                }
                else {
                    globalRuleSet[rule] = { files: [filename] };
                }
            });
            resolve();
        });
    });
}

/**
 * @method findCSSRuleInMarkup
 * Find if the rules from global rule set are used in the given markup file path
 * @param {String} filename 
 */
let findCSSRuleInMarkup = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: "utf8" }, function (err, data) {
            if (err) reject();
            let fileContent = data.toString();
            for (let rule in globalRuleSet) {
                if (rule.trim().split(" ").length > 1) {
                    // HIERARCHICAL RULE
                    let match = false;
                    var singularRules = rule.trim().split(" ");
                    //console.log(singularRules);
                    for (let idx = 0; idx < singularRules.length; idx++) {
                        let singularRule = singularRules[idx];
                        if (((singularRule.startsWith('.') && fileContent.indexOf(singularRule.replace(".", "")) !== -1) ||
                            (singularRule.startsWith('#') && fileContent.indexOf(singularRule.replace("#", "")) !== -1) ||
                            (fileContent.indexOf(("<" + singularRule)) !== -1 || fileContent.indexOf((" " + singularRule)) !== -1))) {
                            match = true;
                        }
                        else {
                            match = false;
                            break;
                        }
                    };
                    if (match === true) {
                        putUsageInGlobalRuleSet(rule, filename);
                    }
                }
                else {
                    //NON HIERARCHICAL RULE
                    if (rule.startsWith('.') && fileContent.indexOf(rule.replace(".", "")) !== -1 ||
                        rule.startsWith('#') && fileContent.indexOf(rule.replace("#", "")) !== -1 ||
                        fileContent.indexOf(("<" + rule)) !== -1 || fileContent.indexOf((" " + rule)) !== -1) {
                        putUsageInGlobalRuleSet(rule, filename);
                    }
                }
            };
            resolve();
        });
    });
}
=======
/**
*   "css-heatmap-generator v 1.0.0",
*   "author": "gaurav.techgeek@gmail.com",
*   "description": "Utility to build css heat map"
*/

const fs = require('fs');
const glob = require('glob');
const path = require('path');
var json2html = require('node-json2html');
let globalRuleSet = {};
const options = require('../../cssHeatMap.conf');
const sourcePath = path.resolve(__dirname, options.sourcePath);
const excludeDirs = options.excludeDirs;
const targetPath = path.resolve(__dirname, "../../" + options.target);
/**
 * Template to generate HTML report 
 */
const rulesTemplate = {
    "<>": "div",
    "style": function () {
        if (options.showSensitveOnly) {
            if (this.senistivity < 2) {
                return "display:none";
            }
        }
        else {
            return "background: #EEE";
        }
    },
    "html": [{
        "<>": "div",
        "html": "<hr>"
    }, {
        "<>": "span",
        "html": "CSS RULE: ${rule}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "html": "FILE: ${files}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "html": "USAGE: ${usage}"
    }, {
        "<>": "div",
        "html": "<br>"
    }, {
        "<>": "span",
        "style": function () {
            if (this.isDuplicate) {
                return ('border-radius:2px; background-color: orange; color: white');
            } else {
                return ('display:none');
            }
        },
        "html": "DUPLICATE"
    }, {
        "<>": "span",
        "style": function () {
            if (this.senistivity > 1) {
                return ('border-radius:2px; background-color: red; color: white');
            } else {
                return ('display:none');
            }
        },
        "html": "SENSITIVE"
    }]
};


/**
 * Util to keep common code for adding contents in globalruleset
 * @param {string} rule 
 * @param {string} filename 
 */
let putUsageInGlobalRuleSet = (rule, filename) => {
    if (globalRuleSet[rule].usage) {
        globalRuleSet[rule].usage.push(filename);
    }
    else {
        globalRuleSet[rule].usage = [filename];
    }
}

/**
 * Read all CSS files
 */
glob(sourcePath + "/**/*.css", (error, files) => {
    let componentsCSS = files;
    let promiseArr = [];
    componentsCSS = componentsCSS.filter((file) => {
        return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
    });
    componentsCSS.forEach((filename) => {
        promiseArr.push(parseCSSFile(filename));
    });
    Promise.all(promiseArr).then(() => {
        glob(sourcePath + "/**/*.html", (error, htmlFiles) => {
            let htmlPromiseArr = [];
            htmlFiles = htmlFiles.filter((file) => {
                return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
            });
            htmlFiles.forEach((htmlFile) => {
                htmlPromiseArr.push(findCSSRuleInMarkup(htmlFile));
            });
            Promise.all(htmlPromiseArr).then(() => {
                glob(sourcePath + "/**/*.tmpl", (error, tmplFiles) => {
                    let tmplPromiseArr = [];
                    tmplFiles = tmplFiles.filter((file) => {
                        return !excludeDirs.some((dir) => { file.indexOf(excludeDirs) !== -1 });
                    });
                    tmplFiles.forEach((tmplFile) => {
                        tmplPromiseArr.push(findCSSRuleInMarkup(tmplFile));
                    });
                    Promise.all(tmplPromiseArr).then(() => {
                        let allRulesArray = [];
                        for (let key in globalRuleSet) {
                            let isDuplicate = globalRuleSet[key].files.length > 1 ? true : false;
                            let usage = globalRuleSet[key].usage && globalRuleSet[key].usage.length > 1 ? globalRuleSet[key].usage.join("<br>") : globalRuleSet[key].usage;
                            let files = globalRuleSet[key].files && globalRuleSet[key].files.join("<br>");
                            allRulesArray.push({ rule: key, files: files, usage: usage, isDuplicate: isDuplicate, senistivity: usage ? usage.length : 0 });
                        }
                        let allRulesHTML = json2html.transform(allRulesArray, rulesTemplate);
                        fs.writeFile(targetPath + "\\cssHeatMap.html", allRulesHTML, (err) => {
                            if (err) throw err;
                            console.log('CSS HeatMap Generated: ' + targetPath + "\cssHeatMap.html");
                        });
                    });
                });
            });
        });
    });
});

/**
 * @method parseCSSFile
 * Get all rules from a given CSS file path
 * @param {string} filename 
 */
let parseCSSFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: "utf8" }, function (err, data) {
            if (err) reject();
            let fileContent = data.toString();
            let matches = fileContent.match(/{([^}]+)}/g);
            let comments = fileContent.match(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm);
            matches.forEach((match) => {
                fileContent = fileContent.replace(match, "");
            });
            if (comments) {
                comments.forEach((comment) => {
                    fileContent = fileContent.replace(comment, "");
                });
            }
            fileContent = fileContent.split('\n');
            fileContent = fileContent.filter((content) => {
                return content !== "\r";
            });
            let rules = [];
            fileContent.forEach((rule) => {
                rule = rule.split('\r')[0];
                rule = rule.split(",");
                rule.forEach((finalRule) => {
                    if (finalRule.trim() !== "")
                        rules.push(finalRule.trim());
                });
            });
            rules.forEach((rule) => {
                if (globalRuleSet[rule]) {
                    globalRuleSet[rule].files.push(filename);
                }
                else {
                    globalRuleSet[rule] = { files: [filename] };
                }
            });
            resolve();
        });
    });
}

/**
 * @method findCSSRuleInMarkup
 * Find if the rules from global rule set are used in the given markup file path
 * @param {String} filename 
 */
let findCSSRuleInMarkup = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, { encoding: "utf8" }, function (err, data) {
            if (err) reject();
            let fileContent = data.toString();
            for (let rule in globalRuleSet) {
                if (rule.trim().split(" ").length > 1) {
                    // HIERARCHICAL RULE
                    let match = false;
                    var singularRules = rule.trim().split(" ");
                    //console.log(singularRules);
                    for (let idx = 0; idx < singularRules.length; idx++) {
                        let singularRule = singularRules[idx];
                        if (((singularRule.startsWith('.') && fileContent.indexOf(singularRule.replace(".", "")) !== -1) ||
                            (singularRule.startsWith('#') && fileContent.indexOf(singularRule.replace("#", "")) !== -1) ||
                            (fileContent.indexOf(("<" + singularRule)) !== -1 || fileContent.indexOf((" " + singularRule)) !== -1))) {
                            match = true;
                        }
                        else {
                            match = false;
                            break;
                        }
                    };
                    if (match === true) {
                        putUsageInGlobalRuleSet(rule, filename);
                    }
                }
                else {
                    //NON HIERARCHICAL RULE
                    if (rule.startsWith('.') && fileContent.indexOf(rule.replace(".", "")) !== -1 ||
                        rule.startsWith('#') && fileContent.indexOf(rule.replace("#", "")) !== -1 ||
                        fileContent.indexOf(("<" + rule)) !== -1 || fileContent.indexOf((" " + rule)) !== -1) {
                        putUsageInGlobalRuleSet(rule, filename);
                    }
                }
            };
            resolve();
        });
    });
}
>>>>>>> 88595b7eaab904f4768a5497b3350262712dcc61

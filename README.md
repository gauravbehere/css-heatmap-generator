# css-heatmap-generator
Utility to build CSS heat map

Purpose: 
In large projects we often have multiple CSS files & templates consuming CSS rules from multiple files. When we refer to multiple CSS rules in our templates from multiple files, there is chance to 
override the common rules while fixing a bug. Multiple screens may refer to common CSS rule which if modified impacts all. There could be duplicate rules having same CSS selectors defined in multiple CSS files. When we fix a bug or enhance one particular screen we need to know the CSS rules that we are adding or modifying are not duplicate or are not breaking some other screen.

This tools helps in visualizing the CSS rules from multiple files in a glance. CSS Heat Map helps in:
1. Identifying duplicate rules.
2. Identifiying sensitive rules which are refererred by multiple templates.
3. Identifying IMPACT of a CSS modification, thus help in better regression testing.

# Installation

> npm install css-heatmap-generator

# Configuration
```javascript
module.exports = {
        
    "sourcePath": "", /* Path to the source code */    
    
    "excludeDirs": [], /* List of directories to exclude like lib, thirdparty etc */
    
    "showSensitveOnly": true, /* If true only results in sensitive rules in the report */    
    
    "target": "" /* target folder where report needs to be generated */

}
```

Save this as cssHeatMap.conf.js next to node_modules folder

# Command

Add this to your package.json:

```javascript
"scripts": {

        "buildCSSGraph": "node ./node_modules/css-heatmap-generator"    

}
```


Run:
```javascript 
npm run buildCSSGraph 
``` 

# Output
In the target folder specifed, there will be a repors generated.
'cssHeatMap', displayes the heat map in graphical format using d3, where 'cssHeatMapTable' represents the same with more details in tabular format.
The JSON data is also generated in target folder, allowing customization of reports.

1. The file cssHeatMap.html is a visualization of CSS rules across the application, their usage and sensitivity.
2. The file cssHeatMapTable.html, is a tabular represenation of the CSS rules.


Note: I am working on improving the logic to find the usage of CSS in template where the rules are defined as complex selectors like A.B>C. Please feel free to contribute.

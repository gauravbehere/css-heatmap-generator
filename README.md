# css-heatmap-generator
Utility to build CSS heat map

# installation

> npm install css-heatmap-generator

# configuration
<code>
module.exports = {
        
    "sourcePath": "", /* Path to the source code */
    
    "excludeDirs": [], /* List of directories to exclude like lib, thirdparty etc */
    
    "showSensitveOnly": true, /* If true only results in sensitive rules in the report */
    
    "target": "" /* target folder where report needs to be generated */   
}
</code>

Save this as cssHeatMap.conf.js next to node_modules folder

# command

Add this to your package.json:

<code>
"scripts": {

        "buildCSSGraph": "node ./node_modules/css-heatmap-generator"
        
}
</code>
Run:

<code>npm run buildCSSGraph</code> as part of your build process.

# output
In the target folder specifed, there will be a repors generated.
'cssHeatMap', displayes the heat map in graphical format using d3, where 'cssHeatMapTable' represents the same with more details in tabular format.
The JSON data is also generated in target folder, allowing customization of reports.


Note: I am working on improving the logic to find the usage of CSS in template where the rules are defined as complex selectors like A.B>C. Please feel free to contribute.
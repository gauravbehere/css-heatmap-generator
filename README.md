# css-heatmap-generator
Utility to build CSS heat map

# installation

> npm install css-heatmap-generator

# configuration

module.exports = {
        
    "sourcePath": "", /* Path to the source code */
    
    "excludeDirs": [], /* List of directories to exclude like lib, thirdparty etc */
    
    "showSensitveOnly": true, /* If true only results in sensitive rules in the report */
    
    "target": "" /* target folder where report needs to be generated */   
}


Save this as cssHeatMap.conf.js next to node_modules folder

# command

Add this to your package.json:

"scripts": {

        "buildCSSGraph": "node ./node_modules/css-heatmap-generator"
        
}

Run:

<code>npm run buildCSSGraph</code> as part of your build process.
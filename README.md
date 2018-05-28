<<<<<<< HEAD
# css-dependency-graph
Utility to build CSS dependency graph

# usage

"devDependencies": {

        "css-dependency-graph": "git+https://github5.cisco.com/gbehere/css-dependency-graph.git"
        
}

> npm install css-dependency-graph

# configuration

module.exports = {
        
    "sourcePath": "", /* Path to the source code */
    
    "excludeDirs": [], /* List of directories to exclude like lib, thirdparty etc */
    
    "showSensitveOnly": true, /* If true only results in sensitive rules in the report */
    
    "target": "" /* target folder where report needs to be generated */   
}


Save this as cssDependencyGraph.conf.js next to node_modules folder

# command

Add this to your package.json:

"scripts": {

        "buildCSSGraph": "node ./node_modules/css-dependency-graph"
        
}

Run:

<code>npm run buildCSSGraph</code> as part of your build process.
=======
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
>>>>>>> 88595b7eaab904f4768a5497b3350262712dcc61

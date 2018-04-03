module.exports = {
    entry: "./dist/scripts/main.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    devtool: "source-map"
};
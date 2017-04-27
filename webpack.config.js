const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        globe: "./src/scripts/globe.js",
        projections: "./src/scripts/projections.js"
    },
    output: {
        path: path.resolve("build-output"),
        filename: "[name].bundle.js"
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
        }, {
            test: /\.scss$/,
            loaders: ['style-loader', 'css-loader', 'sass-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/globe.html",
            filename: "globe.html",
            chunks: ["globe"],
            inject: "body"
        }),
        new HtmlWebpackPlugin({
            template: "./src/projections.html",
            filename: "projections.html",
            chunks: ["projections"],
            inject: "body"
        })
    ]
};

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: {
        globe: "./src/scripts/globe.js",
        "hello-world": "./src/scripts/hello-world.js"
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
            template: "./src/index.html",
            filename: "index.html"
        }),
        new HtmlWebpackPlugin({
            template: "./src/globe.html",
            filename: "globe.html",
            chunks: ["globe"],
            inject: "body"
        }),
        new HtmlWebpackPlugin({
            template: "./src/hello-world.html",
            filename: "hello-world.html",
            chunks: ["hello-world"],
            inject: "body"
        }),
        new CopyWebpackPlugin([
            { from: "data", to: "data" }
        ])
    ]
};

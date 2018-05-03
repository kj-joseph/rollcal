const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

module.exports = merge(common, {
	plugins: [
	new MinifyPlugin({},{}),
	new webpack.DefinePlugin({
			sourceMap: true,
			"process.env.NODE_ENV": JSON.stringify("production")
		}),
		new webpack.DefinePlugin({
			"API_URL": JSON.stringify("/api/")
		})
	]
});

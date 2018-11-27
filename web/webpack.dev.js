const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

module.exports = merge(common, {
	plugins: [
		new webpack.DefinePlugin({
			"process.env.API_URL": JSON.stringify("/api/"),
			"process.env.ENV": JSON.stringify("dev")
		})
	]
});

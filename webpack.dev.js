const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

module.exports = merge(common, {
	devServer: {
		contentBase: build_dir,
		historyApiFallback: true,
		inline: true,
		open: true,
		host: "0.0.0.0",
		port: 3000
	},
	plugins: [
		new webpack.DefinePlugin({
			"API_URL": JSON.stringify("/dev/"),
			"ENV": JSON.stringify("dev")
		})
	]
});

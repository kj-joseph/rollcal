const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

const titleEnvTag="[LOCAL] ";

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
			"API_URL": JSON.stringify("http://192.168.1.66:55002/"),
		})
	]
});

const webpack = require("webpack");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const TerserPlugin = require('terser-webpack-plugin');
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

const common = commonConfig();

common.output.filename = "rollcal-api.js";

module.exports = merge(common, {

	plugins: [
		new webpack.DefinePlugin({
			"API_PORT": JSON.stringify('55002')
		}),
	],

	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: false
				}
			})
		]
	}

});

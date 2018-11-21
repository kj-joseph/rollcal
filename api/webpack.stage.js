const webpack = require("webpack");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const TerserPlugin = require('terser-webpack-plugin');
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

const common = commonConfig();

common.output.filename = "rollcal-api-stage.js";

module.exports = merge(common, {

	plugins: [
		new webpack.DefinePlugin({
			"API_PORT": JSON.stringify("55002"),
			"process.env.ROLLCAL_ALLOW_ORIGIN": JSON.stringify("https://www.roll-cal.com")
		}),
		new webpack.EnvironmentPlugin([
			'ROLLCAL_PROD_DBHOST',
			'ROLLCAL_PROD_DBNAME',
			'ROLLCAL_PROD_DBPASS',
			'ROLLCAL_PROD_DBUSER',
			'ROLLCAL_PROD_SECRET',
		])
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

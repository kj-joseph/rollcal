const webpack = require("webpack");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

const common = commonConfig();

common.output.filename = "rollcal-api-stage.js";

module.exports = merge(common, {

	plugins: [
		new webpack.DefinePlugin({
			"process.env.ROLLCAL_API_PORT": JSON.stringify("55012"),
			"process.env.ROLLCAL_ALLOW_ORIGIN": JSON.stringify("https://stage.roll-cal.com")
		}),
		new webpack.EnvironmentPlugin([
			"FEEDBACK_EMAIL",
			"ROLLCAL_STAGE_DBHOST",
			"ROLLCAL_STAGE_DBNAME",
			"ROLLCAL_STAGE_DBPASS",
			"ROLLCAL_STAGE_DBUSER",
			"ROLLCAL_STAGE_SECRET",
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

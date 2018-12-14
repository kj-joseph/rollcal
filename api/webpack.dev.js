const webpack = require("webpack");
const merge = require("webpack-merge");
const commonConfig = require("./webpack.common.js");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

const common = commonConfig();

common.output.filename = "rollcal-api-dev.js";

module.exports = merge(common, {

	plugins: [
		new webpack.DefinePlugin({
			"process.env.ROLLCAL_API_PORT": JSON.stringify("55022"),
			"process.env.ROLLCAL_ALLOW_ORIGIN": JSON.stringify("https://dev.roll-cal.com")
		}),
		new webpack.EnvironmentPlugin([
			"FEEDBACK_EMAIL",
			"GOOGLE_GEOCODE_KEY",
			"ROLLCAL_DEV_DBHOST",
			"ROLLCAL_DEV_DBNAME",
			"ROLLCAL_DEV_DBPASS",
			"ROLLCAL_DEV_DBUSER",
			"ROLLCAL_DEV_SECRET",
		])
	]

});

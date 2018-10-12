const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");
const build_dir = path.resolve(__dirname, "build");

common.output.filename = "rollcal-api-dev.js";

module.exports = merge(common, {

	plugins: [
		new webpack.DefinePlugin({
			"API_PORT": JSON.stringify('55022')
		})
	]

});

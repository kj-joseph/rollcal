const webpack = require("webpack");

const path = require("path");
const build_dir = path.resolve(__dirname, "build");
const src_dir = path.resolve(__dirname, "src");

module.exports = {

	entry: [src_dir + "/bin/www"],

	target: "node",

	module: {
		exprContextCritical: false,
	},

	output: {
		filename: "rollcal-api.js",
		path: build_dir,
		publicPath: "/"
	}

};

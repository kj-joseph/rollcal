const webpack = require("webpack");

const path = require("path");
const build_dir = path.resolve(__dirname, "build");
const src_dir = path.resolve(__dirname, "src");

module.exports = () => {

	return {

		entry: [src_dir + "/server.ts"],

		resolve: {
			modules: [
				src_dir,
				"node_modules"
			],
			extensions: [".ts", ".js", ".json"]
		},

		target: "node",

		module: {
			exprContextCritical: false,
			rules: [
			{
				test: /\.jsx?/,
				include: src_dir,
				loader: "babel-loader"
			},
			{
				test: /\.tsx?/,
				include: src_dir,
				loader: "babel-loader"
			},
			],
		},

		output: {
			filename: "rollcal-api.js",
			path: build_dir,
			publicPath: "/"
		}

	};

};

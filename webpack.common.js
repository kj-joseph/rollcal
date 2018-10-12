const webpack = require("webpack");

const path = require("path");
const build_dir = path.resolve(__dirname, "build");
const src_dir = path.resolve(__dirname, "src");

module.exports = () => {

//console.log(process.env);

	return {

		entry: [src_dir + "/bin/www"],

		target: "node",

		module: {
			exprContextCritical: false,
		},

		output: {
			filename: "rollcal-api.js",
			path: build_dir,
			publicPath: "/"
		},

		plugins: [
			new webpack.EnvironmentPlugin([
				'ROLLCAL_DB_HOST',
				'ROLLCAL_DB_USER',
				'ROLLCAL_DB_PASSWORD',
				'ROLLCAL_DB_DATABASE'
			])
		]

	};

};

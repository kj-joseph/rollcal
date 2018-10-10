const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path");
const build_dir = path.resolve(__dirname, "build");
const src_dir = path.resolve(__dirname, "src");
const node_dir = path.resolve(__dirname, "node_modules");

module.exports = {
	entry: ["babel-polyfill", src_dir + "/index.jsx"],

	output: {
		filename: "bundle.js",
		path: build_dir,
		publicPath: "/"
	},

	resolve: {
		modules: [
			src_dir,
			"node_modules"
		],
		alias: {
			flag_icon_css: node_dir + "/flag-icon-css/sass/flag-icon.scss"
		}
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: titleEnvTag + "Roll-Cal",
			template: "src/index.html",
			minify: false
		})
	],

	module: {
		rules: [
			{
				test: /\.htaccess$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name]",
						outputPath: "/"
					}
				}
			},
			{
				test: /(browserconfig.xml|site.webmanifest)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "/images/"
					}
				}
			},
			{
				test: /\.jsx?/,
				include: src_dir,
				loader: "babel-loader"
			},
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				use: {					
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "fonts/"
					}
				}
			},
			{
				test: /\.(css|scss|sass)$/,
				loader: ["style-loader", "css-loader", "sass-loader"]
			},
			{
				test: /\.ico$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "images/"
						}
					}
				]
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "images/"
						}
					},
					{
						loader: "image-webpack-loader",
						options: {
							mozjpeg: {
								progressive: true,
								quality: 75
							},
							// optipng.enabled: false will disable optipng
							optipng: {
								enabled: false,
							},
							pngquant: {
								enabled: false,
//								quality: "90-100",
//								speed: 4
							},
							gifsicle: {
								interlaced: false,
							},
							// the webp option will enable WEBP
/*							webp: {
								quality: 75
							}
*/						}
					},
				],
			}
		],
	},

};

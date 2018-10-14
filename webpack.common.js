const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path");
const build_dir = path.resolve(__dirname, "build");
const src_dir = path.resolve(__dirname, "src");
const node_dir = path.resolve(__dirname, "node_modules");

module.exports = {
	entry: ["@babel/polyfill", src_dir + "/index.tsx"],

	output: {
		filename: "bundle.js",
		path: build_dir,
		publicPath: "/",
	},

	resolve: {
		modules: [
			src_dir,
			"node_modules",
		],
		extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: "Roll-Cal",
			template: "src/index.html",
			minify: false,
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
						outputPath: "/",
					}
				}
			},
			{
				test: /(browserconfig.xml|site.webmanifest)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "/images/",
					}
				}
			},
			{
				test: /\.jsx?/,
				include: src_dir,
				loader: "babel-loader",
			},
			{
				test: /\.tsx?/,
				include: src_dir,
				loader: "babel-loader",
			},
/*			{
			  test: /\.js$/,
			  use: ["source-map-loader"],
			  enforce: "pre"
			},*/
			{
				test: /\.(eot|ttf|woff|woff2)$/,
				use: {					
					loader: "file-loader",
					options: {
						name: "[name].[ext]",
						outputPath: "fonts/",
					}
				}
			},
			{
				test: /\.(css|scss|sass)$/,
				loader: ["style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.ico$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "images/",
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
							outputPath: "images/",
						}
					},
					{
						loader: "image-webpack-loader",
						options: {
							mozjpeg: {
								progressive: true,
								quality: 75,
							},
							optipng: {
								enabled: false,
							},
							pngquant: {
								enabled: false,
							},
							gifsicle: {
								interlaced: false,
							},
						}
					},
				],
			}
		],
	},

};

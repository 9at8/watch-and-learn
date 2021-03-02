import * as path from "path";
import * as webpack from "webpack";

const IS_PROD = process.env.NODE_ENV === "production";

const config: webpack.Configuration = {
  mode: IS_PROD ? "production" : "development",

  devtool: IS_PROD ? undefined : "cheap-source-map",

  entry: {
    "content-script": "./src/content-script.ts",
    popup: "./src/popup.ts",
  },

  output: {
    path: path.resolve(__dirname, "build"),
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  optimization: {
    minimize: false,
  },
};

export default config;

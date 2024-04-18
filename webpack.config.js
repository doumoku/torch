const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  context: __dirname + "/src",
  entry: { torch: "./torch.mjs" },
  output: {
    filename: "[name].js", // [name] will take whatever the input filename is. defaults to 'main' if only a single entry value
    path: path.resolve(__dirname, "dist"), // the folder containing you final dist/build files. Default to './dist'
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    // the plugin to extract our css into separate .css files
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
  ],
  devtool: "source-map", // supposedly the ideal type without bloating bundle size}
};

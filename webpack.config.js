const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

const dist = path.resolve(__dirname, "dist");

module.exports = {
  mode: "production",
  entry: {
    index: "./src/main.ts"
  },
  output: {
    path: dist,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: [
          /node_modules/,
          /lib/,
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", "wasm"],
  },
  devServer: {
    static: dist,
    open: false,
  },
  plugins: [
    new CopyPlugin([
      path.resolve(__dirname, "static")
    ]),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "lib"),
      outDir: path.resolve(__dirname, "dist/lib"),
      withTypeScript: true,
      extraArgs: "--target web",
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
  },
};

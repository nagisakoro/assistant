var path = require("path");
const fs = require("fs");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const isDevelopmentServer = process.env.npm_lifecycle_event === "build:devServer";
const isTesting = process.env.npm_lifecycle_event === "build:test";
const isProduction = process.env.npm_lifecycle_event === "build:prod";

const out = path.resolve("./out");
const src = path.resolve("./src");

const folder = {
  src: {
    images: path.resolve(src, "images"),
    maSource: path.resolve(src, "ma_source"),
    environment: path.resolve(src, "environment"),
    popup: path.resolve(src, "popup"),
  },
  out: {
    images: path.resolve(out, "images"),
    maSource: path.resolve(out, "ma_source"),
    environment: path.resolve(out, "environment"),
    popup: path.resolve(out, "popup"),
  },
};

const manifest = {
  src: require(`${src}/manifest.json`),
  out: path.join(out, "manifest.json"),
};

manifest.data = JSON.stringify(manifest.src, null, 4);
if (!fs.existsSync(out)) {
  fs.mkdirSync(out);
}
fs.writeFileSync(manifest.out, manifest.data);

const clean = new CleanWebpackPlugin(out, { exclude: ["manifest.json"] });

const assets = new CopyWebpackPlugin([
  {
    from: `${folder.src.images}/*`,
    to: `${folder.out.images}/[name].[ext]`,
  },
  {
    from: `${
      isProduction
        ? path.resolve(folder.src.environment, "ma-prod-env.js")
        : isTesting
        ? path.resolve(folder.src.environment, "ma-test-env.js")
        : isDevelopmentServer
        ? path.resolve(folder.src.environment, "ma-dev-server-env.js")
        : path.resolve(folder.src.environment, "ma-dev-local-env.js")
    }`,
    to: `${path.resolve(folder.out.environment, "ma-environment.js")}`,
  },
  {
    from: `${path.resolve(folder.src.maSource, "ma-runtime-script.js")}`,
    to: `${path.resolve(folder.out.maSource, "ma-runtime-script.js")}`,
  },
  {
    from: `${folder.src.maSource}/static_files`,
    to: `${folder.out.maSource}/static_files`,
  },
  {
    from: `${src}/popup`,
    to: `${out}/popup`,
  },
  {
    from: `${src}/background`,
    to: `${out}/background`,
  },
  {
    from: `${src}/common-service`,
    to: `${out}/common-service`,
  },
]);

const entry = {
  "bpm-case-page-script": path.resolve(folder.src.maSource, "bpm-case-page-script.js"),
  "lk-pages-script": path.resolve(folder.src.maSource, "lk-pages-script.js"),
};

const output = { path: folder.out.maSource, filename: "[name].js" };

const plugins = [clean, assets];

const CONFIG = {
  entry: entry,
  output: output,
  plugins: plugins,
};

module.exports = CONFIG;

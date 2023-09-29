const {src, dest, watch, series, parallel} = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const cleancss = require("gulp-clean-css");
const del = require("del");
const zip = require("gulp-zip");
const inject = require("gulp-inject");
const ws = require("ws");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const htmlmin = require("gulp-htmlmin");
const through = require("through2");
const { walkUpBindingElementsAndPatterns } = require("typescript");

let wss = undefined;

function reload(callback) {
  //browserSync.reload();
  //browserSync.sockets.emit("extension:reload");
  for (let client of wss.clients) {
    client.send("reload");
  }
	callback(); //Success indication for gulp.watch()
}

function html() {
	return src("./src/**/*.html")
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true
  }))
	.pipe(dest("./output"));
}

function misc() {
  return src("./src/manifest.json")
  .pipe(dest("./output"));
}

function misc_dev() {
  return src("./src/manifest.json")
  .pipe(through.obj((file, encoding, callback) => {
    callback(null, ((file) => {
      const manifest = JSON.parse(file.contents.toString());

      manifest.content_security_policy["connect-src"] = "ws://127.0.0.1:9000";

      const res = JSON.stringify(manifest, null, 2);
      const newBuffer = Buffer.alloc(res.length, res);
      file.contents = newBuffer;
      return file;
    })(file))
  }))
  .pipe(dest("./output"));
}

function icons() {
  return src("./src/icons/**/*")
	.pipe(imagemin())
  .pipe(dest("./output/icons"));
}

function images() {
	return src("./src/images/**/*")
	.pipe(imagemin())
	.pipe(dest("./output/images"));
}

function filters() {
  return src("./src/styles/filters.svg")
  .pipe(dest("./output/styles"));
}

function styles() {
	return src("./src/styles/main.scss")
	.pipe(sass().on("error", sass.logError))
	.pipe(autoprefixer())	//browsers support list in .browserslistrc
	.pipe(cleancss())
	.pipe(dest("./output/styles"));
}

function scripts_dev() {
  return tsProject.src().pipe(tsProject()).js.pipe(dest("./output/scripts"));
}

var scripts_prod = series(
  scripts_temp,
  bundle,
  uglf
);

function uglf() {
  return src("./temp/scripts/main.js")
    .pipe(uglify())
    .pipe(dest("./output/scripts"))
}

function scripts_temp() {
  return tsProject.src()
    .pipe(tsProject()).js
    .pipe(babel({presets: [["@babel/preset-env", {useBuiltIns: "usage", corejs: 3}]]}))
    .pipe(dest("./temp/scripts"))
}

function bundle() {
  return browserify("./temp/scripts/main.js")
    .bundle()
    .pipe(source("main.js"))
    .pipe(dest("./temp/scripts"))
}

function html_injected() {
	return src("./src/index.html")
  .pipe(inject(
    src("./inject.js")
    .pipe(babel({presets: ["@babel/preset-env"]}))
    .pipe(uglify())
    .pipe(dest("./output")), {
      removeTags: true,
      relative: false,
      ignorePath: "/output/"
//      transform: (filePath, file) => {
//        return "<script>" + file.contents.toString('utf8') + "</script>";
//      }
    }
  ))
	.pipe(dest("./output"));
}

function server() {
  wss = new ws.Server({port: 9000});
//	browserSync.init({
//		server: {baseDir: "./output"},
//		minify: false,
//		host: "127.0.0.1",
//    browser: "brave",
//    open: false
//	}, (e) => {
//    console.log("BrowserSync running...", e);
//    browserSync.emitter.on("client:connected", () => {
//      console.log("CONNECTED");
//      browserSync.sockets.emit("pog");
//    });
//  });
	watch(["./src/**/*.html", "inject.js"], series(html_injected, reload));
	watch("./src/styles/**/*.scss", series(styles, reload));
	watch("./src/scripts/**/*.ts", series(scripts_dev, reload));
  watch("./src/manifest.json", series(misc, reload));
  watch("./src/icons/**/*", icons);
}

function archive() {
	return src("./output/**/*")
	.pipe(zip("build.xpi", {compress:false}))
	.pipe(dest("./"))
}

function archive_source() {
  return src(["./src/**/*", ".browserslistrc", "README.md", "gulpfile.js", "inject.js", "package.json", "package-lock.json", "tsconfig.json"], {base: "."})
  .pipe(zip("cwnewtab_source.zip"))
  .pipe(dest("./"))
}

var clean = del.bind(null, ["output", "build.xpi"]);
var build = series(clean, parallel(filters, icons, misc, html, images, styles, scripts_prod))
var build_dev = series(clean, parallel(filters, icons, misc_dev, html_injected, images, styles, scripts_dev))

var build_prod = series(build, archive, archive_source)

exports.html = html
exports.misc = misc
exports.images = images
exports.styles = styles
exports.scripts = scripts_prod
exports.build = build_prod
exports.build_dev = series(build_dev, server)
exports.server = server
exports.clean = clean
exports.default = build_prod

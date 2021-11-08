const {src, dest, watch, series, parallel} = require("gulp");
//const browserSync = require("browser-sync").create();
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
//require("core-js");
//require("regenerator-runtime/runtime");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const cleancss = require("gulp-clean-css");
const del = require("del");
const tar = require("gulp-tar");
const gzip = require("gulp-gzip");
const inject = require("gulp-inject");
const ws = require("ws");
const browserify = require("browserify");
const watchify = require("watchify");
const babelify = require("babelify");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

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
	.pipe(dest("./output"));
}

function misc() {
  return src("./src/manifest.json")
  .pipe(dest("./output"));
}

function icons() {
  return src("./src/**/*.svg")
  .pipe(dest("./output"));
}

function images() {
	return src("./src/images/**/*")
	.pipe(imagemin())
	.pipe(dest("./output/images"));
}

function styles() {
	return src("./src/styles/main.scss")
	.pipe(sass().on("error", sass.logError))
	.pipe(autoprefixer())	//browsers support list in .browserslistrc
	.pipe(cleancss())
	.pipe(dest("./output/styles"));
}

let customOpts = {
  entries: ['./src/scripts/main.js'],
  debug: true
};

let opts = Object.assign({}, watchify.args, customOpts);
let b = watchify(browserify(opts));

function scripts() {
  return tsProject.src().pipe(tsProject()).js.pipe(dest("./output/scripts"));

	return src("./src/scripts/**/*.js")
//	.pipe(babel({presets: [["@babel/preset-env", {useBuiltIns: "usage", corejs: 3}]]}))
//  .pipe((stream) => browserify(stream).bundle())
//	.pipe(uglify())
	.pipe(dest("./output/scripts"));

  return b
  .transform("babelify", {presets: [["@babel/preset-env", {useBuiltIns: "usage", corejs: 3}]]})
  .bundle()
  //Add output file
  .pipe(source("main.js"))
  .pipe(buffer())
  .pipe(dest("./output/scripts"));


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
	watch("./src/scripts/**/*.ts", series(scripts, reload));
  watch("./src/manifest.json", series(misc, reload));
  watch("./src/**/*.svg", icons);
}

function archive() {
	return src("./output/**/*")
	.pipe(tar("build.tar"))
	.pipe(gzip())
	.pipe(dest("./"))
}

var clean = del.bind(null, ["output", "build.tar.gz"]);
var build = series(clean, parallel(icons, misc, html, images, styles, scripts))
var build_dev = series(clean, parallel(icons, misc, html_injected, images, styles, scripts))

exports.html = html
exports.images = images
exports.styles = styles
exports.scripts = scripts
exports.build = series(build, archive)
exports.server = server
exports.clean = clean
exports.default = series(build_dev, server)

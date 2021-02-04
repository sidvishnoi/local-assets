// @ts-check
const path = require("path");
const { existsSync } = require("fs");

const main = require("./index.js");
const { defaultLogger, ensureEnd } = require("./utils.js");

try {
	const { url, dir } = processArgv(process.argv.slice(2));
	const logger = createLogger(!!process.env.VERBOSE);
	main(url, dir, logger).catch(error => {
		console.error(error.message);
		process.exit(1);
	});
} catch (error) {
	console.error(error.message);
	process.exit(1);
}

/**
 * @param {string[]} args
 * TODO: refactor
 */
function processArgv(args) {
	if (!args.length) {
		throw new Error("Missing file path/URL.");
	}

	if (args.length === 1) {
		return { dir: undefined, url: asURL(args[0]) };
	}

	const dirIndex = args.findIndex(s => s === "-o");
	if (dirIndex !== -1) {
		const dir = args[dirIndex + 1];
		if (!dir) {
			throw new Error("Missing destination directory.");
		}
		args.splice(dirIndex, 2);
		const fileOrUrl = args.find(s => s);
		const url = asURL(fileOrUrl);
		return { dir: path.resolve(ensureEnd(dir, "/")), url };
	}

	return { dir: undefined, url: asURL(args.find(s => s)) };
}

/** @param {string} url */
function asURL(url) {
	try {
		return new URL(url);
	} catch {
		if (!existsSync(url)) {
			throw new Error(`ENOENT (No such file): ${url}`);
		}
		if (!path.resolve(url).startsWith(process.cwd())) {
			throw new Error(
				`Input file must be present in the current working directory.`,
			);
		}
		url = path.resolve(url).replace(/\\/g, "/");
		if (url[0] !== "/") {
			url = "/" + url;
		}
		return new URL(encodeURI("file://" + url));
	}
}

/**
 * @param {boolean} verbose
 */
function createLogger(verbose) {
	if (!verbose) {
		return defaultLogger;
	}
	return {
		log: msg => console.log(msg),
		info: msg => console.error(`[INFO] ${msg}`),
	};
}

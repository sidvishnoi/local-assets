// @ts-check
const path = require("path");
const { existsSync } = require("fs");
const { mkdir, copyFile } = require("fs").promises;
const { getAllSubResources } = require("subresources");
const { defaultLogger, ensureEnd } = require("./utils.js");

module.exports = main;
/**
 * @param {URL} url
 * @param {string} dir
 */
async function main(url, dir, logger = defaultLogger) {
	if (dir) {
		logger.info(`Destination directory for copied assets: ${dir}`);
		await mkdir(dir, { recursive: true });
	}

	logger.info(`Navigating to ${url}`);
	let copyCount = 0;
	/** @type {Map<string, string>} */
	const copiedAssets = new Map();
	const baseDir = getBaseDir(url);
	for await (const { name } of getSameOriginAssets(url)) {
		const srcPath = path.join(baseDir, name);
		if (isLocal(srcPath)) {
			logger.log(rel(srcPath));
			if (dir) {
				const destinationPath = path.resolve(path.join(dir, rel(srcPath)));
				await mkdir(path.dirname(destinationPath), { recursive: true });
				logger.info(`[COPY] ${rel(srcPath)} >>> ${rel(destinationPath)}`);
				await copyFile(srcPath, destinationPath);
				copiedAssets.set(srcPath, destinationPath);
				copyCount += 1;
			}
		}
	}
	logger.info(`Copied ${copyCount} files.`);
	return copiedAssets;
}

/**
 * @param {URL} url
 */
async function* getSameOriginAssets(url) {
	const baseURL = getBaseURL(url).href;
	for await (const subresource of getAllSubResources(url)) {
		const assetURL = new URL(subresource.url);
		if (assetURL.origin === url.origin) {
			const relPath = path.relative(baseURL, assetURL.href);
			yield {
				type: subresource.type,
				name: relPath,
			};
		}
	}
}

/**
 * @param {URL} url
 */
function getBaseURL(url) {
	if (url.href.endsWith("/")) return url;
	return new URL(`${ensureEnd(path.dirname(url.pathname), "/")}`, url);
}

/**
 * @param {URL} url
 */
function getBaseDir(url) {
	if (url.protocol !== "file:") {
		return path.join(process.cwd(), getBaseURL(url).pathname);
	}
	const dir = path.dirname(
		path.relative(process.cwd(), url.href.replace(url.protocol, "")),
	);
	return path.resolve(dir);
}

/**
 * @param {string} srcPath
 */
function isLocal(srcPath) {
	return srcPath.startsWith(process.cwd()) && existsSync(srcPath);
}

/**
 * Get path relative to current working directory.
 * @param {string} fullPath
 */
function rel(fullPath) {
	return path.relative(process.cwd(), fullPath);
}

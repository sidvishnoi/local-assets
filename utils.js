const defaultLogger = {
	log: _msg => {},
	info: _msg => {},
};

/**
 * @param {string} s
 * @param {string} end
 */
function ensureEnd(s, end) {
	return s.endsWith(end) ? s : `${s}${end}`;
}

module.exports = {
	defaultLogger,
	ensureEnd,
};

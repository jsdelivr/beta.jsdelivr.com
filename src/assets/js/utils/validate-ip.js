module.exports = {
	test: (address) => {
		let ipv4Pattern = new RegExp('^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');

		return ipv4Pattern.test(address);
	},
};
const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
const screenType = {
	mobile: 480,
	tablet: 768,
	mdDesktop: 992,
	lgDesktop: 1200,
	xlDesktop: 1400,
};

module.exports = {
	screenType,
	isTabletScreen () {
		return screen.width > screenType.mobile && screen.width <= screenType.tablet;
	},
	isMobileScreen () {
		return screen.width <= screenType.mobile;
	},
	flattenFiles: function flattenFiles (tree, path = '/', files = []) {
		tree.forEach((item) => {
			if (item.type === 'file') {
				files.push(path + item.name);
			} else {
				flattenFiles(item.files, path + item.name + '/', files);
			}
		});

		return files;
	},
	formatDate (date) {
		return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
	},
	formatHits (hits) {
		if (hits < 1e9) {
			return 1;
		}

		return Math.round(hits / 1e9);
	},
	formatMiB2TiB (mb) {
		return Math.floor(mb / 1024 / 1024 / 10) * 10;
	},
	formatNumber (number) {
		return Math.floor(number).toString().replace(/\d(?=(?:\d{3})+$)/g, '$& ');
	},
	formatNumberWithSpace (val) {
		// remove sign if negative
		let sign = 1;

		if (val < 0) {
			sign = -1;
			val = -val;
		}

		let num = val.toString().includes('.') ? val.toString().split('.')[0] : val.toString();

		while (/(\d+)(\d{3})/.test(num.toString())) {
			num = num.toString().replace(/(\d+)(\d{3})/, '$1 $2');
		}

		if (val.toString().includes('.')) {
			num = num + '.' + val.toString().split('.')[1];
		}

		return sign < 0 ? '-' + num : num;
	},
	getMinifiedName (name) {
		return name.replace(/\.(js|css)$/i, '.min.$1');
	},
	getNonMinifiedName (name) {
		return name.replace(/\.min\.(js|css)$/i, '.$1');
	},
	listFiles: function listFiles (files = [], path) {
		if (!path.length) {
			return files;
		}

		let p = path.slice();
		let n = p.shift();
		let d = files.filter(f => f.name === n)[0];

		return d && d.files ? listFiles(d.files, p) : null;
	},
	linRange (max, number) {
		let array = [];

		for (let i = 1; i <= number; i++) {
			array.push(max * i / number);
		}

		return array;
	},
	logRange (min, max) {
		let array = [];

		for (let i = min; i <= max; i *= 10) {
			array.push(i);
		}

		return array;
	},
	multiplyDeep: function multiplyDeep (data, n) {
		if (typeof data !== 'object') {
			return data;
		}

		Object.keys(data).forEach((key) => {
			if (key !== 'rank' && typeof data[key] === 'number') {
				data[key] *= n;
			} else if (data[key] && typeof data[key] === 'object') {
				multiplyDeep(data[key], n);
			}
		});

		return data;
	},
	nth (n) {
		n = Math.floor(n);
		let m = n % 10;

		if (n === 1) {
			return '';
		} else if (n > 20 && m === 1) {
			return `${n}st`;
		} else if (n === 2 || (n > 20 && m === 2)) {
			return `${n}nd`;
		} else if (n === 3 || (n > 20 && m === 3)) {
			return `${n}rd`;
		}

		return `${n}th`;
	},

	getChartXAxisData (periodDates, period = 'month', periodGroupBy = 'day') {
		let dataPerMonths = [];
		let chartXData = [];

		periodDates.forEach((date) => {
			let splittedDate = date.split('-');
			let dateYear = splittedDate[0];
			let dateMonth = splittedDate.slice(0, 2).join('-');
			let periodMonthFormatted = months[new Date(dateMonth).getUTCMonth()];

			if (!dataPerMonths[`${dateYear} ${periodMonthFormatted}`]) {
				dataPerMonths[`${dateYear} ${periodMonthFormatted}`] = [];
			}

			dataPerMonths[`${dateYear} ${periodMonthFormatted}`].push(date);
		});

		let labelArea = 0;
		Object.keys(dataPerMonths).forEach((yearMonthKey) => {
			// let middleLength = Math.round(dataPerMonths[yearMonthKey].length / 2);

			dataPerMonths[yearMonthKey].forEach((day, idx) => {
				// for every case except we set month in the start of the days
				// if period is year we should return month for every day since it will be filtered on ticks callback as needed
				let year = yearMonthKey.split(' ')[0];
				let month = yearMonthKey.split(' ')[1];

				labelArea++;

				if (period === 'year') {
					if (idx === 0) {
						if (periodGroupBy === 'day' && dataPerMonths[yearMonthKey].length > 15 && labelArea < 359) {
							chartXData.push([ day, month, year ]);
							return;
						} else if (periodGroupBy === 'week' && (labelArea > 0 && labelArea < 54)) {
							chartXData.push([ day, month, year ]);
							return;
						} else if (periodGroupBy === 'month' && (labelArea < 12)) {
							chartXData.push([ day, month, year ]);
							return;
						}
					}

					if (periodGroupBy !== 'month') {
						chartXData.push([ day, '', '' ]);
					}
				} else if (idx === 0) {
					if (periodGroupBy === 'month') {
						chartXData.push([ '', month ]);
					} else if (dataPerMonths[yearMonthKey].length > 1) {
						chartXData.push([ day, month ]);
					}
				} else {
					chartXData.push([ day, '' ]);
				}
			});
		});

		return chartXData;
	},
	// escaping code: https://github.com/component/escape-html/blob/master/index.js
	unescapeHtml (text) {
		return text
			.replace(/&quot;/g, '"')
			.replace(/&amp;/g, '&')
			.replace(/&#39;/g, '\'')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>');
	},
	// ignoreExtremlySmallValue: true when you need to find min value for the axis min e.g.
	getValueByMagnitude (value, rounding = 'round', magnitudeCorrection = 0, ignoreExtremlySmallValue = true) {
		let magnitude = Math.floor(Math.log10(value) === -Infinity ? 0 : Math.log10(value)) - magnitudeCorrection;

		if (ignoreExtremlySmallValue && value < 10) { return rounding === 'ceil' ? 10 : 0; }

		switch (rounding) {
			case 'round':
				return Math.round(value / Math.pow(10, magnitude)) * Math.pow(10, magnitude);
			case 'ceil':
				return Math.ceil(value / Math.pow(10, magnitude)) * Math.pow(10, magnitude);
			case 'floor':
				return Math.floor(value / Math.pow(10, magnitude)) * Math.pow(10, magnitude);
		}
	},

	convertBytesToUnits (bytesAmount, units = 'GB') {
		let unitsBase = null;

		switch (units) {
			case 'kB':
				unitsBase = 1e3;
				break;
			case 'MB':
				unitsBase = 1e6;
				break;
			case 'GB':
				unitsBase = 1e9;
				break;
			case 'TB':
				unitsBase = 1e12;
				break;
			case 'PB':
				unitsBase = 1e15;
				break;
			case 'EB':
				unitsBase = 1e18;
				break;
			default:
				unitsBase = 1e9;
		}

		return Math.round(bytesAmount / unitsBase);
	},

	findUnitFromNumber (num) {
		let lookup = [
			{ value: 1e4, symbol: 'kB' },
			{ value: 1e7, symbol: 'MB' },
			{ value: 1e10, symbol: 'GB' },
			{ value: 1e13, symbol: 'TB' },
			{ value: 1e16, symbol: 'PB' },
			{ value: 1e19, symbol: 'EB' },
		];
		let unit = lookup.slice().reverse().find((item) => {
			return num >= item.value;
		});

		if (!unit) {
			return '';
		}

		return unit.symbol;
	},

	autoConvertBytesToUnits (num, numSymbolSeparator = ' ') {
		let lookup = [
			{ value: 1, symbol: '' },
			{ value: 1e3, symbol: 'K' },
			{ value: 1e6, symbol: 'M' },
			{ value: 1e9, symbol: 'G' },
			{ value: 1e12, symbol: 'T' },
			{ value: 1e15, symbol: 'P' },
			{ value: 1e18, symbol: 'E' },
		];
		let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

		let item = lookup.slice().reverse().find((item) => {
			return num >= item.value;
		});

		return item ? (num / item.value).toFixed(1).replace(rx, '$1') + numSymbolSeparator + item.symbol : '0';
	},
	makeHTTPRequest (obj) {
		let { method = 'GET', rawResponse = false, body, url, headers } = obj;

		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open(method || 'GET', method === 'GET' && body ? url + this.createQueryString(body) : url);

			if (headers) {
				Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));
			}

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(rawResponse ? xhr.response : JSON.parse(xhr.response));
				} else {
					reject(xhr.statusText);
				}
			};

			xhr.onerror = () => reject(xhr.statusText);
			xhr.send(body);
		});
	},
	createQueryString (params) {
		return '?' + Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
	},
	deepExtend (out = {}, ...rest) {
		for (let i = 0; i < rest.length; i++) {
			let obj = rest[i];

			if (!obj) { continue; }

			for (let key in obj) {
				if (Object.hasOwn(obj, key)) {
					if (typeof obj[key] === 'object' && obj[key] !== null) {
						if (obj[key] instanceof Array) {
							out[key] = obj[key].slice(0);
						} else {
							out[key] = this.deepExtend(out[key], obj[key]);
						}
					} else {
						out[key] = obj[key];
					}
				}
			}
		}

		return out;
	},
	onDocumentReady (fn) {
		if (document.readyState !== 'loading') {
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	},
};

require('./polyfills');

const _ = require('./_');
const has = require('./utils/has');
const cAbout = require('../../views/pages/about.html');
const cGithub = require('../../views/pages/github.html');
const cFoundationCdn = require('../../views/pages/foundationcdn.html');
const cUnpkg = require('../../views/pages/unpkg.html');
const cGoogle = require('../../views/pages/google.html');
const cBecomeASponsor = require('../../views/pages/become-a-sponsor.html');
const cIndex = require('../../views/pages/_index.html');
const cNetwork = require('../../views/pages/network.html');
const cNetworkInfographic = require('../../views/pages/network/infographic.html');
const cNewJsdelivr = require('../../views/pages/new-jsdelivr.html');
const cPackage = require('../../views/pages/_package.html');
const cSponsors = require('../../views/pages/sponsors.html');
const cStatistics = require('../../views/pages/statistics.html');
const cSri = require('../../views/pages/using-sri-with-dynamic-files.html');
const cPP = require('../../views/pages/terms.html');
const cPurge = require('../../views/pages/tools/purge.html');
const cEsm = require('../../views/pages/esm.html');
const cHistory = require('../../views/pages/history.html');
const cGsap = require('../../views/pages/gsap.html');
const cSkypack = require('../../views/pages/skypack.html');
const cEsmsh = require('../../views/pages/esmsh.html');
const cCustomCdnOss = require('../../views/pages/custom-cdn-oss.html');
const cCustomCdnOssProject = require('../../views/pages/custom-cdn-oss-project.html');
const cDocumentation = require('../../views/pages/documentation.html');

Ractive.DEBUG = location.hostname === 'localhost';

// Redirect from the old URL format.
if (location.pathname === '/' && location.hash) {
	location.href = '/projects/' + location.hash.substr(2);
}

let app = {
	config: {
		animateScrolling: true,
	},
	usedCdn: '',
};

app.router = new Ractive.Router({
	el: '#page',
	data () {
		return {
			app,
			collection: has.localStorage() && localStorage.getItem('collection2') ? JSON.parse(localStorage.getItem('collection2')) : [],
		};
	},
	globals: [ 'query', 'collection' ],
});

let routerDispatch = Ractive.Router.prototype.dispatch;

Ractive.Router.prototype.dispatch = function (...args) {
	routerDispatch.apply(this, args);

	if (!app.router.route.view) {
		return;
	}

	document.title = app.router.route.view.get('title') || 'jsDelivr - A free, fast, and reliable CDN for JS and open source';
	document.querySelector('meta[name=description]').setAttribute('content', app.router.route.view.get('description') || 'Optimized for JS and ESM delivery from npm and GitHub. Works with all web formats. Serving more than 150 billion requests per month.');

	return this;
};

app.router.addRoute('/', cIndex, { qs: [ 'docs', 'limit', 'page', 'query', 'type', 'style' ] });
app.router.addRoute('/esm', cEsm);
app.router.addRoute('/about', cAbout);
app.router.addRoute('/rawgit', () => { location.pathname = '/'; });
app.router.addRoute('/features', () => { location.pathname = '/'; });
app.router.addRoute('/github', cGithub);
app.router.addRoute('/foundationcdn', cFoundationCdn);
app.router.addRoute('/unpkg', cUnpkg);
app.router.addRoute('/google', cGoogle);
app.router.addRoute('/become-a-sponsor', cBecomeASponsor);
app.router.addRoute('/network', cNetwork);
app.router.addRoute('/network/infographic', cNetworkInfographic);
app.router.addRoute('/new-jsdelivr', cNewJsdelivr);
app.router.addRoute('/package/:type(npm)/:scope?/:name', cPackage, { qs: [ 'path', 'tab', 'version', 'nav' ] });
app.router.addRoute('/package/:type(gh)/:user/:repo', cPackage, { qs: [ 'path', 'tab', 'version', 'nav' ] });
app.router.addRoute('/sponsors', cSponsors);
app.router.addRoute('/statistics', cStatistics);
app.router.addRoute('/tools/purge', cPurge);
app.router.addRoute('/using-sri-with-dynamic-files', cSri);
app.router.addRoute('/terms', cPP);
app.router.addRoute('/terms/:currentPolicy', cPP);
app.router.addRoute('/history', cHistory);
app.router.addRoute('/gsap', cGsap);
app.router.addRoute('/skypack', cSkypack);
app.router.addRoute('/esmsh', cEsmsh);
app.router.addRoute('/custom-cdn-oss', cCustomCdnOss);
app.router.addRoute('/custom-cdn-oss/:name', cCustomCdnOssProject);
app.router.addRoute('/documentation', cDocumentation);
app.router.addRoute('/(.*)', () => { location.pathname = '/'; });

_.onDocumentReady(() => {
	let state = {};
	let ractive = new Ractive();
	ractive.set('@shared.app', app);

	let unescape = (string) => {
		return string
			.replace(/&gt;/g, '>')
			.replace(/&lt;/g, '<')
			.replace(/&amp;/g, '&');
	};

	try {
		let shared = JSON.parse(unescape(document.querySelector('#ractive-shared').innerHTML.trim()));

		if (shared) {
			Object.keys(shared).forEach((key) => {
				ractive.set(`@shared.${key}`, shared[key]);
			});
		}
	} catch (e) {}

	try {
		state = JSON.parse(unescape(document.querySelector('#ractive-data').innerHTML.trim()));
	} catch (e) {}

	app.router
		.init({ noScroll: true, state })
		.watchLinks()
		.watchState();
});

module.exports = app;

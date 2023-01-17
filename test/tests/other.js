const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('other', () => {
	it('network page loads', async () => {
		await browser.navigate().to(`${BASE_URL}/network`);
		await expect(browser.findElement({ css: '.page-title' }).getText()).to.eventually.contain('Network');
	});

	it('stats page loads', async () => {
		await browser.navigate().to(`${BASE_URL}/statistics`);
		await expect(browser.findElement({ css: '.head-text' }).getText()).to.eventually.contain('Global internet insights');
	});

	it('sponsors page loads', async () => {
		await browser.navigate().to(`${BASE_URL}/sponsors`);
		await expect(browser.findElement({ css: '.head-title' }).getText()).to.eventually.contain('Our Sponsors');
	});

	it('cache purge tool page loads', async () => {
		await browser.navigate().to(`${BASE_URL}/tools/purge`);
		await expect(browser.findElement({ css: 'h1' }).getText()).to.eventually.contain('Purge jsDelivr CDN cache');
	});
});

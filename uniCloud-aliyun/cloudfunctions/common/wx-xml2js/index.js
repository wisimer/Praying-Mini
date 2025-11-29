var xml2js = require('xml2js');

module.exports = async function(e) {
	let obj = await xml2js.parseStringPromise(e, { explicitArray: false })
	return obj.xml;
}
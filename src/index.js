const express = require('express');
const request = require('sync-request');
const app = express();
const port = 3000;


function Output(success = false, message = null, data = null) {
	this.success = success;
	this.message = message;
	this.data = null;
}


function CheckUserIP(ip_address, user_agent, language) {
	var key = process.env['IP_QUALITY_API_KEY'];
	var strictness = 1; // This optional parameter controls the level of strictness for the lookup. Setting this option higher will increase the chance for false-positives as well as the time needed to perform the IP analysis. Increase this setting if you still continue to see fraudulent IPs with our base setting (level 1 is recommended) or decrease this setting for faster lookups with less false-positives. Current options for this parameter are 0 (fastest), 1 (recommended), 2 (more strict), or 3 (strictest).
	var allow_public_access_points = 'true'; // Bypasses certain checks for IP addresses from education and research institutions, schools, and some corporate connections to better accommodate audiences that frequently use public connections. This value can be set to true to make the service less strict while still catching the riskiest connections.
	var url = "https://www.ipqualityscore.com/api/json/ip/" + key + "/" + ip_address + "?user_agent=" + user_agent + "&user_language=" + language + "&strictness=" + strictness + "&allow_public_access_points=" + allow_public_access_points;
	var result = get_IPQ_URL(url);
	if (result !== null) {
		return result;
	}
	else {
		// Throw error, no response received.
	}
}


function get_IPQ_URL(url) {
	try {
		var response = request('GET', url);
		return JSON.parse(response.getBody());
	}
	catch (error) {
		return null;
	}
}


function ValidIP(ip_address, user_agent, language) {
	var allowCrawlers = true; // Allow verified search engine crawlers from Google, Bing, Yahoo, DuckDuckGo, Baidu, Yandex, and similar major search engines. This setting is useful for preventing SEO penalties on front end placements.
	var fraudScoreMinBlock = 75; // Minimum Fraud Score to determine a fraudulent or high risk user
	var fraudScoreMinBlockForMobiles = 75; // Minimum Fraud Score to determine a fraudulent or high risk user for MOBILE Devices
	var lowerPenaltyForMobiles = false; // Prevents false positives for mobile devices - if set to true, this will only block VPN connections, Tor connections, and Fraud Scores greater than the minimum values set above for mobile devices. This setting is meant to provide greater accuracy for mobile devices due to mobile carriers frequently recycling and sharing mobile IP addresses. Please be sure to pass the "user_agent" (browser) for this feature to work. This setting ensures that the riskiest mobile connections are still blacklisted.
	
	var ip_result = CheckUserIP(ip_address, user_agent, language);
	
	if (ip_result !== null) {
		if (allowCrawlers === true) {
			if (typeof ip_result !== 'undefined' && ip_result['is_crawler'] === true) {
				return false;
			}
		}
		if (ip_result['mobile'] === true && lowerPenaltyForMobiles === true) {
			if (typeof ip_result['fraud_score'] !== 'undefined' && ip_result['fraud_score'] >= fraudScoreMinBlockForMobiles) {
				return true;
			}
			else if (typeof ip_result['vpn'] !== 'undefined' && ip_result['vpn'] === true) {
				return ip_result['vpn'];
			}
			else if (typeof ip_result['tor'] !== 'undefined' && ip_result['tor'] === true) {
				return ip_result['tor'];
			}
			else {
				return false;
			}	
		}
		else {
			if (typeof ip_result['fraud_score'] !== 'undefined' &&  ip_result['fraud_score'] >= fraudScoreMinBlock) {
				return true;
			}
			else if (typeof ip_result['proxy'] !== 'undefined'){
				return ip_result['proxy'];
			}
			else {
				// Throw error, response is invalid.
			}
		}
	}
	else {
	    return false;
	}
}


app.enable('trust proxy'); // Allows Accurate Usage of req.ip


app.get('/', (req, res) => {
	var ip_address = req.ip;
	var user_agent = req.headers['user-agent'];
	var language = req.headers['accept-language'];
	console.log(ip_address + ":: " + user_agent + " :: " + language);
	if (ValidIP(ip_address, user_agent, language) === true) {
		return res.send(new Output(true, 'Proxy, VPN, or Risky User'));
	}
	else {
		return res.send(new Output(true, 'Clean IP/User'));
	}
});


app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)
});

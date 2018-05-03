const express = require("express");
const router = express.Router();

router.get("/getAllCountries", (req, res, next) => {
	let query = "select * from countries order by country_name";

		res.locals.connection.query(query, (error, results, fields) => {

				res.locals.connection.end();

				if (error) {
					console.error(error);
					res.send(JSON.stringify({
						status: 500,
						response: "There was an error.  Please try again."
					}));
				} else {
					res.send(JSON.stringify({
						status: 200,
						error: null,
						response: results
					}));
				}
			}
		);
});

router.get("/getCountriesByCodes/:countryIds?", (req, res, next) => {
	let query = "select * from countries";

	if (req.params.countryIds) {
		let countries = req.params.countryIds.split(",");
		query += " where country_code in ("
			for (let c = 0; c < countries.length; c ++) {
				query += (query[query.length - 1] === "(" ? "" : ",") + res.locals.connection.escape(countries[c]);
			}
		query += ")";
	}

	res.locals.connection.query(query, (error, results, fields) => {

				res.locals.connection.end();

				if (error) {
					console.error(error);
					res.send(JSON.stringify({
						status: 500,
						response: "There was an error.  Please try again."
					}));
				} else {
					res.send(JSON.stringify({
						status: 200,
						error: null,
						response: results
					}));
				}

		}
	);
});

router.get("/getRegionsByCountry/:countryId", (req, res, next) => {
	let query = "select * from regions where region_country = " + res.locals.connection.escape(req.params.countryId) + " order by region_name";

	res.locals.connection.query(query, (error, results, fields) => {

				res.locals.connection.end();

				if (error) {
					console.error(error);
					res.send(JSON.stringify({
						status: 500,
						response: "There was an error.  Please try again."
					}));
				} else {
					res.send(JSON.stringify({
						status: 200,
						error: null,
						response: results
					}));
				}

		}
	);
});

router.get("/getRegionsByIds/:regionIds?", (req, res, next) => {
	let query = "select * from regions";

	if (req.params.regionIds) {
		let regions = req.params.regionIds.split(",");
		query += " where region_id in ("
			for (let r = 0; r < regions.length; r ++) {
				query += (query[query.length - 1] === "(" ? "" : ",") + res.locals.connection.escape(regions[r]);
			}
		query += ")";
	}

	res.locals.connection.query(query, (error, results, fields) => {

				res.locals.connection.end();

				if (error) {
					console.error(error);
					res.send(JSON.stringify({
						status: 500,
						response: "There was an error.  Please try again."
					}));
				} else {
					res.send(JSON.stringify({
						status: 200,
						error: null,
						response: results
					}));
				}

		}
	);
});


module.exports = router;

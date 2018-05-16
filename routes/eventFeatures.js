const express = require("express");
const router = express.Router();

router.get("/getDerbyTypes", function(req, res, next) {

	res.locals.connection.query("select * from derbytypes order by derbytype_name", 
		function(error, results, fields) {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).send(JSON.stringify({
					response: results
				}));
			}
		}
	);
});

router.get("/getSanctionTypes", function(req, res, next) {

	res.locals.connection.query("select * from sanctions order by sanction_name", 
		function(error, results, fields) {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).send(JSON.stringify({
					response: results
				}));
			}

		}
	);
});

router.get("/getTracks", function(req, res, next) {

	res.locals.connection.query("select * from tracks order by track_name", 
		function(error, results, fields) {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).send(JSON.stringify({
					response: results
				}));
			}

		}
	);
});


module.exports = router;

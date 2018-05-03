const express = require("express");
const router = express.Router();

router.get("/getDerbyTypes", function(req, res, next) {

	res.locals.connection.query("select * from derbytypes order by derbytype_name", 
		function(error, results, fields) {

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

router.get("/getSanctionTypes", function(req, res, next) {

	res.locals.connection.query("select * from sanctions order by sanction_name", 
		function(error, results, fields) {

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

router.get("/getTracks", function(req, res, next) {

	res.locals.connection.query("select * from tracks order by track_name", 
		function(error, results, fields) {

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

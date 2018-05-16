const express = require("express");
const router = express.Router();

router.get("/getAllVenues", function(req, res, next) {

	res.locals.connection.query("select * from venues order by venue_name", 
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

router.get("/getVenuesByUser/:userId", function(req, res, next) {

	res.locals.connection.query("select * from venues where venue_user = " + res.locals.connection.escape(req.params.userId) + " order by venue_name", 
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

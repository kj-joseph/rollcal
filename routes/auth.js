const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const generateHash = str => {
	let hash = 0, i, chr;
	if (str.length === 0) return hash;

	for (i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; 
	}

	return Math.abs(hash);
};

router.post("/login", upload.array(), function(req, res, next) {

	res.locals.connection.query("select user_id, user_isadmin, user_name from users where user_email = " + res.locals.connection.escape(req.body.email) + " and user_password=sha2(" + res.locals.connection.escape(req.body.password) + ", 256) and user_validated = 1",

		(error, results, fields) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else if (results.length !== 1) {
				res.locals.connection.end();
				res.status(401).send();

			} else {

				let now = new Date();
				let sessionId = generateHash(results[0].user_name + results[0].user_id + now.getTime());
 
				res.locals.connection.query("insert into user_sessions values (" 
					+ res.locals.connection.escape(sessionId) 
					+ ", now()"
					+ ", now()"
					+ ", " + res.locals.connection.escape(results[0].user_id)
					+ ", " + res.locals.connection.escape(results[0].user_isadmin)
					+ ")",

					(insert_error, insert_results) => {

						if (insert_error) {
							res.locals.connection.end();
							console.error(error);
							res.status(500).send();

						} else {

							res.locals.connection.end();
							res.status(200).send(JSON.stringify({
								response: {
									userId: results[0].user_id,
									userName: results[0].user_name,
									isAdmin: results[0].user_isadmin,
									sessionId: sessionId
								}
							}));

						}

					});

			}

	});

});

router.delete("/logout/:userId", function(req, res, next) {

	res.locals.connection.query("delete from user_sessions where userId = " + res.locals.connection.escape(req.params.userId),
		(error, results, fields) => {
			if (error) {
				console.error(error);
				res.status(500).send();				
			} else {
				res.status(200).send();				
			}
		}

	);

});

router.post("/checkSession", upload.array(), function(req, res, next) {

	if (!req.body.sessionId || !req.body.userId || !req.body.isAdmin) {
		console.error(error);
		res.status(500).send();						

	} else {
		res.locals.connection.query("select user_id, user_isadmin, user_name from user_sessions" 
			+ " where userId = " + res.locals.connection.escape(req.body.userId) 
			+ " and sessionId = " + res.locals.connection.escape(req.body.sessionId)
			+ " and isAdmin = " + res.locals.connection.escape(req.body.isAdmin)
			+ " and touched > date_sub(now(), interval 30 minute)",

			(error, results, fields) => {

				if (error) {
					console.error(error);
					res.status(500).send();				
				} else {
					if (results.length === 1) {

						res.locals.connection.query("update user_sessions set touched = now() where sessionId = "  + res.locals.connection.escape(req.body.sessionId));

						res.status(200).send(JSON.stringify({
							response: true
						}));

					} else {

						res.locals.connection.query("delete from user_sessions where userId = " + res.locals.connection.escape(req.params.userId),
							(delete_error, delete_results, delete_fields) => {
								if (delete_error) {
									res.status(500).send();				
								} else {
									res.status(200).send(JSON.stringify({
										response: false
									}));
								}
							}

						);

					}

				}

			});


	}

});


router.post("/register/checkEmail", upload.array(), function(req, res, next) {

	res.locals.connection.query("select user_email from users where user_email = " + res.locals.connection.escape(req.body.email), 
		(error, results, fields) => {

			if (error) {
				console.error(error);
				res.status(500).send();				

			} else {
				res.status(200).send(JSON.stringify({
					response: (!!results.length)
				}));

			}

		});

});


router.post("/register", upload.array(), function(req, res, next) {

	const validationCode = generateHash(req.body.username + req.body.email);

	res.locals.connection.query("insert into users (user_name, user_email, user_password, user_validation_code) values (" 
		+ res.locals.connection.escape(req.body.username)
		+ ", " + res.locals.connection.escape(req.body.email)
		+ ", sha2(" + res.locals.connection.escape(req.body.password) + ", 256)" 
		+ ", " + res.locals.connection.escape(validationCode)
		+ ")",

		(error, results, fields) => {

			if (error) {
				console.error(error);
				res.status(500).send();				

			} else {
				res.status(200).send(JSON.stringify({
					response: {
						validationCode: validationCode
					}
				}));

			}

		});

});


router.post("/validate", upload.array(), function(req, res, next) {

	res.locals.connection.query("select user_id from users where" 
		+ " user_name = " + res.locals.connection.escape(req.body.username)
		+ " and user_email = " + res.locals.connection.escape(req.body.email)
		+ " and user_validation_code = " + res.locals.connection.escape(req.body.validationCode),

		(error, results, fields) => {

			if (error) {
				console.error(error);
				res.status(500).send();				

			} else {

				if (results.length === 1) {

					res.locals.connection.query("update users set user_validation_code = NULL, user_validated = 1 where user_id = " + res.locals.connection.escape(results[0].user_id),

						(error, results, fields) => {

							if (error) {
								console.error(error);
								res.status(500).send();				

							} else {
								res.status(200).send(JSON.stringify({
									response: true
								}));
							}

						});

				} else {
					res.status(401).send()	
				}

			}

		});

});

module.exports = router;

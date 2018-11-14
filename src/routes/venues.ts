import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

import { sendChangeApprovalEmail, sendChangeRejectionEmail } from "lib/email";

const router = Router();
const upload = multer();


router.get("/getAllVenues", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getAllVenues()",
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row})));
			}

		});
});


router.get("/getVenuesByUser/:userId", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenuesByUser(${res.locals.connection.escape(req.params.userId)})`,
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row})));
			}

		});
});


router.get("/getVenueDetails/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueDetails(${res.locals.connection.escape(req.params.id)})`,
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json(results[0].map((row: {}) => ({...row}))[0]);
			}

		});
});


router.put("/saveChanges", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call saveVenueChanges(
				${res.locals.connection.escape(req.session.user.id)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(req.body.changeObject)}
			)`,

			(error: MysqlError, results: any) => {
				if (error) {
					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				} else {

					res.status(200).send();

				}
			});

});


router.get("/getChangeList", checkSession("reviewer"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call getVenueChangeList(${res.locals.connection.escape(req.session.user.id)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));

			}
		});

});


router.get("/getChange/:changeId", checkSession("reviewer"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call getVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row}))[0]);

			}
		});

});


router.post("/approveChange/:changeId", checkSession("reviewer"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call approveVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				const returnedData = results[0].map((row: {}) => ({...row}))[0];

				if (returnedData.error) {
					res.locals.connection.end();
					console.error(returnedData.error);
					res.status(500).send();

				} else {

					sendChangeApprovalEmail
						(returnedData.email, returnedData.username, req.params.changeId, "venue", returnedData.isNew, returnedData.venue_name)
						.then(() => {

							res.status(200).send({
								success: true,
								venueId: returnedData.venue_id,
							});

						}).catch((mailError: ErrorEventHandler) => {

							console.error(mailError);
							res.status(500).send();

						});

				}
			}
		});

});


router.post("/rejectChange/:changeId", upload.array(), checkSession("reviewer"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call rejectVenueChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)},
			${res.locals.connection.escape(req.body.comment)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				const returnedData = results[0].map((row: {}) => ({...row}))[0];

				if (returnedData.error) {
					res.locals.connection.end();
					console.error(returnedData.error);
					res.status(500).send();

				} else {

					sendChangeRejectionEmail
						(returnedData.email, returnedData.username, req.params.changeId, "venue", returnedData.isNew, returnedData.venue_name, req.body.comment)
						.then(() => {

							res.status(200).send({
								success: true,
								venueId: returnedData.venue_id,
							});

						}).catch((mailError: ErrorEventHandler) => {

							console.error(mailError);
							res.status(500).send();

						});

				}
			}
		});

});


export default router;

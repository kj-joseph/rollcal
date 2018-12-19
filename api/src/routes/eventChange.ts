import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbArray, dbObject } from "lib/db";
import { sendChangeApprovalEmail, sendChangeRejectionEmail } from "lib/email";

import { mapEventChange } from "mapping/eventChangeMaps";

import { IDBDerbyEventChange } from "interfaces/event";

const router = Router();
const upload = multer();


router.post("/", upload.array(), checkSession("user"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call saveEventChanges(
				${res.locals.connection.escape(req.session.user.id)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(req.body.changeObject)}
			)`,
			(error: MysqlError, results: any) => {

				if (error) {

					console.error(error);
					res.locals.connection.end();
					res.status(500).send();

				} else {

					res.locals.connection.end();
					res.status(200).send();

				}
			});

});


router.get("/:changeId", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				const eventChangeData: IDBDerbyEventChange = dbObject(results[0]);

				if (!eventChangeData || !eventChangeData.change_id) {

					res.locals.connection.end();
					res.status(404).send();

				} else if (eventChangeData && eventChangeData.event_id) {

					res.locals.connection
						.query(`call getEventDays(${res.locals.connection.escape(eventChangeData.event_id)})`,

					(dayError: MysqlError, dayResults: any) => {

						if (dayError) {

							res.locals.connection.end();
							console.error(dayError);
							res.status(500).send();

						} else {

							eventChangeData.days = dbArray(dayResults[0]);

							const eventChange = mapEventChange(eventChangeData);
							res.locals.connection.end();
							res.status(200).json(eventChange);

						}

					});

				} else {

					const eventChange = mapEventChange(eventChangeData);
					res.locals.connection.end();
					res.status(200).json(eventChange);

				}


			}
		});

});


router.put("/:changeId/approval", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call approveEventChange(
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
						(returnedData.email, returnedData.username, req.params.changeId, "event", returnedData.isNew, returnedData.event_name)
						.then(() => {

							res.locals.connection.end();
							res.status(200).send({
								eventId: returnedData.event_id,
								success: true,
							});

						}).catch((mailError: ErrorEventHandler) => {
							console.error(mailError);

							res.locals.connection.end();
							res.status(500).send();

						});

				}
			}
		});

});


router.put("/:changeId/rejection", upload.array(), checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call rejectEventChange(
			${res.locals.connection.escape(req.params.changeId)},
			${res.locals.connection.escape(req.session.user.id)},
			${res.locals.connection.escape(req.body.comment)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				const returnedData = results[0].map((row: {}) => ({...row}))[0];

				if (returnedData.error) {
					console.error(returnedData.error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					sendChangeRejectionEmail
						(returnedData.email, returnedData.username, req.params.changeId, "event", returnedData.isNew, returnedData.event_name, req.body.comment)
						.then(() => {

							res.locals.connection.end();
							res.status(200).send({
								eventId: returnedData.event_id,
								success: true,
							});

						}).catch((mailError: ErrorEventHandler) => {
							console.error(mailError);

							res.locals.connection.end();
							res.status(500).send();

						});

				}
			}
		});

});


export default router;

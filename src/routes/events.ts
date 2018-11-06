import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

import { sendChangeApprovalEmail, sendChangeRejectionEmail } from "lib/email";

const router = Router();
const upload = multer();

router.get("/getEventDetails/:eventId", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventDetails(${res.locals.connection.escape(req.params.eventId)});
			call getEventDays(${res.locals.connection.escape(req.params.eventId)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				const eventResult = results[0].map((row: {}) => ({...row}))[0];

				if (eventResult) {
					eventResult.days = results[2].map((row: {}) => ({...row}));
				}

				res.locals.connection.end();
				res.status(200).json(eventResult);

			}
		});

});


router.get("/search", (req: Request, res: Response) => {

	// procedure parameters: user, start date, end date, derbytypes, sanctions, tracks, locations
	res.locals.connection.query(
		`call searchEvents(
			${req.query.user ? res.locals.connection.escape(req.query.user) : null},
			${req.query.startDate ? res.locals.connection.escape(req.query.startDate) : null},
			${req.query.endDate ? res.locals.connection.escape(req.query.endDate) : null},
			${req.query.derbytypes ? res.locals.connection.escape(req.query.derbytypes) : null},
			${req.query.sanctions ? res.locals.connection.escape(req.query.sanctions) : null},
			${req.query.tracks ? res.locals.connection.escape(req.query.tracks) : null},
			${req.query.locations ? res.locals.connection.escape(req.query.locations) : null}
		)`, (eventError: MysqlError, eventResults: any) => {

			if (eventError) {
				res.locals.connection.end();
				console.error(eventError);
				res.status(500).send();

			} else {

				const result = eventResults[0].map((row: {}) => ({...row}));

				res.locals.connection.end();
				res.status(200).json(result);

			}

	});

});


router.put("/saveChanges", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call saveEventChanges(
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


router.delete("/deleteEvent/:id", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call deleteEvent(
				${res.locals.connection.escape(req.params.id)},
				${res.locals.connection.escape(req.session.user.id)}
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
		.query(`call getEventChangeList(${res.locals.connection.escape(req.session.user.id)})`,

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

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row}))[0]);

			}
		});

});


export default router;

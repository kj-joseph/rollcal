import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/getEventDetails/:eventId", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventDetails(${res.locals.connection.escape(req.params.eventId)});
			call getEventDays(${res.locals.connection.escape(req.params.eventId)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else if (!results[0].length) {
				res.locals.connection.end();
				res.status(200).json({
					response: null,
				});

			} else {

				const eventResult = results[0].map((row: {}) => ({...row}))[0];

				eventResult.days = results[2].map((row: {}) => ({...row}));

				res.locals.connection.end();
				res.status(200).json({
					response: [eventResult],
				});

			}
		});

});


router.get("/search", (req: Request, res: Response) => {

	// procedure parameters: user, start date, end date, derbytypes, sanctions, tracks, locations
	res.locals.connection.query(
		`call searchEvents(
			${req.query.user ? res.locals.connection.escape(req.query.query) : null},
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

			} else if (!eventResults[0].length) {

				res.locals.connection.end();

				res.status(200).json({
					response: [],
				});

			} else {

				const result = eventResults[0].map((row: {}) => ({...row}));

				res.locals.connection.end();
				res.status(200).json({
					response: result,
				});

			}

	});

});

export default router;

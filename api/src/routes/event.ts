import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

const router = Router();
const upload = multer();

router.get("/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventDetails(${res.locals.connection.escape(req.params.id)});
			call getEventDays(${res.locals.connection.escape(req.params.id)})`,

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


router.delete("/:id", upload.array(), checkSession("user"), (req: Request, res: Response) => {

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

					res.locals.connection.end();
					res.status(200).send();

				}

			});

});


export default router;

import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";
import { dbArray, dbObject } from "lib/db";

import { mapEvent } from "mapping/eventMaps";

import { IDBDerbyEvent, IDBDerbyEventDay } from "interfaces/event";

const router = Router();
const upload = multer();

router.get("/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventDetails(${res.locals.connection.escape(req.params.id)});
			call getEventDays(${res.locals.connection.escape(req.params.id)})`,

		(error: MysqlError, response: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				const eventData: IDBDerbyEvent = dbObject(response[0]);

				if (eventData) {

					const days: IDBDerbyEventDay[] = dbArray(response[2]);
					eventData.days = days;

				}

				const event = mapEvent(eventData);

				res.locals.connection.end();
				res.status(200).json(event);

			}
		});

});


router.delete("/:id", upload.array(), checkSession("user"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call deleteEvent(
				${res.locals.connection.escape(req.params.id)},
				${res.locals.connection.escape(req.session.user.id)}
			)`,
			(error: MysqlError, response: any) => {

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


export default router;

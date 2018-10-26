import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

const router = Router();
const upload = multer();

router.put("/", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	const timezone = req.query.timezone || "UTC";

	// req.session.user

	res.status(200).send();

/*	res.locals.connection.query("select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name"
		+ " from events e, countries c, users u, timezones tz,"
		+ " (select * from venues left outer join regions on region_id = venue_region) as vr"
		+ ` where event_id = ${res.locals.connection.escape(req.params.eventId)}`
		+ " and event_approved = 1"
		+ " and venue_id = event_venue and country_code = venue_country"
		+ " and event_user = user_id and timezone_id = event_timezone",

		(error: MysqlError, results: any) => {
			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				// test

			}
		});
*/
});

export default router;

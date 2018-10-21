import { Request, Response, Router } from "express";
import { FieldInfo, MysqlError } from "mysql";

const router = Router();

router.get("/getAllVenues", (req: Request, res: Response) => {

	res.locals.connection.query("select * from venues order by venue_name",
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json({
					response: results,
				});
			}

		});
});

router.get("/getVenuesByUser/:userId", (req: Request, res: Response) => {

	res.locals.connection.query([
		`select v.*, r.region_name, r.region_abbreviation, c.country_name, c.country_code`,
		`from venues v, regions r, countries c`,
		`where v.venue_region = r.region_id`,
		`and v.venue_country = c.country_code`,
		`and venue_user = ${res.locals.connection.escape(req.params.userId)}`,
		`order by venue_name`,
		].join(" "),
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).json({
					response: results,
				});
			}

		});
});

export default router;

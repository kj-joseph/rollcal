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
				res.status(200).send(JSON.stringify({
					response: results,
				}));
			}

		});
});

router.get("/getVenuesByUser/:userId", (req: Request, res: Response) => {

	res.locals.connection.query("select * from venues where venue_user = " + res.locals.connection.escape(req.params.userId) + " order by venue_name",
		(error: MysqlError, results: any) => {

			res.locals.connection.end();

			if (error) {
				console.error(error);
				res.status(500).send();

			} else {
				res.status(200).send(JSON.stringify({
					response: results,
				}));
			}

		});
});

export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

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

export default router;

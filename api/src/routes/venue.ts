import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/:id", (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getVenueDetails(${res.locals.connection.escape(req.params.id)})`,
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row}))[0]);

			}

		});
});


export default router;

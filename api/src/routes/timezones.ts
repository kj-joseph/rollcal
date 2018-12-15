import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/", (req: Request, res: Response) => {

	res.locals.connection
		.query("call getTimeZones()",
		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));

			}
		});
});

export default router;

import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/getDerbyTypes", (req: Request, res: Response) => {

	res.locals.connection.query("select * from derbytypes order by derbytype_name",
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

router.get("/getSanctionTypes", (req: Request, res: Response) => {

	res.locals.connection.query("select * from sanctions order by sanction_name",
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

router.get("/getTracks", (req: Request, res: Response) => {

	res.locals.connection.query("select * from tracks order by track_name",
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

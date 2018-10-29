import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

const router = Router();

router.get("/getDerbyTypes", (req: Request, res: Response) => {

	res.locals.connection.query("call getDerbyTypes()",
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

router.get("/getSanctionTypes", (req: Request, res: Response) => {

	res.locals.connection.query("call getSanctions()",
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

router.get("/getTracks", (req: Request, res: Response) => {

	res.locals.connection.query("call GetTracks()",
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

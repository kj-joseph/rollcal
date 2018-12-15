import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

const router = Router();


router.get("/", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call searchUsers(${res.locals.connection.escape(req.query.search)})`,

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

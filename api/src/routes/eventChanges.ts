import { Request, Response, Router } from "express";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

const router = Router();


router.get("/", checkSession("reviewer"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getEventChangeList(${res.locals.connection.escape(req.session.user.id)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				res.locals.connection.end();
				console.error(error);
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {}) => ({...row})));

			}
		});

});


export default router;
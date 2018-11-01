import { Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "checkSession";
import { IRequestWithSession } from "interfaces";

const router = Router();
const upload = multer();

router.put("/saveEventChanges", upload.array(), checkSession("user"), (req: IRequestWithSession, res: Response) => {

	res.locals.connection
		.query(`call saveEventChanges(
				${res.locals.connection.escape(req.session.user.id)},
				${res.locals.connection.escape(req.body.id)},
				${res.locals.connection.escape(req.body.changeObject)}
			)`,

			(error: MysqlError, results: any) => {
				if (error) {
					res.locals.connection.end();
					console.error(error);
					res.status(500).send();

				} else {

					res.status(200).send();

				}
			});

});

export default router;

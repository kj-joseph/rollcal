import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { decryptCode } from "lib/crypto";

const router = Router();
const upload = multer();


router.put("/", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	res.locals.connection
		.query(`call validateUser(${res.locals.connection.escape(vObj.email)},
			${res.locals.connection.escape(vObj.username)},
			${res.locals.connection.escape(vObj.hash)})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				if (results[0].map((row: {}) => ({...row}))[0].validated) {

					res.locals.connection.end();
					res.status(200).json();

				} else {

					res.locals.connection.end();
					res.status(403).send();

				}

			}

		});

});

export default router;

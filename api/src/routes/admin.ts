import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { checkSession } from "lib/checkSession";

const router = Router();
const upload = multer();

router.get("/searchUsers/:search", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call searchUsers(${res.locals.connection.escape(req.params.search)})`,

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


router.get("/getUserDetailsById/:id", checkSession("admin"), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getUserDetailsById(${req.params.id})`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).json(results[0].map((row: {[key: string]: any}) => ({
					user_email: row.user_email,
					user_id: row.user_id,
					user_name: row.user_name,
					user_roles: row.user_roles.split(","),
					user_status: row.user_status,
				}))[0]);

			}

		});

});


router.put("/updateUser/:id", checkSession("admin"), upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call updateUser(
			${res.locals.connection.escape(req.params.id)},
			${res.locals.connection.escape(req.body.userName)},
			${res.locals.connection.escape(req.body.userStatus)},
			${res.locals.connection.escape(req.body.userEmail)},
			${res.locals.connection.escape(req.body.userRoles)}
			)`,

		(error: MysqlError, results: any) => {

			if (error) {
				console.error(error);

				res.locals.connection.end();
				res.status(500).send();

			} else {

				res.locals.connection.end();
				res.status(200).send();

			}

		});


});

export default router;

import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { decryptCode, generateValidation } from "lib/crypto";
import { dbObject } from "lib/db";
import { sendForgotPasswordEmail } from "lib/email";

import { mapUser } from "mapping/userMaps";

import { IDBUserInfo } from "interfaces/user";

const router = Router();
const upload = multer();


router.get("/", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	if (vObj.hash) {

		res.locals.connection
			.query(`call checkForgotPassword(${res.locals.connection.escape(vObj.email)},
				${res.locals.connection.escape(vObj.hash)})`,
			(error: MysqlError, response: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					const userData: IDBUserInfo = dbObject(response[0]);

					if (userData) {

						const user = mapUser(userData);

						res.locals.connection.end();
						res.status(200).json(user);

					} else {

						res.locals.connection.end();
						res.status(403).send();

					}

				}

			});

	} else {

		res.status(403).send();

	}


});

router.post("/", upload.array(), (req: Request, res: Response) => {

	res.locals.connection
		.query(`call getUserDetailsFromEmail(${res.locals.connection.escape(req.body.email)})`,

			(detailError: MysqlError, detailResponse: any) => {

				const userData: IDBUserInfo = dbObject(detailResponse[0]);

				if (detailError || !userData) {

					res.locals.connection.end();
					res.status(403).json({
						errorCode: "notFound",
					});

				} else {

					const validation = generateValidation({
						email: req.body.email,
						username: userData.user_name,
					});

					res.locals.connection
						.query(`call insertForgotPassword(
							${res.locals.connection.escape(userData.user_id)},
							${res.locals.connection.escape(validation.hash)}
							)`,

							(insertError: MysqlError, insertResponse: any) => {

								if (insertError) {
									console.error(insertError);

									res.locals.connection.end();
									res.status(500).json({
										errorCode: "insert",
									});

								} else {

									sendForgotPasswordEmail(req.body.email, userData.user_name, validation.encrypted)
										.then(() => {

											res.locals.connection.end();
											res.status(200).send();

										}).catch((emailError) => {
											console.error(emailError);

											res.locals.connection.end();
											res.status(500).json({
												errorCode: "email",
											});

										});

								}

							});

				}

			});


 });

export default router;

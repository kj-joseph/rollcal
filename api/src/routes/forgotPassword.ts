import { Request, Response, Router } from "express";
import multer from "multer";
import { MysqlError } from "mysql";

import { decryptCode, generateValidation } from "lib/crypto";
import { sendForgotPasswordEmail } from "lib/email";

const router = Router();
const upload = multer();


router.get("/", upload.array(), (req: Request, res: Response) => {

	const vObj = decryptCode(req.body.validationCode);

	if (vObj.hash) {

		res.locals.connection
			.query(`call checkForgotPassword(${res.locals.connection.escape(vObj.email)},
				${res.locals.connection.escape(vObj.hash)})`,
			(error: MysqlError, results: any) => {

				if (error) {
					console.error(error);

					res.locals.connection.end();
					res.status(500).send();

				} else {

					const userData = results[0].map((row: {}) => ({...row}))[0];

					if (userData) {

						res.locals.connection.end();
						res.status(200).json(userData);

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

			(detailError: MysqlError, detailResults: any) => {

				const userDetails = detailResults[0].map((row: {}) => ({...row}))[0];

				if (detailError || !userDetails) {

					res.locals.connection.end();
					res.status(403).json({
						errorCode: "notFound",
					});

				} else {

					const validation = generateValidation({
						email: req.body.email,
						username: userDetails.user_name,
					});

					res.locals.connection
						.query(`call insertForgotPassword(
							${res.locals.connection.escape(userDetails.user_id)},
							${res.locals.connection.escape(validation.hash)}
							)`,

							(insertError: MysqlError, insertResults: any) => {

								if (insertError) {
									console.error(insertError);

									res.locals.connection.end();
									res.status(500).json({
										errorCode: "insert",
									});

								} else {

									sendForgotPasswordEmail(req.body.email, userDetails.user_name, validation.encrypted)
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

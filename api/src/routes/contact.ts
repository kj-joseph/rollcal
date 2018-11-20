import { Request, Response, Router } from "express";
import multer from "multer";

import { sendContactEmail } from "lib/email";

const router = Router();
const upload = multer();

router.post("/", upload.array(), (req: Request, res: Response) => {

	sendContactEmail(req.body.email, req.body.name, req.body.message)
		.then(() => {

			res.status(200).send();

		}).catch((emailError) => {

			console.error(emailError);
			res.status(500).send();

		});


});

export default router;

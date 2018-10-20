import { Request } from "express";

export interface IRequestWithUser extends Request {
	user: {
		email: string,
		exp: number,
		iat: number,
		id: number,
		permissions: string[],
		username: string,
	};
}

export interface IDBUserInfo {
	user_email: string;
	user_id: number;
	user_name: string;
	user_roles: string[];
	user_status: string;
}

export interface IUserInfo {
	loggedIn?: boolean;
	userEmail?: string;
	userId?: number;
	userName?: string;
	userRoles?: string[];
	userStatus?: string;
}

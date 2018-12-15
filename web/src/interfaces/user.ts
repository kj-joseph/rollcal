export interface IDBUserInfo {
	user_email: string;
	user_id: number;
	user_name: string;
	user_roles: string[];
	user_status: string;
}

export interface IDBUserRole {
	role_id: number;
	role_name: string;
	role_order: number;
}

export interface IUserInfo {
	email?: string;
	id?: number;
	name?: string;
	roles?: string[];
	status?: string;
	validationCode?: string;
}

export interface IUserRole {
	id: number;
	name: string;
	order: number;
}

import { IDBUserRole, IUserRole } from "interfaces/user";

export const mapRole = (
	roleData: IDBUserRole,
): IUserRole  => ({
		id: roleData.role_id,
		name: roleData.role_name,
		order: roleData.role_order,
});

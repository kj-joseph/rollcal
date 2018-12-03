import { IDerbyFeatures } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IUserInfo } from "interfaces/user";

export interface IBoxListItem {
	changeId?: number;
	country?: IGeoCountry;
	dates?: string;
	distance?: number;
	host?: string;
	features?: IDerbyFeatures;
	id?: number;
	location: string;
	name: string;
	submittedDuration?: string;
	submittedTime?: string;
	user: IUserInfo;
}

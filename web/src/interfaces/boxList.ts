import { IDerbyIcons } from "interfaces/feature";
import moment from "moment";

export interface IBoxListItem {
	address1: string;
	address2?: string;
	changeId?: number;
	countryCode?: string;
	countryFlag?: string;
	countryName?: string;
	datesVenue?: string;
	days?: moment.Moment[];
	distance?: string;
	host?: string;
	icons?: IDerbyIcons;
	id?: number;
	location: string;
	multiDay?: boolean;
	name: string;
	submittedDuration?: string;
	submittedTime?: string;
	user: number;
	username?: string;
}

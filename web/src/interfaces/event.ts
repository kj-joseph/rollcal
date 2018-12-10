import { IDerbyFeature, IDerbyFeatures } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IDBUserInfo, IUserInfo } from "interfaces/user";
import { IDBDerbyVenue, IDerbyVenue, INewDerbyVenue } from "interfaces/venue";

import moment from "moment";

export interface IDBDerbyEvent extends IDBDerbyVenue, IDBUserInfo {
	days: IDBDerbyEventDay[];
	derbytypes: string;
	event_approved: number;
	event_description?: string;
	event_eventtype: number;
	event_first_day: string;
	event_host: string;
	event_id: number;
	event_last_day: string;
	event_link?: string;
	event_name?: string;
	event_timezone: number;
	event_user: number;
	event_venue: number;
	sanctions: string;
	tracks: string;
}

export interface IDBDerbyEventChange extends IDBDerbyEvent {
	change_id: number;
	change_object: string;
	change_submitted: string;
	change_user: number;
	change_user_name: string;
	changed_item_id: number;
}

export interface IDBDerbyEventDay {
	eventday_description?: string;
	eventday_event: number;
	eventday_games?: number;
	eventday_doors: string;
	eventday_doors_user?: string;
	eventday_doors_venue: string;
	eventday_id: number;
	eventday_start: string;
	eventday_start_user?: string;
	eventday_start_venue: string;
}

export interface IDerbyEvent {
	dates?: string;
	days?: IDerbyEventDay[];
	description?: string;
	features?: IDerbyFeatures;
	host?: string;
	id: number;
	link?: string;
	multiDay?: boolean;
	name: string;
	user?: IUserInfo;
	venue: IDerbyVenue;
}

export interface IDerbyEventChange extends IDerbyEvent {
	changeId: number;
	dayChanges: Array<{
		id: number,
		new?: {
			date?: string,
			description?: string,
			doors?: string,
			start?: string,
		},
		old?: {
			date?: string,
			description?: string,
			doors?: string,
			start?: string,
		},
		startDate: string,
		status: string,
	}>;
	featureChanges?: {
		derbytypes?: Array<{
			name: string,
			status: string,
		}>,
		sanctions?: Array<{
			name: string,
			status: string,
		}>,
		tracks?: Array<{
			name: string,
			status: string,
		}>,
	};
	newVenue?: INewDerbyVenue;
	submittedDuration: string;
	submittedTime: string;
	username: string;
	userId?: number;
}

export interface IDerbyEventChangeObject {
	data: Array<{
		field: string,
		value: any,
	}>;
	days: Array<{
		id: number,
		operation: string,
		value: {
			datetime?: string,
			description?: string,
			doors?: string,
		},
	}>;
	features: {
		add: string[],
		delete: string[],
	};
	newVenueData?: INewDerbyVenue;
}

export interface IDerbyEventDay {
	date?: string;
	dateObject?: moment.Moment;
	doorsTime?: string;
	editing?: boolean;
	id?: number;
	sortValue?: string;
	startTime: string;
	description?: string;
}

export interface ISearchObject {
	address?: string;
	derbytypes?: IDerbyFeature[];
	distance?: number;
	distanceUnits?: "mi" | "km";
	endDate?: string;
	locations?: IGeoCountry[];
	sanctions?: IDerbyFeature[];
	startDate?: string;
	tracks?: IDerbyFeature[];
	user?: number;
}

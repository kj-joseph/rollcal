import { IDerbyFeatureChanges, IDerbyFeatureType } from "interfaces/feature";
import { IGeoCountry } from "interfaces/geo";
import { IDBUserInfo, IUserInfo } from "interfaces/user";
import { IDBDerbyVenue, IDerbyVenue, INewDerbyVenue } from "interfaces/venue";

import moment from "moment";

export interface IDBDerbyEvent extends IDBDerbyVenue, IDBUserInfo {
	days: IDBDerbyEventDay[];
	event_approved: number;
	event_description?: string;
	event_eventtype: number;
	event_features: string;
	event_first_day: string;
	event_host: string;
	event_id: number;
	event_last_day: string;
	event_link?: string;
	event_name?: string;
	event_timezone: number;
	event_updated: string;
	event_user: number;
	event_venue: number;
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
	eventday_datetime: string;
	eventday_doors: string;
	eventday_doors_user?: string;
	eventday_doors_venue: string;
	eventday_games?: number;
	eventday_id: number;
	eventday_start_user?: string;
	eventday_start_venue: string;
}

export interface IDerbyEvent {
	dates?: {
		end: string,
		start: string,
	};
	days?: IDerbyEventDay[];
	description?: string;
	features?: string[];
	featureObjects?: IDerbyFeatureType[];
	host?: string;
	id: number;
	link?: string;
	name: string;
	updated?: moment.Moment;
	user?: IUserInfo;
	venue: IDerbyVenue;
}

export interface IDerbyEventChange extends IDerbyEvent {
	changeId: number;
	changeObject: IDerbyEventChangeObject;
	dayChanges?: IDerbyEventChangeObjectDayChange[];
	featureChanges?: IDerbyFeatureChanges;
	newVenue?: IDerbyVenue;
	submittedDuration: string;
	submittedTime: string;
	submitter: IUserInfo;
}

export interface IDerbyEventChangeObject {
	data: Array<{
		field: string;
		value: any;
	}>;
	days: IDerbyEventChangeObjectDay[];
	features: {
		add: string[];
		delete: string[];
	};
	newVenueData?: INewDerbyVenue;
}

export interface IDerbyEventChangeObjectDay {
	id: number;
	operation: string;
	value: {
		datetime?: string;
		description?: string;
		doors?: string;
	};
}

export interface IDerbyEventChangeObjectDayChange {
	id: number;
	new?: {
		date?: string;
		description?: string;
		doors?: string;
		start?: string;
	};
	old?: {
		date?: string;
		description?: string;
		doors?: string;
		start?: string;
	};
	startDate: string;
	status: string;
}

export interface IDerbyEventDay {
	date?: string;
	dateObject?: moment.Moment;
	doorsTime?: string;
	doorsTimeUTC?: string;
	editing?: boolean;
	id?: number;
	sortValue?: string;
	startTime: string;
	startTimeUTC?: string;
	description?: string;
}

export interface ISearchObject {
	address?: string;
	distance?: number;
	distanceUnits?: "mi" | "km";
	endDate?: string;
	features?: string[];
	locations?: IGeoCountry[];
	startDate?: string;
	user?: number;
}

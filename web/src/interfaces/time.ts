import moment from "moment";

export interface IDerbyDates {
	start: moment.Moment;
	end?: moment.Moment;
}

export interface IDBTimeZone {
	timezone_id: number;
	timezone_name: string;
	timezone_zone: string;
}

export interface ITimeZone {
	id: number;
	name: string;
	zone: string;
}

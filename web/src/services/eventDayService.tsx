import { IDBDerbyEventDay, IDerbyEventDay } from "interfaces/event";

import moment from "moment";

export const mapDays = (
	data: IDBDerbyEventDay[],
): IDerbyEventDay[] =>

	data.map((day) => ({
		date: moment.utc(day.eventday_start_venue).format("MMM D"),
		dateObject: moment.utc(day.eventday_start_venue),
		description: day.eventday_description,
		doorsTime: day.eventday_doors_venue
			&& day.eventday_doors_venue < day.eventday_start_venue ?
				moment.utc(day.eventday_doors_venue).format("HH:mm:00")
			: "",
		id: day.eventday_id,
		startTime: moment.utc(day.eventday_start_venue).format("HH:mm:00"),
	}));

export const mapDayForStorage = (
	day: IDerbyEventDay,
): IDerbyEventDay =>

	({
		date: day.dateObject.format("MMM D"),
		dateObject: day.dateObject,
		description: day.description || "",
		doorsTime: day.doorsTime || "",
		id: day.id,
		startTime: day.startTime,
	});

export const mapDaysForEditing = (
	data: IDerbyEventDay[],
): IDerbyEventDay[] =>

	data.map((day) => ({
		date: day.dateObject.format("MMM D, Y"),
		dateObject: day.dateObject,
		description: day.description || "",
		doorsTime: day.doorsTime || "",
		editing: false,
		id: day.id,
		sortValue: day.dateObject.format("Y-MM-DD"),
		startTime: day.startTime,
	}));

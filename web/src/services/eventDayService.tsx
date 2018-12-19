import { IDerbyEventDay } from "interfaces/event";

import moment from "moment";

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
		date: moment(day.dateObject).format("MMM D, Y"),
		dateObject: moment(day.dateObject),
		description: day.description || "",
		doorsTime: day.doorsTime || "",
		editing: false,
		id: day.id,
		sortValue: moment(day.dateObject).format("Y-MM-DD"),
		startTime: day.startTime,
	}));

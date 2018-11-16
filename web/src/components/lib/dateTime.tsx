import { IDerbyDates } from "interfaces/event";

export const formatDateRange = (dates: IDerbyDates, monthFormat: string = "short") => {

	const mo = monthFormat === "short" ? "MMM" : "MMMM";
	const ds = "Y-MM-DD";

	if (dates.lastDay) {

		const multiDay = (dates.firstDay.format(ds) !== dates.lastDay.format(ds));
		const differentYear = (multiDay && dates.firstDay.year() !== dates.lastDay.year());
		const differentMonth = (differentYear || (multiDay && dates.firstDay.month() !== dates.lastDay.month()));

		return dates.firstDay.format(mo)
			+ " " + dates.firstDay.date()
			+ (differentYear ? `, ${dates.firstDay.year()}` : "")
			+ (multiDay && !differentMonth ? ` – ${dates.lastDay.date()}` : "")
			+ (differentMonth ? ` – ${dates.lastDay.format(mo)} ${dates.lastDay.date()}` : "")
			+  `, ${dates.lastDay.year()}`
			;

	} else {

		return dates.firstDay.format(`${mo} D, Y`);

	}

};

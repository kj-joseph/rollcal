
const textMonths = {
	short: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	long: [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

const convertDateTimeFromString = date => ({

	dateString: date.substr(0,10),
	month: {
		long: textMonths.long[Number(date.substr(5,2))],
		short: textMonths.short[Number(date.substr(5,2))],
		number: Number(date.substr(5,2)).toString()
	},
	day: Number(date.substr(8,2)).toString(),
	year: date.substr(0,4),
	hour24: Number(date.substr(11,2)) === 0 ? "12" : Number(date.substr(11,2)).toString(),
	hour12: Number(date.substr(11,2)) > 12 ? (Number(date.substr(11,2)) - 12).toString() : Number(date.substr(11,2)) === 0 ? "12" : Number(date.substr(11,2)).toString(),
	minute: date.substr(14,2),
	ampm: Number(date.substr(11,2)) >= 12 ? "PM" : "AM"

});

const convertDateTimeFromObject = date => ({

	dateString: date.getFullYear().toString() + "-" 
		+ ("0" + (date.getMonth() + 1)).toString().slice(-2) + "-"
		+ ("0" + date.getDate().toString()).slice(-2),
	month: {
		long: textMonths.long[date.getMonth() + 1],
		short: textMonths.short[date.getMonth() + 1],
		number: date.getMonth() + 1
	},
	day: date.getDate().toString(),
	year: date.getFullYear(),
	hour24: date.getHours() === 0 ? "12" : date.getHours().toString(),
	hour12: date.getHours() > 12 ? (date.getHours() - 12).toString() : date.getHours() === 0 ? "12" : date.getHours().toString(),
	minute: date.getMinutes(),
	ampm: date.getHours() >= 12 ? "PM" : "AM"

});

export const formatDateRange = (dates, monthFormat = "short") => {

	const convertDateTime = (typeof dates.firstDay.start === "string" ? convertDateTimeFromString : convertDateTimeFromObject);

	const formattedDates = {
		firstDay: {
			start: convertDateTime(dates.firstDay.start),
//			end: convertDateTime(dates.firstDay.end)
		},
		lastDay: {
			start: dates.lastDay.start ? convertDateTime(dates.lastDay.start) : convertDateTime(dates.firstDay.start),
//			end: convertDateTime(dates.lastDay.end)
		}
	};

	const multiDay = (formattedDates.firstDay.start.dateString !== formattedDates.lastDay.start.dateString);
	const differentYear = (multiDay && formattedDates.firstDay.start.year !== formattedDates.lastDay.start.year);
	const differentMonth = (differentYear || (multiDay && formattedDates.firstDay.start.month.number !== formattedDates.lastDay.start.month.number));

	return formattedDates.firstDay.start.month[monthFormat]
		+ " " + formattedDates.firstDay.start.day 
		+ (differentYear ? ", " + formattedDates.firstDay.start.year : "")
		+ (multiDay && !differentMonth ? " – " + formattedDates.lastDay.start.day : "")
		+ (differentMonth ? " – "  + formattedDates.lastDay.start.month[monthFormat] + " " + formattedDates.lastDay.start.day : "")
		+  ", " + formattedDates.lastDay.start.year;

};


export const formatDate = (dateTime, includeYear = true, monthFormat = "short") => {

	const convertDateTime = (typeof dateTime ? convertDateTimeFromString : convertDateTimeFromObject);

	const formattedDateTime = convertDateTime(dateTime);

	return formattedDateTime.month[monthFormat]
		+ " " + formattedDateTime.day 
		+ (includeYear ? ", " + formattedDateTime.year : "");

}


export const formatTime = (dateTime, useAmPm = true) => {

	const convertDateTime = (typeof dateTime === "string" ? convertDateTimeFromString : convertDateTimeFromObject);

	const formattedDateTime = convertDateTime(dateTime);

	return (useAmPm ? formattedDateTime.hour12 + ":" + formattedDateTime.minute + " " + formattedDateTime.ampm : formattedDateTime.hour24);

}

BEGIN

set @pi = pi();

if units = "km" then
	set @mult = 1.60934;
else set @mult = 1;
end if;

return (((acos(
			sin((lat1 * @pi / 180))
			* sin((lat2 * @pi / 180))
			+ cos((lat1 * @pi /180))
			* cos((lat2 * @pi / 180))
			* cos(((lon1 - lon2) * @pi / 180)) ))
		* 180 / @pi )
	* 60 * 1.1515 * @mult);

END

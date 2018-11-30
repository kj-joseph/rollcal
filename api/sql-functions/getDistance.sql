BEGIN

set @pi = pi();

return (((acos(
			sin((lat1 * @pi / 180))
			* sin((lat2 * @pi / 180))
			+ cos((lat1 * @pi /180))
			* cos((lat2 * @pi / 180))
			* cos(((lng1 - lng2) * @pi / 180)) ))
		* 180 / @pi )
	* 60 * 1.1515);

END

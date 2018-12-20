BEGIN

set @select = "select distinct e.*, c.*, v.*, tz.*, u.user_id, u.user_name";

set @from = "
	from events e inner join eventdays on eventday_event = event_id,
		countries c, timezones tz, users u,
		(select * from venues left outer join regions on region_id = venue_region) v
	";

set @where = "
	where v.venue_id = event_venue
		and country_code = v.venue_country
		and event_user = user_id
		and timezone_id = v.venue_timezone
	";

set @group = " group by e.event_id";

if user > 0 then
	set @where = concat(@where,
		" and event_user = ", user);
end if;

if startDate != "" then
	set @where = concat(@where,
		"  and eventday_datetime >= ", quote(concat(startDate, " 00:00:00.000")));
end if;

if endDate != "" then
	set @where = concat(@where,
		"  and eventday_datetime <= ", quote(concat(endDate, " 00:00:00.000")));
end if;

set @counter = 0;

if features != "" then
	set @temp_features = features;

	feat: loop
		if length(@temp_features) = 0 then
			leave feat;
		end if;

		set @featureSet = substring_index(@temp_features, ".", 1);

		set @from = concat(@from, ", event_features ef", @counter);
		set @where = concat(@where,
			" and ef", @counter, ".event = event_id");
		set @where = concat(@where,
			" and ef", @counter, ".feature in (", @featureSet, ")");

		set @temp_features = substring(@temp_features, length(@featureSet) + 2);

		set @counter = @counter + 1;

	end loop;

end if;

if lat and lng and distance then
	set @select = concat(@select, ", getDistance(", lat, ",", lng, ", v.venue_lat, v.venue_lng) as venue_distance");
	set @where = concat(@where, " and event_venue = v.venue_id
		and getDistance(", lat, ",", lng, ", v.venue_lat, v.venue_lng) < ", distance, "
		");

elseif locations != "" then
	set @where = concat(@where, " and event_venue = v.venue_id and (");
	set @temp_locations = locations;

	locs: loop
		if length(@temp_locations) = 0 then
			leave locs;
		end if;

		set @country = substring_index(@temp_locations, ",", 1);

		if substring(@where, -1) != "(" then
			set @where = concat(@where, " or ");
		end if;

		if char_length(@country) > 3 then
			set @where = concat(@where,
				" (v.venue_country = ", quote(substring(@country, 1, 3)),
				" and v.venue_region in (", replace(substring(@country, 5), " ", ","), ") ) ");
		else
			set @where = concat(@where, " v.venue_country = ", quote(@country));
		end if;

		set @temp_locations = substring(@temp_locations, length(@country) + 2);

	end loop;

	set @where = concat(@where, ")");


end if;

set @countQuery = concat(
	"select count(eventlist.event_id)",
	" into @eventCount"
	" from (", @select, @from, @where, @group, ") eventlist");

prepare stmt from @countQuery;
execute stmt;
deallocate prepare stmt;

set @query = concat(
	"select eventlist.*,
	convert_tz(ed.event_first_day, 'UTC', eventlist.timezone_zone) as event_first_day,
	convert_tz(ed.event_last_day, 'UTC', eventlist.timezone_zone) as event_last_day,
	featureslist.list as event_features",
	" from (
	", @select, @from, @where, @group, "
	) eventlist

	join (select eventday_event, min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day from eventdays group by eventday_event) ed
		on ed.eventday_event = eventlist.event_id

	left join (select ef.event as id,
			group_concat(ft.feature_type_code, '-', f.feature_id
				order by ft.feature_type_code, f.feature_id) as list
	    	from features f, feature_types ft, event_features ef
	     	where ef.feature = f.feature_id
	     		and ft.feature_type_id = f.feature_type
         	group by ef.event
	    ) as featureslist
	    on featureslist.id = eventlist.event_id

	order by ed.event_first_day"
);

if count and start then
	set @query = concat(@query, " limit ", start, ", ", count);
elseif count then
	set @query = concat(@query, " limit ", count);
end if;

prepare stmt from @query;
execute stmt;
deallocate prepare stmt;

select @eventCount as eventCount;

select @query as query;

END

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

if derbytypes != "" then
	set @from = concat(@from, ", event_derbytypes edt");
	set @where = concat(@where,
		" and edt.event = event_id and edt.derbytype in (", derbytypes, ")");
end if;

if sanctions != "" then
	set @from = concat(@from, ", event_sanctions es");
	set @where = concat(@where,
		" and es.event = event_id and es.sanction in (", sanctions, ")");
end if;

if tracks != "" then
	set @from = concat(@from, ", event_tracks et");
	set @where = concat(@where,
		" and et.event = event_id and et.track in (", tracks, ")");
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
	derbytypeslist.list as derbytypes, sanctionslist.list as sanctions, trackslist.list as tracks",
	" from (
	", @select, @from, @where, @group, "
	) eventlist

	join (select eventday_event, min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day from eventdays group by eventday_event) ed
		on ed.eventday_event = eventlist.event_id

	left join (select edt.event as id, group_concat(distinct derbytype_id) as list
	    	from derbytypes dt, event_derbytypes edt
	     	where edt.derbytype = dt.derbytype_id
         	group by edt.event
	    ) as derbytypeslist
	    on derbytypeslist.id = eventlist.event_id

	left join (select es.event as id, group_concat(distinct sanction_id) as list
	    	from sanctions s, event_sanctions es
	     	where es.sanction = s.sanction_id
         	group by es.event
	    ) as sanctionslist
	    on sanctionslist.id = eventlist.event_id

	left join(select et.event as id, group_concat(distinct track_id) as list
	    	from tracks t, event_tracks et
	     	where et.track = t.track_id
         	group by et.event
	    ) as trackslist
		on trackslist.id = eventlist.event_id

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

END

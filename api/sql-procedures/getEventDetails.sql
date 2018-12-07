BEGIN

select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name, ed.event_first_day, ed.event_last_day,
    (select group_concat(distinct derbytype_id) as list
    	from derbytypes dt, event_derbytypes edt
     	where edt.event = id
    	and edt.derbytype = dt.derbytype_id
     	order by dt.derbytype_id
    ) as derbytypes,
    (select group_concat(distinct sanction_id) as list
    	from sanctions s, event_sanctions es
     	where es.event = id
    	and es.sanction = s.sanction_id
     	order by s.sanction_id
    ) as sanctions,
    (select group_concat(distinct track_id) as list
    	from tracks t, event_tracks et
     	where et.event = id
    	and et.track = t.track_id
     	order by t.track_id
    ) as tracks
from events e, countries c, users u, timezones tz,
	(select * from venues left outer join regions on region_id = venue_region) vr,
    (select min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day
        from eventdays
        where eventday_event = id) ed

where event_id = id
	and venue_id = event_venue and country_code = venue_country
	and event_user = user_id and timezone_id = venue_timezone;

END

BEGIN

select e.*, c.*, vr.*, tz.*, u.user_id, u.user_name,
    convert_tz(ed.event_first_day, 'UTC', tz.timezone_zone) as event_first_day,
    convert_tz(ed.event_last_day, 'UTC', tz.timezone_zone) as event_last_day,
    (select group_concat(ft.feature_type_code, '-', f.feature_id) as list
            from features f, feature_types ft, event_features ef
            where ef.feature = f.feature_id
                and ft.feature_type_id = f.feature_type
                and ef.event = id
        ) as event_features
from events e, countries c, users u, timezones tz,
	(select * from venues left outer join regions on region_id = venue_region) vr,
    (select min(eventday_datetime) event_first_day, max(eventday_datetime) event_last_day
        from eventdays
        where eventday_event = id) ed

where event_id = id
	and venue_id = event_venue and country_code = venue_country
	and event_user = user_id and timezone_id = venue_timezone;

END

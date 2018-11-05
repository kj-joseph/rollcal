BEGIN

select c.change_user, c.change_object, c.changed_item_id, e.event_name, e.event_host, true
	into @user, @changeObject, @eventId, @eventName, @eventHost, @changeok
from changes c, events e
where c.change_id = changeId
	and c.changed_item_type = "event"
	and c.changed_item_id = e.event_id
	and c.change_status = "submitted";

if @changeok = true then

	if @eventName is null then
		set @eventName = @eventHost;
	end if;

	update changes
	set change_status = "rejected",
		change_reviewer = reviewer,
		change_comment = comment
	where change_id = changeId
;
	select user_name, user_email
		into @username, @email
	from users
	where user_id = @user;

	select @username as username, @email as email, @user as user_id, @eventName as event_name, @eventId as event_id;

else

	select "Change not found." as error;

end if;

END

BEGIN

select c.change_user, v.venue_name, c.changed_item_id, true
	into @user, @venueName, @venueId, @changeok
from changes c, venues v
where c.change_id = changeId
	and c.changed_item_type = "venue"
	and c.changed_item_id = v.venue_id
	and c.change_status = "submitted";

if @changeok = true then

	update changes
	set change_status = "rejected",
		change_reviewer = reviewer,
		change_comment = comment
	where change_id = changeId;

	select user_name, user_email
		into @username, @email
	from users
	where user_id = @user;

	select @username as username, @email as email, @user as user_id, @venueName as venue_name, @venueId as venue_id;

else

	select "Change not found." as error;

end if;

END

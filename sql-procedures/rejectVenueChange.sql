BEGIN

select c.change_user, true
	into @user, @changeok
from changes c
where c.change_id = changeId
	and c.changed_item_type = "venue"
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

	select @username as username, @email as email, @user as user_id;

else

	select "Change not found." as error;

end if;

END

BEGIN

update users
set user_name = name,
	user_status = status,
	user_email = email
where user_id = userid;

if roles != "" then

	delete from user_roles
	where user = userid;

	set @temp_roles = roles;

	roles: loop
		if length(@temp_roles) = 0 then
			leave roles;
		end if;

		set @role = substring_index(@temp_roles, ",", 1);

		insert into user_roles (user, role)
		values (userid, @role);

		set @temp_roles = substring(@temp_roles, length(@role) + 2);

	end loop;

end if;


END

use DRS;

-- Insert test data
insert into admins
	values("adminemail@gmail.com", "Admin", "User"),
		("email4admin@gmail.com", "Another", "Admin");

insert into sponsororganizations(OrganizationName)
	values("Test Organization1"),
		("Test Organization2"),
        ("Test Organization3");

insert into sponsorusers
	values("sponsoremail@gmail.com", "Sponsor", "Guy", 1),
		("sponsor4Org3@gmail.com", "Other", "Sponsor", 3);

insert into drivers(DriverEmail, DriverFName, DriverLName, DriverSponsor)
	values("driveremail@gmail.com", "Driver", "Dude", 1),
		("nonsponsoredDriver@gmail.com", "Not", "Sponsored", NULL),
        ("sponsoredBy3@gmail.com", "Driver", "Three", 3);
        
select * from allusers;

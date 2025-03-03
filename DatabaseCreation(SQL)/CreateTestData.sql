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

insert into drivers(DriverEmail, DriverFName, DriverLName)
	values("driveremail@gmail.com", "Driver", "Dude"),
		("nonsponsoredDriver@gmail.com", "Not", "Sponsored"),
        ("sponsoredBy3@gmail.com", "Driver", "Three");
        
select * from allusers;

insert into driversponsorapplications (ApplicationDriver, ApplicationOrganization, ApplicationSubmittedDate)
values ("driveremail@gmail.com", 1, "2025-03-03"),
		("sponsoredBy3@gmail.com", 3, "2025-03-03");

select * from driversponsorapplications;

UPDATE DRS.driversponsorapplications
SET ApplicationSponsorUser = 'sponsoremail@gmail.com', ApplicationStatus = 'Accepted'
WHERE (ApplicationID = '1');

select * from driversponsorapplications;
select * from driverssponsors;
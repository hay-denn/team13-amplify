-- Create the about schema
DROP SCHEMA IF EXISTS DRS;
CREATE SCHEMA DRS;
USE DRS;

-- Table stores all admin information
create table admins(
	AdminEmail varchar(50) Primary Key,
    AdminFName varchar(30) NOT NULL,
    AdminLName varchar(30) NOT NULL);

-- Table stores all information about the sponsorship companies
create table sponsororganizations(
	OrganizationID int auto_increment Primary Key,
    OrganizationName varchar(30) NOT NULL UNIQUE,
    OrganizationDescription varchar(1024) NOT NULL default "",
    PointDollarRatio decimal(3,2) NOT NULL default 1.00,
    AmountOfProducts int NOT NULL default 10,
    ProductType varchar(20) NOT NULL default "All",
    MaxPrice decimal (6,2) NOT NULL default 100.00,
    SearchTerm varchar(255),
    HideDescription tinyint(1) default 0,
    LogoUrl varchar(1024),
    WebsiteUrl varchar(1024),
    HideWebsiteUrl tinyint(1) default 0,
    DailyPointChange decimal(3,1) NOT NULL default 5.0);

-- Table stores all information about sponsorship users
create table sponsorusers(
	UserEmail varchar(50) Primary Key,
    UserFName varchar(30) NOT NULL,
    UserLName varchar(30) NOT NULL,
    UserOrganization int NOT NULL,
    foreign key (UserOrganization) references sponsororganizations(OrganizationID) on update cascade on delete cascade);

-- Table stores all informaation on drivers
create table drivers(
	DriverEmail varchar(50) Primary Key,
    DriverFName varchar(30) NOT NULL,
    DriverLName varchar(30) NOT NULL,
    DriverPointChangeNotification tinyint(1) default 0,
    DriverOrderPlacedNotification tinyint(1) default 0,
    DriverOrderIssueNotification tinyint(1) default 0);

-- Table that stores driver's sponsors
create table driverssponsors(
	DriversEmail varchar(50),
    DriversSponsorID int,
    DriversPoints decimal(12,2) NOT NULL default 0.0,
    primary key (DriversEmail, DriversSponsorID),
    foreign key (DriversEmail) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (DriversSponsorID) references sponsororganizations(OrganizationID) on update cascade on delete cascade);

-- Create view to see all users
create view allusers as
	select AdminEmail as Email, AdminFName as "First Name", AdminLName as "Last Name", "Admin" as "Role"
	from admins
	union
	select UserEmail, UserFName, UserLName, "Sponsor"
	from sponsorusers
	union
	select DriverEmail, DriverFName, DriverLName, "Driver"
	from drivers
    order by Email;
describe DRS.pointchanges;
-- Table to store all point changes from driving actions
create table pointchanges(
	PointChangeID int Primary Key auto_increment,
    PointChangeDriver varchar(50) NOT NULL,
    PointChangeSponsor varchar(50) NOT NULL,
    PointChangeNumber decimal(8,2) NOT NULL,
    PointChangeAction varchar(200) NOT NULL,
    PointChangeDate date NOT NULL,
    PointChangeReason varchar(1000),
    foreign key (PointChangeDriver) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (PointChangeSponsor) references sponsorusers(UserEmail) on update cascade on delete cascade);

-- Trigger that automatically adds points to users point total
delimiter $$

-- Add points when inserted to table
create trigger insertpoints after insert
on pointchanges
for each row
begin
	update driverssponsors
    set DriversPoints = DriversPoints + NEW.PointChangeNumber
    where DriversEmail = NEW.PointChangeDriver and DriversSponsorID = (select UserOrganization from sponsorusers where UserEmail = NEW.PointChangeSponsor);
end$$

-- Modify points based on change in point value
create trigger updatepoints after update
on pointchanges
for each row
begin
	update driverssponsors
    set DriversPoints = DriversPoints + NEW.PointChangeNumber - OLD.PointChangeNumber
    where DriversEmail = NEW.PointChangeDriver and DriversSponsorID = (select UserOrganization from sponsorusers where UserEmail = NEW.PointChangeSponsor);
end$$

-- Add points to every driver daily
CREATE EVENT Add_Daily_Points
ON SCHEDULE EVERY 1 DAY
STARTS '2025-04-10 19:10:00'
DO
BEGIN
    -- Table used to store temporary point changes for daily additions
	create table temppointchanges(
		TempPointChangeID int Primary Key auto_increment,
		TempPointChangeDriver varchar(50) NOT NULL,
		TempPointChangeSponsor varchar(50) NOT NULL,
		TempPointChangeNumber decimal(8,2) NOT NULL,
		TempPointChangeAction varchar(200) NOT NULL,
		TempPointChangeDate date NOT NULL,
		TempPointChnagesReason varchar(1000),
		foreign key (TempPointChangeDriver) references drivers(DriverEmail) on update cascade on delete cascade,
		foreign key (TempPointChangeSponsor) references sponsorusers(UserEmail) on update cascade on delete cascade);
    
    insert into DRS.temppointchanges (TempPointChangeDriver, TempPointChangeSponsor, TempPointChangeNumber, TempPointChangeAction, TempPointChangeDate, TempPointChnagesReason)
	SELECT DriversEmail, UserEmail, DailyPointChange, "Add", CURRENT_TIMESTAMP, "Daily Point Change"
	FROM driverssponsors left join sponsororganizations on DriversSponsorID = OrganizationID
	left join sponsorusers on OrganizationID = UserOrganization
	group by DriversEmail, OrganizationID;

	insert into DRS.pointchanges (PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction, PointChangeDate, PointChangeReason)
	SELECT TempPointChangeDriver, TempPointChangeSponsor, TempPointChangeNumber, TempPointChangeAction, TempPointChangeDate, TempPointChnagesReason from DRS.temppointchanges;

	drop table temppointchanges;
END$$

delimiter ;

create table driversponsorapplications(
	ApplicationID int auto_increment Primary Key,
    ApplicationDriver varchar(50) NOT NULL,
    ApplicationOrganization int NOT NULL,
    ApplicationSponsorUser varchar(50),
    ApplicationStatus varchar(15) NOT NULL default "Submitted",
    ApplicationSubmittedDate date NOT NULL,
    ApplicationReason varchar(1000),
    ApplicationDecisionReason varchar(1000),
    foreign key (ApplicationDriver) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (ApplicationOrganization) references sponsororganizations(OrganizationID) on update cascade on delete cascade,
    foreign key (ApplicationSponsorUser) references sponsorusers(UserEmail) on update cascade on delete cascade);

-- Trigger for automatically adding driver sponsor relationship
delimiter $

create trigger updatedriverssponsors after update
on driversponsorapplications
for each row
begin
	if NEW.ApplicationStatus = "Approved" then
		insert into DRS.driverssponsors (DriversEmail, DriversSponsorID, DriversPoints)
        values (NEW.ApplicationDriver, NEW.ApplicationOrganization, 0);
	end if;
end$$

delimiter ;

create table purchases(
	PurchaseID int auto_increment Primary Key,
    PurchaseDriver varchar(50) NOT NULL,
    PurchaseDate date NOT NULL,
    PurchaseStatus varchar(20) NOT NULL,
    PurchaseSponsorID int NOT NULL,
    PurchasePrice decimal(10,2) NOT NULL default 0.00,
    foreign key (PurchaseDriver) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (PurchaseSponsorID) references sponsororganizations(OrganizationID) on update cascade on delete cascade);
    
create table productspurchased(
	ProductPurchasedID varchar(10),
    PurchaseAssociatedID int,
    ProductPurchaseQuantity int,
    primary key(ProductPurchasedID, PuchaseAssociatedID),
    foreign key (PuchaseAssociatedID) references purchases(PurchaseID) on update cascade on delete cascade);
    
-- Create store procedures to be used for reporting
delimiter $

create procedure AllDriversPointChanges(IN StartDate Date, IN EndDate Date, IN DriverEmail VARCHAR(255))
BEGIN
	SELECT PointChangeDate, PointChangeSponsor, PointChangeDriver, PointChangeNumber, PointChangeReason
  FROM DRS.pointchanges
  WHERE (StartDate IS NULL OR PointChangeDate >= StartDate) AND (EndDate IS NULL OR PointChangeDate <= EndDate)
    AND (DriverEmail IS NULL OR PointChangeDriver = DriverEmail)
  ORDER BY PointChangeDate DESC;
END$

create procedure SpecificDriverPointChanges(StartDate Date, EndDate Date, Driver varchar(50))
BEGIN
	select PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction, PointChangeDate from DRS.pointchanges
	where PointChangeDriver = Driver and PointChangeDate between StartDate and EndDate order by PointChangeDate Desc;
END$

create procedure AllSponsorInvoice(StartDate Date, EndDate Date)
BEGIN
	select PurchaseID, PurchaseDriver, PurchaseSponsorID, PurchaseDate, PurchaseStatus, PurchasePrice
	from DRS.purchases where PurchaseDate between StartDate and EndDate
	UNION ALL
	select 'Total Price', '', '', '', '',sum(PurchasePrice)
	from DRS.purchases where PurchaseDate between StartDate and EndDate
    order by PurchaseDate desc;
END$

create procedure SpecificSponsorInvoice(StartDate Date, EndDate Date, SponsorID int)
BEGIN
	select PurchaseID, PurchaseDriver, PurchaseSponsorID, PurchaseDate, PurchaseStatus, PurchasePrice
	from DRS.purchases where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
	UNION ALL
	select 'Total Price', '', '', '', '',sum(PurchasePrice)
	from DRS.purchases where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
    order by PurchaseDate desc;
END$

create procedure AllDriverApplications(IN StartDate Date, IN EndDate Date, IN SponsorID int, IN DriverEmail VARCHAR(255))
BEGIN
	SELECT ApplicationDriver, ApplicationOrganization, ApplicationStatus, ApplicationDateSubmitted, ApplicationReason
  FROM DRS.driversponsorapplications
  WHERE (StartDate IS NULL OR ApplicationDateSubmitted >= StartDate) AND (EndDate IS NULL OR ApplicationDateSubmitted <= EndDate)
    AND (SponsorID IS NULL OR ApplicationOrganization = SponsorID) AND (DriverEmail IS NULL OR ApplicationDriver = DriverEmail)
  ORDER BY ApplicationDateSubmitted DESC;
END$

create procedure AllPurchases(StartDate Date, EndDate Date, DetailLevel varchar(10))
BEGIN
	if DetailLevel = "summary" then
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		where PurchaseDate between StartDate and EndDate order by PurchaseDate Desc;
	else
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus,
		GROUP_CONCAT(ProductPurchasedID) AS ProductsPurchased, GROUP_CONCAT(ProductPurchaseQuantity) AS ProductPurchaseQuantity
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		left join DRS.productspurchased on PurchaseID = PurchaseAssociatedID
		where PurchaseDate between StartDate and EndDate group by PurchaseID order by PurchaseDate Desc;
	end if;
END$

create procedure SpecificSponsorPurchasees(StartDate Date, EndDate Date, SponsorID int, DetailLevel varchar(10))
BEGIN
	if DetailLevel = "summary" then
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate order by PurchaseDate Desc;
	else
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus,
		GROUP_CONCAT(ProductPurchasedID) AS ProductsPurchased, GROUP_CONCAT(ProductPurchaseQuantity) AS ProductPurchaseQuantity
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		left join DRS.productspurchased on PurchaseID = PurchaseAssociatedID
		where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
		group by PurchaseID order by PurchaseDate Desc;
    end if;
END$

create procedure SpecificDriverAllSponsorPurchasees(StartDate Date, EndDate Date, DriversEmail varchar(50), detailLevel varchar(10))
BEGIN
	if DetailLevel = "summary" then
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		where PurchaseDriver = DriversEmail and PurchaseDate between StartDate and EndDate
		order by PurchaseDate Desc;
	else
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus,
		GROUP_CONCAT(ProductPurchasedID) AS ProductsPurchased, GROUP_CONCAT(ProductPurchaseQuantity) AS ProductPurchaseQuantity
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		left join DRS.productspurchased on PurchaseID = PurchaseAssociatedID
		where PurchaseDriver = DriversEmail and PurchaseDate between StartDate and EndDate
		group by PurchaseID order by PurchaseDate Desc;
	end if;
END$

create procedure SpecificDriverSpecificSponsorPurchasees(StartDate Date, EndDate Date, DriversEmail varchar(50), SponsorID int, DetailLevel varchar(10))
BEGIN
	if DetailLevel = "summary" then
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		where PurchaseDriver = DriversEmail and PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
		order by PurchaseDate Desc;
	else
		select PurchaseDriver, OrganizationName, PurchaseDate, PurchaseStatus,
		GROUP_CONCAT(ProductPurchasedID) AS ProductsPurchased, GROUP_CONCAT(ProductPurchaseQuantity) AS ProductPurchaseQuantity
		from DRS.purchases left join DRS.sponsororganizations on PurchaseSponsorID = OrganizationID
		left join DRS.productspurchased on PurchaseID = PurchaseAssociatedID
		where PurchaseDriver = DriversEmail and PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
		group by PurchaseID order by PurchaseDate Desc;
    end if;
END$

delimiter ;
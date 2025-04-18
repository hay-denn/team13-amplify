-- Create the about schema
DROP SCHEMA IF EXISTS DRS;
CREATE SCHEMA DRS;
USE DRS;

-- Table stores all admin information
create table admins(
	AdminEmail varchar(50) Primary Key,
    AdminFName varchar(30) NOT NULL,
    AdminLName varchar(30) NOT NULL);

describe DRS.sponsororganizations;

-- Table stores all information about the sponsorship companies
create table sponsororganizations(
	OrganizationID int auto_increment Primary Key,
    OrganizationName varchar(30) NOT NULL UNIQUE,
    OrganizationDescription varchar(1024) NOT NULL default "",
    PointDollarRatio decimal(3,2) NOT NULL default 1.00,
    AmountOfProducts int NOT NULL default 10,
    ProductType varchar(20) NOT NULL default "All",
    SearchTerm varchar(255),
    HideDescription tinyint(1) default 0,
    LogoUrl varchar(1024),
    WebsiteUrl varchar(1024),
    HideWebsiteUrl tinyint(1) default 0);

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
    DriverLName varchar(30) NOT NULL);

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

-- Table to store all point changes from driving actions
create table pointchanges(
	PointChangeID int Primary Key auto_increment,
    PointChangeDriver varchar(50) NOT NULL,
    PointChangeSponsor varchar(50) NOT NULL,
    PointChangeNumber decimal(8,2) NOT NULL,
    PointChangeAction varchar(200) NOT NULL,
    PointChangeDate date NOT NULL,
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

delimiter ;

delimiter $

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
END$

delimiter ;

create table driversponsorapplications(
	ApplicationID int auto_increment Primary Key,
    ApplicationDriver varchar(50) NOT NULL,
    ApplicationOrganization int NOT NULL,
    ApplicationSponsorUser varchar(50),
    ApplicationStatus varchar(15) NOT NULL default "Submitted",
    ApplicationSubmittedDate date NOT NULL,
    foreign key (ApplicationDriver) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (ApplicationOrganization) references sponsororganizations(OrganizationID) on update cascade on delete cascade,
    foreign key (ApplicationSponsorUser) references sponsorusers(UserEmail) on update cascade on delete cascade);
    
-- Trigger for automatically adding driver sponsor relationship
delimiter $

create trigger updatedriverssponsors after update
on driversponsorapplications
for each row
begin
	if NEW.ApplicationStatus = "Accepted" then
		insert into DRS.driverssponsors (DriversEmail, DriversSponsorID, DriversPoints)
        values (NEW.ApplicationDriver, NEW.ApplicationOrganization, 0);
	end if;
end$$

delimiter ;
    
create table catalog(
	CatalogID int auto_increment Primary Key,
    CatalogOrganization int NOT NULL,
    foreign key (CatalogOrganization) references sponsororganizations(OrganizationID) on update cascade on delete cascade);
    
create table product(
	ProductID int auto_increment Primary Key,
    ProductCatalog int NOT NULL,
    ProductName varchar(50) NOT NULL,
    ProductDescription varchar(100),
    ProductPrice decimal(6,2) NOT NULL,
    ProductInventory int NOT NULL default 0,
    foreign key (ProductCatalog) references catalog(CatalogID) on update cascade on delete cascade);
    
create table purchases(
	PurchaseID int auto_increment Primary Key,
    PurchaseDriver varchar(50) NOT NULL,
    PurchaseDate date NOT NULL,
    PurchaseStatus varchar(20) NOT NULL,
    PurchaseSponsorID int NOT NULL,
    foreign key (PurchaseDriver) references drivers(DriverEmail) on update cascade on delete cascade,
    foreign key (PurchaseSponsorID) references sponsororganizations(OrganizationID) on update cascade on delete cascade);
    
create table productspurchased(
	ProductPurchasedID int,
    PurchaseAssociatedID int,
    ProductPurchaseQuantity int,
    primary key(ProductPurchasedID, PuchaseAssociatedID),
    foreign key (ProductPurchasedID) references product(ProductID) on update cascade on delete cascade,
    foreign key (PuchaseAssociatedID) references purchases(PurchaseID) on update cascade on delete cascade);
    
-- Create store procedures to be used for reporting
delimiter $

create procedure AllDriversPointChanges(StartDate Date, EndDate Date)
BEGIN
	select PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction, PointChangeDate from DRS.pointchanges
	where PointChangeDate between StartDate and EndDate order by PointChangeDate Desc;
END$

create procedure SpecificDriverPointChanges(StartDate Date, EndDate Date, Driver varchar(50))
BEGIN
	select PointChangeDriver, PointChangeSponsor, PointChangeNumber, PointChangeAction, PointChangeDate from DRS.pointchanges
	where PointChangeDriver = Driver and PointChangeDate between StartDate and EndDate order by PointChangeDate Desc;
END$

create procedure AllSponsorInvoice(StartDate Date, EndDate Date)
BEGIN
	select PurchaseDriver, sum(ProductPrice * ProductPurchaseQuantity) as Price, PurchaseDate
	from DRS.purchases join DRS.productspurchased join DRS.product;
END$

create procedure SpecificSponsorInvoice(StartDate Date, EndDate Date, SponsorID int)
BEGIN
	select PurchaseDriver, sum(ProductPrice * ProductPurchaseQuantity) as Price, PurchaseDate
	from DRS.purchases join DRS.productspurchased join DRS.product
    where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate order by PurchaseDate Desc;
END$

create procedure AllDriverApplications(StartDate Date, EndDate Date, SponsorID int)
BEGIN
	select ApplicationDriver, ApplicationOrganization, ApplicationStatus, ApplicationDateSubmitted
	from DRS.driversponsorapplications where ApplicationOrganization = SponsorID order by ApplicationDateSubmitted desc;
END$

create procedure SpecificSponsorPurchasees(StartDate Date, EndDate Date, SponsorID int)
BEGIN
	select PurchaseDriver, sum(ProductPrice * ProductPurchaseQuantity) as Price, PurchaseDate
	from DRS.purchases join DRS.productspurchased join DRS.product
    where PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate order by PurchaseDate Desc;
END$

create procedure SpecificDriverAllSponsorPurchasees(StartDate Date, EndDate Date, DriversEmail varchar(50))
BEGIN
	select PurchaseDriver, sum(ProductPrice * ProductPurchaseQuantity) as Price, PurchaseDate
	from DRS.purchases join DRS.productspurchased join DRS.product
    where PurchaseDriver = DriversEmail and PurchaseDate between StartDate and EndDate
    order by PurchaseDate Desc;
END$

create procedure SpecificDriverSpecificSponsorPurchasees(StartDate Date, EndDate Date, DriversEmail varchar(50), SponsorID int)
BEGIN
	select PurchaseDriver, sum(ProductPrice * ProductPurchaseQuantity) as Price, PurchaseDate
	from DRS.purchases join DRS.productspurchased join DRS.product
    where PurchaseDriver = DriversEmail and PurchaseSponsorID = SponsorID and PurchaseDate between StartDate and EndDate
    order by PurchaseDate Desc;
END$

delimiter ;
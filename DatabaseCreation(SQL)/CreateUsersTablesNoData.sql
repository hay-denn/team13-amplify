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
    OrganizationName varchar(30) NOT NULL);

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
    DriverSponsor int,
    DriverPoints decimal (12,2) default 0.0 NOT NULL,
    foreign key (DriverSponsor) references sponsororganizations(OrganizationID) on update cascade on delete cascade);

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
    foreign key (PointChangeDriver) references drivers(DriverEmail),
    foreign key (PointChangeSponsor) references sponsorusers(UserEmail));

-- Trigger that automatically adds points to users point total
delimiter $$

create trigger insertpoints after insert
on pointchanges
for each row
begin
	update drivers
    set DriverPoints = DriverPoints + NEW.PointChangeNumber
    where DriverEmail = NEW.PointChangeDriver;
end$$

create trigger updatepoints after update
on pointchanges
for each row
begin
	update drivers
    set DriverPoints = DriverPoints + NEW.PointChangeNumber - OLD.PointChangeNumber
    where DriverEmail = NEW.PointChangeDriver;
end$$

delimiter ;
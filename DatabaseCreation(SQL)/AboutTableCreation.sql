-- Create the about schema
DROP SCHEMA IF EXISTS About;
CREATE SCHEMA About;
USE About;

create table aboutteam(
	TeamNumber int Primary Key,
    SprintNumber int,
    ReleaseDate date,
    ProductName varchar(15),
    ProductDescription varchar(150));
    
create table teammembers(
	MemeberID int Primary Key auto_increment,
    FirstName varchar(20),
    LastName varchar(20));

insert into aboutteam(TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription)
values(13, 1, "2025-04-21", "TBD", "Reward drivers with points for good driving that they can use to purchase items from sponsor catalog");

insert into teammembers(FirstName, LastName)
values("Clayton", "Novak"),
		("Hayden", "Roof"),
        ("Jeff", "Branyon"),
        ("Matthew", "Pollehn"),
        ("Noah", "Nisbet");

select * from aboutteam;

select FirstName, LastName from teammembers
order by LastName asc;
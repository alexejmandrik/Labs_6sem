USE PIS;
GO

CREATE TABLE Celebrities (
    Id INT PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    Nationality NVARCHAR(100),
    ReqPhotoPath NVARCHAR(500)
);
GO
drop table Celebrities

--master
CREATE LOGIN pis_user 
WITH PASSWORD = '1234';
GO

--pis
CREATE USER pis_user FOR LOGIN pis_user;
GO
ALTER ROLE db_owner ADD MEMBER pis_user;
GO
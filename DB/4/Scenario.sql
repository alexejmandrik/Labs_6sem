drop database QGIS_DB

ALTER DATABASE [QGIS_DB]
SET SINGLE_USER WITH ROLLBACK IMMEDIATE;

create database QGIS_DB;

--6 
select * from dbo.geometry_columns;
select * from dbo.ne_10m_populated_places;
select * from dbo.spatial_ref_sys;
select * from dbo.[10m_rivers_lake_centerlines];


SELECT 'PopulatedPlaces' AS TableName, geom.STGeometryType() AS GeometryType
FROM dbo.ne_10m_populated_places GROUP BY geom.STGeometryType()
union all
SELECT 'Rivers' AS TableName, geom.STGeometryType() AS GeometryType
FROM dbo.[10m_rivers_lake_centerlines] GROUP BY geom.STGeometryType();

--7
SELECT 'PopulatedPlaces' AS TableName, geom.STSrid AS SRID
FROM dbo.ne_10m_populated_places GROUP BY geom.STSrid
UNION ALL
SELECT 'Rivers' AS TableName, geom.STSrid AS SRID
FROM dbo.[10m_rivers_lake_centerlines] GROUP BY geom.STSrid;

--8 Атрибутивные столбцы
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ne_10m_populated_places' AND DATA_TYPE NOT IN ('geometry', 'geography');

SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = '10m_rivers_lake_centerlines' AND DATA_TYPE NOT IN ('geometry', 'geography');

--9 
SELECT qgs_fid, geom.STAsText() AS WKT FROM dbo.[10m_rivers_lake_centerlines];

--10
SELECT r.name as NameRiver, m.name as MapUnits FROM dbo.[10m_rivers_lake_centerlines] r
JOIN dbo.[10m_admin_0_map_units] m on r.geom.STIntersects(m.geom) = 1;

SELECT name, geom.STPointN(1).STX AS X, geom.STPointN(1).STY AS Y FROM dbo.[10m_rivers_lake_centerlines];

SELECT name, geom.STArea() AS Area FROM dbo.[10m_admin_0_map_units];

--12

CREATE TABLE dbo.PointP (
    Id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100),
    geom GEOMETRY
);

CREATE TABLE dbo.LineL (
    Id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100),
    geom GEOMETRY
);

CREATE TABLE dbo.PolygonP (
    Id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(100),
    geom GEOMETRY
);


INSERT INTO dbo.PointP (name, geom)
VALUES ('PointP', geometry::STGeomFromText('POINT(30 10)', 4326));

INSERT INTO dbo.LineL (name, geom)
VALUES ('LineL', geometry::STGeomFromText('LINESTRING(30 10, 40 40, 50 20)', 4326));

INSERT INTO dbo.PolygonP (name, geom)
VALUES ('PolygonP', geometry::STGeomFromText('POLYGON((30 10, 40 40, 50 20, 30 10))', 4326));


SELECT p.name AS PointName, m.name AS MapUnit FROM dbo.PointP p 
JOIN dbo.[10m_admin_0_map_units] m ON m.geom.STContains(p.geom) = 1;

SELECT l.name AS LineName, m.name AS MapUnit FROM dbo.LineL l
JOIN dbo.[10m_admin_0_map_units] m ON l.geom.STIntersects(m.geom) = 1;

SELECT p.name AS PolygonName, m.name AS MapUnitFROM FROM dbo.PolygonP p
JOIN dbo.[10m_admin_0_map_units] m ON p.geom.STIntersects(m.geom) = 1;

--13
CREATE SPATIAL INDEX SInd_MapUnits
ON dbo.[10m_admin_0_map_units](geom)
USING GEOMETRY_GRID
WITH (
    BOUNDING_BOX = (-180, -90, 180, 90)
);

SELECT l.name, m.name FROM dbo.LineL l
JOIN dbo.[10m_admin_0_map_units] m ON l.geom.STIntersects(m.geom) = 1;

--14
CREATE PROCEDURE GetObjectByPoint
    @x FLOAT,
    @y FLOAT
AS
BEGIN
    DECLARE @point GEOMETRY;

    SET @point = geometry::STGeomFromText(
        'POINT(' + CAST(@x AS VARCHAR(20)) + ' ' + CAST(@y AS VARCHAR(20)) + ')',
        4326
    );

    SELECT name AS ObjectName, geom.STAsText() AS Geometry
    FROM dbo.[10m_admin_0_map_units] WHERE geom.STContains(@point) = 1;
END;

EXEC GetObjectByPoint 30, 10;
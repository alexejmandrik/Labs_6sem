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

--7 ЧТо такое SRID, еденицы измерения, 
SELECT 'PopulatedPlaces' AS TableName, geom.STSrid AS SRID
FROM dbo.ne_10m_populated_places GROUP BY geom.STSrid
UNION ALL
SELECT 'Rivers' AS TableName, geom.STSrid AS SRID
FROM dbo.[10m_rivers_lake_centerlines] GROUP BY geom.STSrid;

--8
SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ne_10m_populated_places' AND DATA_TYPE NOT IN ('geometry', 'geography');

SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = '10m_rivers_lake_centerlines' AND DATA_TYPE NOT IN ('geometry', 'geography');

--9 какие ещё типы бывают, в каких имзерениях
SELECT qgs_fid, geom.STAsText() AS WKT FROM dbo.[10m_rivers_lake_centerlines];

--10

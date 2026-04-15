SELECT *
FROM (
    SELECT 
        r.RoomID,
        EXTRACT(YEAR FROM l.PurchaseDate) AS Year,
        EXTRACT(MONTH FROM l.PurchaseDate) AS Month,
        COUNT(*) AS LicenseCount
    FROM Licenses l
    JOIN Rooms r ON l.RoomID = r.RoomID
    GROUP BY r.RoomID, EXTRACT(YEAR FROM l.PurchaseDate), EXTRACT(MONTH FROM l.PurchaseDate)
)
MODEL
    PARTITION BY (RoomID)
    DIMENSION BY (Year, Month)
    MEASURES (LicenseCount)
    RULES (
        LicenseCount[2026, 1] = LicenseCount[2025, 1] * 1.1,
        LicenseCount[2026, 2] = LicenseCount[2025, 2] * 1.1,
        LicenseCount[2026, 3] = LicenseCount[2025, 3] * 1.1
    );
    
    
    
    
SELECT *
FROM Licenses
MATCH_RECOGNIZE (
    PARTITION BY SoftwareID
    ORDER BY PurchaseDate
    MEASURES
        A.Price AS Price1,
        B.Price AS Price2,
        C.Price AS Price3
    ALL ROWS PER MATCH 
    PATTERN (A B C)
    DEFINE
        B AS B.Price < A.Price, 
        C AS C.Price > B.Price 
);

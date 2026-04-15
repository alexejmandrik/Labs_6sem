CREATE OR REPLACE TYPE License_OBJ AS OBJECT (
    LicenseID NUMBER,
    SoftwareID NUMBER,
    RoomID NUMBER,
    PurchaseDate DATE,
    ExpirationDate DATE,
    Price NUMBER,
    LicenseCount NUMBER,

    -- 1) метод экземпляра (функция)
    MEMBER FUNCTION TotalCost RETURN NUMBER,

    -- 2) процедура экземпляра
    MEMBER PROCEDURE UpdatePrice(p_price NUMBER),

    -- 3) MAP функция для сравнения
    MAP MEMBER FUNCTION GetCost RETURN NUMBER
);
/



CREATE OR REPLACE TYPE BODY License_OBJ AS

    -- 💰 вычисление стоимости
    MEMBER FUNCTION TotalCost RETURN NUMBER IS
    BEGIN
        RETURN Price * LicenseCount;
    END;

    -- ✏️ обновление цены
    MEMBER PROCEDURE UpdatePrice(p_price NUMBER) IS
    BEGIN
        SELF.Price := p_price;
    END;

    -- 📊 MAP функция (для сортировок/сравнений)
    MAP MEMBER FUNCTION GetCost RETURN NUMBER IS
    BEGIN
        RETURN Price * LicenseCount;
    END;

END;
/

CREATE TABLE License_OBJ_Table OF License_OBJ;



INSERT INTO License_OBJ_Table
SELECT License_OBJ(
    LicenseID,
    SoftwareID,
    RoomID,
    PurchaseDate,
    ExpirationDate,
    Price,
    LicenseCount
)
FROM Licenses;



CREATE OR REPLACE VIEW License_View AS
SELECT VALUE(l) AS License
FROM License_OBJ_Table l;


SELECT l.LicenseID, l.TotalCost()
FROM License_OBJ_Table l;


DECLARE
    l License_OBJ;
BEGIN
    SELECT VALUE(x)
    INTO l
    FROM License_OBJ_Table x
    WHERE LicenseID = 1;

    l.UpdatePrice(999);

    UPDATE License_OBJ_Table t
    SET t = l
    WHERE t.LicenseID = 1;
END;
/

CREATE INDEX idx_license_price
ON License_OBJ_Table(Price);


-- Не работает
CREATE INDEX idx_license_cost
ON License_OBJ_Table (VALUE(License_OBJ_Table).GetCost());


-- Не работает
SELECT *
FROM License_OBJ_Table
ORDER BY VALUE(License_OBJ_Table).GetCost();






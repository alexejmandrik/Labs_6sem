alter session set container = XEPDB1;

CREATE OR REPLACE PROCEDURE GetChildCategories (
    p_ParentCategoryID IN NUMBER,
    result_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN result_cursor FOR
    SELECT 
        CategoryID,
        CategoryName,
        ParentCategoryID,
        LEVEL - 1 AS Level
    FROM SoftwareCategories
    START WITH CategoryID = p_ParentCategoryID
    CONNECT BY PRIOR CategoryID = ParentCategoryID
    AND CategoryID <> p_ParentCategoryID;
END;
/


CREATE OR REPLACE PROCEDURE AddChildCategory (
    p_ParentCategoryID IN NUMBER,
    p_CategoryName IN NVARCHAR2
)
AS
BEGIN
    INSERT INTO SoftwareCategories (CategoryName, ParentCategoryID)
    VALUES (p_CategoryName, p_ParentCategoryID);
END;
/


CREATE OR REPLACE PROCEDURE MoveChildCategories (
    p_OldParentID IN NUMBER,
    p_NewParentID IN NUMBER
)
AS
BEGIN
    UPDATE SoftwareCategories
    SET ParentCategoryID = p_NewParentID
    WHERE ParentCategoryID = p_OldParentID;
END;
/
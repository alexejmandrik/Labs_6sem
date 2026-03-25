CREATE PROCEDURE GetDescendants
    @parentNode hierarchyid
AS
BEGIN
    SELECT 
        CategoryId,
        CategoryName,
        Hierarchy.ToString() AS NodePath,
        Hierarchy.GetLevel() AS Level
    FROM SoftwareCategories
    WHERE Hierarchy.IsDescendantOf(@parentNode) = 1
      AND Hierarchy <> @parentNode
    ORDER BY Hierarchy;
END

select * from SoftwareCategories;


CREATE PROCEDURE AddChildNode
    @parentNode hierarchyid,
    @categoryName NVARCHAR(100)
AS
BEGIN
    DECLARE @lastChild hierarchyid;
    DECLARE @newNode hierarchyid;

    SELECT @lastChild = MAX(Hierarchy)
    FROM SoftwareCategories
    WHERE Hierarchy.GetAncestor(1) = @parentNode;

    SET @newNode = @parentNode.GetDescendant(@lastChild, NULL);

    INSERT INTO SoftwareCategories (CategoryName, Hierarchy)
    VALUES (@categoryName, @newNode);
END


CREATE PROCEDURE MoveSubtree
    @oldParent hierarchyid,
    @newParent hierarchyid
AS
BEGIN
    DECLARE @lastChild hierarchyid;
    DECLARE @newSubtreeRoot hierarchyid;

    SELECT @lastChild = MAX(Hierarchy)
    FROM SoftwareCategories
    WHERE Hierarchy.GetAncestor(1) = @newParent;

    SET @newSubtreeRoot = @newParent.GetDescendant(@lastChild, NULL);

    UPDATE SoftwareCategories
    SET Hierarchy = Hierarchy.GetReparentedValue(@oldParent, @newSubtreeRoot)
    WHERE Hierarchy.IsDescendantOf(@oldParent) = 1;
END
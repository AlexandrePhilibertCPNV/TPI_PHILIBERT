SELECT * FROM (
    SELECT
        @row := @row + 1 AS rownum, fk_activity, start_timestamp
    FROM (
        SELECT @row := 0) r, tbl_position WHERE fk_activity = '569e405e-7481-41c9-941a-eff56a89c448'
    ) ranked
WHERE rownum % 10 = 1
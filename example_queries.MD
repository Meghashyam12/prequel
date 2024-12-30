CREATE student_table student_name:string,student_age:number
CREATE employee_table employee_name:string,employee_age:number

DROP employee_table

INSERT student_table Meghashyam,19
INSERT student_table Sudheer,16

SELECT student_table
SELECT student_table WHERE student_age < 18

UPDATE student_table student_age 18
UPDATE student_table student_age 18 WHERE student_age < 18

DELETE student_table WHERE student_name === Meghashyam
DELETE student_table

TRUNCATE student_table

SHOWDB

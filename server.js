const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {sql, poolPromise} = require('./db.js');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// const PORT = process.env.PORT || 5000;
const PORT = 5000; // Set the port to 5000 for local development

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// website 1 api: procdedure
app.get("/api/procedure", async (req, res) => {
    try {
        const { classId, courseId, semester, year } = req.query; // Extract query parameters

        if (!classId || !courseId || !semester || !year) {
            return res.status(400).json({
                success: false,
                message: "Missing required query parameters",
            });
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input("classId", sql.Char(3), classId)
            .input("courseId", sql.Char(6), courseId)
            .input("semester", sql.Char(1), semester)
            .input("year", sql.Char(2), year)
            .query(`
                SELECT * FROM dbo.ClassList(@classId, @courseId, @semester, @year)
            `);

        console.log(result);
        if(result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No data found for the given parameters",
            });
        }

        res.status(200).json({
            success: true,
            empData: result.recordset,
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Error fetching data",
        });
    }
});

// website 2 api: course
app.get("/api/course", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Course"); // Adjust query if needed
        
        res.status(200).json({
            success: true,
            empData: result.recordset,
        });
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching courses",
        });
    }
});
app.post("/api/course", async (req, res) => {
    try {
        const { course_id, credit_num, lesson_num, course_name, department_id, prerequisite_course_id } = req.body;

        // Validate required fields
        if (!course_id || !credit_num || !lesson_num || !course_name || !department_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        // Validate course_id format (e.g., must be exactly 6 characters long)
        const courseIdRegex = /^[A-Za-z0-9]{6}$/; // Adjust regex as needed
        if (!courseIdRegex.test(course_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course_id format. It must be exactly 6 alphanumeric characters.",
            });
        }
        if (credit_num < 0) {
            return res.status(400).json({
                success: false,
                message: "credit_num must be positive numbers.",
            });
        }
        if ( lesson_num < 0) {
            return res.status(400).json({
                success: false,
                message: "lesson_num must be positive numbers.",
            });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input("course_id", sql.Char(6), course_id)
            .input("credit_num", sql.Int, credit_num)
            .input("lesson_num", sql.Int, lesson_num)
            .input("course_name", sql.NVarChar(30), course_name)
            .input("department_id", sql.Int, department_id)
            .input("prerequisite_course_id", sql.Char(6), prerequisite_course_id || null) // Allow null for optional field
            .execute("insert_course"); // Call the stored procedure

        console.log(result);

        res.status(201).json({
            success: true,
            message: "Course added successfully",
        });
    } catch (err) {
        console.log("Error: ", err);
        if (err.number === 2627) {
            return res.status(400).json({
                success: false,
                message: `Duplicate course_id detected: ${req.body.course_id}. Please use a unique course_id.`,
            });
        }
        if(err.number === 547) {
            if(err.message.includes("FK_Course_Prerequisite")) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid prerequisite_course_id. Please ensure they exist in the database.",
                });
            } 
            return res.status(400).json({
                success: false,
                message: "Invalid department_id. Please ensure it exists in the database.",
            });
        }
        res.status(500).json({
            success: false,
            message: "Failed to add course",
        });
    }
});
app.put("/api/course/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { credit_num, lesson_num, course_name, department_id, prerequisite_course_id } = req.body;

        // Validate required fields
        if (!id || !credit_num || !lesson_num || !course_name || !department_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("course_id", sql.Char(6), id)
            .input("credit_num", sql.Int, credit_num)
            .input("lesson_num", sql.Int, lesson_num)
            .input("course_name", sql.NVarChar(30), course_name)
            .input("department_id", sql.Int, department_id)
            .input("prerequisite_course_id", sql.Char(6), prerequisite_course_id || null) // Allow null for optional field
            .execute("update_course"); // Call the stored procedure

        console.log(result);

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
        });
    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Error updating course",
        });
    }
});
app.delete("/api/course/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input("course_id", sql.Char(6), id) // Assuming id is the course_id
            .output("msg", sql.NVarChar(255)) // Output parameter for the message
            .execute("delete_course_safe"); // Call the safe stored procedure

        console.log(result);
        if(result.output.msg === 'Cannot delete course CO1005 because it is currently in use by one or more classes!') {
            return res.status(400).json({
                success: false,
                message: result.output.msg, // Return the message from the stored procedure
            });
        }
        res.status(200).json({
            success: true,
            message: result.output.msg, // Return the message from the stored procedure
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Error deleting course",
        });
    }
});
app.get("/api/class/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameter: studentId",
            });
        }
        
        const pool = await poolPromise;
        const result = await pool.request()
            .input("studentId", sql.Int, studentId)
            .execute("GetStudentRegistrations");
        if(result.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No registrations found for this student",
            });
        }
        res.status(200).json({
            success: true,
            registrations: result.recordset,
        });
    } catch (err) {
        console.error("Error fetching student registrations:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching student registrations",
        });
    }
});

// website 3 api: class
app.get("/api/class-list", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Class"); // Adjust query if needed
        res.status(200).json({
            success: true,
            classData: result.recordset, // Return the class list data
        });
    } catch (err) {
        console.error("Error fetching class list:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching class list",
        });
    }
});
app.post("/api/class", async (req, res) => {
    try {
        const {student_id, class_id, course_id, semester_No, semester_year } = req.body; // Extract data from the request body

        // Validate required fields
        if (!student_id || !class_id || !course_id || !semester_No || !semester_year) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("student_id", sql.Int, student_id)
            .input("class_id", sql.Char(3), class_id)
            .input("course_id", sql.Char(6), course_id)
            .input("semester_No", sql.Char(1), semester_No)
            .input("semester_year", sql.Char(2), semester_year)
            .query(`
                INSERT INTO Registration (student_id, class_id, course_id, semester_No, semester_year)
                VALUES (@student_id, @class_id, @course_id, @semester_No, @semester_year)
            `); // Adjust the query as per your database schema
        console.log(result);
        res.status(201).json({
            success: true,
            message: "Student registered to class successfully",
        });
    } catch (err) {
        console.error("Error registering student to class:", err);
        if (err.number === 2627) {
            return res.status(400).json({
                success: false,
                message: `Duplicate registration detected for student_id ${req.body.student_id} in class ${req.body.class_id}.`,
            });
        }
        res.status(500).json({
            success: false,
            message: "Error registering student to class",
        });
    }
});
app.delete("/api/class/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;
        const { class_id, course_name } = req.body; // Extract data from the request body

        if (!studentId || !class_id || !course_name) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("student_id", sql.Int, studentId)
            .input("class_id", sql.Char(3), class_id)
            .input("course_name", sql.NVarChar(30), course_name)
            .query(`
                DELETE FROM Registration
                WHERE student_id = @student_id
                AND class_id = @class_id
                AND course_id IN (
                    SELECT course_id
                    FROM Course
                    WHERE course_name = @course_name
                );
            `);

        res.status(200).json({
            success: true,
            message: "Student unregistered from class successfully",
        });
    } catch (err) {
        console.error("Error unregistering student from class:", err);
        res.status(500).json({
            success: false,
            message: "Error unregistering student from class",
        });
    }
});

const API_URL2 = "http://localhost:5000/api/course";
async function fetchCourses() {
    try {
        const response = await fetch(API_URL2); // API_URL2 is already defined as "/api/course"
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const courseList = document.getElementById("course-list");
        courseList.innerHTML = ""; // Clear previous results

        if (data.success) {
            // Create a table element
            const table = document.createElement("table");
            table.border = "1";
            table.style.width = "100%";

            // Create the table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Course ID", "Name", "Credits", "Lessons", "Department ID", "Prerequisite", "Actions"];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create the table body
            const tbody = document.createElement("tbody");
            data.empData.forEach(course => {
                const row = document.createElement("tr");
                const cells = [
                    course.course_id,
                    course.course_name,
                    course.credit_num,
                    course.lesson_num,
                    course.department_id,
                    course.prerequisite_course_id || "None"
                ];
                cells.forEach(cellText => {
                    const td = document.createElement("td");
                    td.textContent = cellText;
                    row.appendChild(td);
                });

                // Add action buttons
                const actionTd = document.createElement("td");

                // Delete button
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-button"); 
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", async () => {
                    if (confirm(`Are you sure you want to delete course ${course.course_id}?`)) {
                        try {
                            const deleteResponse = await fetch(`${API_URL2}/${course.course_id}`, {
                                method: "DELETE",
                            });
                            const deleteData = await deleteResponse.json();
                            if (deleteData.success) {
                                alert("Course deleted successfully!");
                            } else {
                                alert(deleteData.message || "Failed to delete course.");
                            }
                        } catch (error) {
                            console.error("Error deleting course:", error);
                        }
                    }
                });
                actionTd.appendChild(deleteButton);

                // Update button
                const updateButton = document.createElement("button");
                updateButton.textContent = "Update";
                updateButton.classList.add("update-button"); 
                updateButton.addEventListener("click", () => {
                    // Populate form fields with course data for updating
                    const courseForm = document.getElementById("course-form");
                    courseForm.courseid.value = course.course_id;
                    courseForm.coursename.value = course.course_name;
                    courseForm.creditnum.value = course.credit_num;
                    courseForm.lessonnum.value = course.lesson_num;
                    courseForm.departmentid.value = course.department_id;
                    courseForm.prerequisite.value = course.prerequisite_course_id || "";
                    const addCourseButton = document.getElementById("add-course-button");
                    addCourseButton.style.display = "none"; // Hide the add button
                    const finalUpdateButton = document.getElementById("final-update-button");
                    finalUpdateButton.style.display = "block"; // Show the update button
                    finalUpdateButton.onclick = async () => {
                        try {
                            const updateResponse = await fetch(`${API_URL2}/${courseForm.courseid.value}`, {
                                method: "PUT",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    course_name: courseForm.coursename.value,
                                    credit_num: courseForm.creditnum.value,
                                    lesson_num: courseForm.lessonnum.value,
                                    department_id: courseForm.departmentid.value,
                                    prerequisite_course_id: courseForm.prerequisite.value || null,
                                }),
                            });
                            const updateData = await updateResponse.json();
                            if (updateData.success) {
                                alert("Course updated successfully!");
                                // fetchCourses(); // Refresh the course list
                            }  else {
                                alert("Failed to add course.");
                            }
                        } catch (error) {
                            console.error("Error updating course:", error);
                        }

                        finalUpdateButton.style.display = "none"; // Hide the update button after updating
                        addCourseButton.style.display = "block"; // Show the add button again
                        courseForm.reset(); // Reset the form fields
                    };
                    
                });
                actionTd.appendChild(updateButton);

                row.appendChild(actionTd);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            // Append the table to the course list container
            courseList.appendChild(table);
        } else {
            courseList.textContent = "Failed to fetch courses.";
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}
fetchCourses(); // Call the function to fetch and display courses on page load
document.getElementById("course-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const courseform = document.getElementById("course-form");
    const submitter = e.submitter; // Get the button that triggered the form submission

    if (submitter.id === "add-course-button") {
        // Handle "Add Course" action
        const courseid = courseform.courseid.value;
        const coursename = courseform.coursename.value;
        const creditnum = courseform.creditnum.value;
        const lessonnum = courseform.lessonnum.value;
        const departmentid = courseform.departmentid.value;
        const prerequisite = courseform.prerequisite.value; // Optional field

        try {
            const response = await fetch(API_URL2, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    course_id: courseid,
                    course_name: coursename,
                    credit_num: creditnum,
                    lesson_num: lessonnum,
                    department_id: departmentid,
                    prerequisite_course_id: prerequisite || null, // Allow null for optional field
                }),
            });

            const data = await response.json();
            if (data.success) {
                alert("Course added successfully!");
                courseform.reset(); // Reset the form fields
            } else {
                alert(data.message || "Failed to add course.");
            }
        } catch (error) {
            console.error("Error adding course:", error);
        }
    }
});

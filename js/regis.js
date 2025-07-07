const API_URL3 = "http://localhost:5000/api/class"; // Assuming this is the correct endpoint for classes
const API_URL2 = "http://localhost:5000/api/class-list"; // Assuming this is the correct endpoint for courses
document.getElementById("studying-class-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const studentId = document.getElementById("studentid").value;

    try {
        const response = await fetch(`${API_URL3}/${studentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        const studyingClassList = document.getElementById("studying-class-list");
        studyingClassList.innerHTML = ""; // Clear previous results

        if (data.success) {
            alert("Query successfully!");
        
            // Create a table element
            const table = document.createElement("table");
            table.border = "1";
            table.style.width = "100%";
        
            // Create the table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Student ID", "Last Name", "First Name", "Course Name", "Class ID", "Room", "Actions"];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
        
            // Create the table body
            const tbody = document.createElement("tbody");
            data.registrations.forEach(registration => {
                const row = document.createElement("tr");
        
                // Add table cells for registration data
                const cells = [
                    registration.student_id,
                    registration.last_name,
                    registration.first_name,
                    registration.course_name,
                    registration.class_id,
                    registration.room,
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
                    if (confirm(`Are you sure you want to delete registration for Student ID ${registration.student_id}?`)) {
                        try {
                            const deleteResponse = await fetch(`${API_URL3}/${registration.student_id}`, {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    class_id: registration.class_id,
                                    course_name: registration.course_name,
                                }),
                            });
                            const deleteData = await deleteResponse.json();
                            if (deleteData.success) {
                                alert("Registration deleted successfully!");
                                row.remove(); // Remove the row from the table
                            } else {
                                alert("Failed to delete registration.");
                            }
                        } catch (error) {
                            console.error("Error deleting registration:", error);
                        }
                    }
                });
                actionTd.appendChild(deleteButton);
        
        
                row.appendChild(actionTd);
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
        
            // Append the table to the studying class list container
            studyingClassList.appendChild(table);
        } else {
            alert(data.message || "Failed to fetch registrations.");
        }
    } catch (error) {
        console.error("Error fetching student registrations:", error);
    }
});
// Registration: student_id, class_id, course_id, semesterNo, semester_year
// Insert registraton: student_id, class_id.
async function fetchClasses() {
    try {
        const response = await fetch(API_URL2); // Use API_URL2 for fetching classes
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const classList = document.getElementById("class-list"); // Assuming the container is still named "course-list"
        classList.innerHTML = ""; // Clear previous results

        if (data.success) {
            // Create a table element
            const table = document.createElement("table");
            table.border = "1";
            table.style.width = "100%";

            // Create the table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = [
                "Class ID", "Course ID", "Semester No", "Semester Year", 
                "Instructor ID", "Date of Week", "Start Lesson No", 
                "Lesson Num", "Student Num", "Room", "Campus", "Building", "Actions"
            ];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create the table body
            const tbody = document.createElement("tbody");
            data.classData.forEach(classItem => {
                const row = document.createElement("tr");
                const cells = [
                    classItem.class_id,
                    classItem.course_id,
                    classItem.semester_No,
                    classItem.semester_year,
                    classItem.instructor_id,
                    classItem.date_of_week,
                    classItem.start_lesson_No,
                    classItem.lesson_num,
                    classItem.student_num,
                    classItem.room,
                    classItem.campus,
                    classItem.building
                ];
                cells.forEach(cellText => {
                    const td = document.createElement("td");
                    td.textContent = cellText;
                    row.appendChild(td);
                });

                // Add action buttons
                const actionTd = document.createElement("td");

                // Insert button
                const insertButton = document.createElement("button");
                insertButton.textContent = "Register";
                insertButton.classList.add("insert-button");
                insertButton.addEventListener("click", async () => {
                    // const studentId = prompt("Enter Student ID to register for this class:");
                    const studentId = document.getElementById("studentid").value; // Get the student ID from the input field
                    if (studentId) {
                        try {
                            const response = await fetch(API_URL3, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    student_id: studentId,
                                    class_id: classItem.class_id,
                                    course_id: classItem.course_id,
                                    semester_No: classItem.semester_No,
                                    semester_year: classItem.semester_year,
                                }),
                            });
                            const data = await response.json();
                            if (data.success) {
                                alert("Class registered successfully!");
                            } else {
                                alert(data.message || "Failed to register class.");
                            }
                        } catch (error) {
                            console.error("Error registering class:", error);
                        }
                    }
                });
                actionTd.appendChild(insertButton);

                row.appendChild(actionTd);
                
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            // Append the table to the class list container
            classList.appendChild(table);
        } else {
            alert(data.message || "Failed to fetch classes.");
        }
    } catch (error) {
        console.error("Error fetching classes:", error);
    }
}
document.getElementById("fetch-class-list-button").addEventListener("click", async () => {
    const classList = document.getElementById("class-list");
    
    if (classList.style.display === "none" || classList.style.display === "") {
        // Show the class list and fetch data
        classList.style.display = "block";
        await fetchClasses(); // Call the fetchClasses function to load the class list
    } else {
        // Hide the class list
        classList.style.display = "none";
    }
});
document.getElementById("search-studying-class").addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    const table = document.querySelector("#studying-class-list table");
    if (table) {
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
            const cells = Array.from(row.querySelectorAll("td"));
            const courseNameCell = cells[3]; // Assuming the 4th column (index 3) contains course_name
            if (courseNameCell && courseNameCell.textContent.toLowerCase().includes(searchQuery)) {
                row.style.display = ""; // Show row
            } else {
                row.style.display = "none"; // Hide row
            }
        });
    }
});
// document.getElementById("filer-studying-class-list").addEventListener("click", async () => {
//     const table = document.querySelector("#studying-class-list table");
//     if (table) {
//         const rows = table.querySelectorAll("tbody tr");
//         rows.forEach((row) => {
//             const cells = Array.from(row.querySelectorAll("td"));
//             const courseNameCell = cells.find(cell => cell.textContent.toLowerCase().includes("course name"));
//             if (courseNameCell) {
//                 const courseName = courseNameCell.textContent.toLowerCase();
//                 if (courseName.startsWith("a")) { // Example filter: show rows where course name starts with "A"
//                     row.style.display = ""; // Show row
//                 } else {
//                     row.style.display = "none"; // Hide row
//                 }
//             }
//         });
//     }
// });
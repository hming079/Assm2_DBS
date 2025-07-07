const API_URL = "http://localhost:5000/api/procedure";
const API_URL2 = "http://localhost:5000/api/course";
const API_URL3 = "http://localhost:5000/api/class"; // Assuming this is the correct endpoint for classes

document.getElementById("class-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const classid = document.getElementById("classid").value;
    const courseid = document.getElementById("courseid").value;
    const semester = document.getElementById("semester").value;
    const year = document.getElementById("year").value;

    try {
        const response = await fetch(`${API_URL}?classId=${classid}&courseId=${courseid}&semester=${semester}&year=${year}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    
        const data = await response.json();
        if (data.success) {
            alert("Query successfully!");
            const classList = document.getElementById("class-list");
            classList.innerHTML = ""; // Clear previous results
    
            // Create a table element
            const table = document.createElement("table");
            table.classList.add("class-table");
    
            // Create the table header
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            const headers = ["Student ID", "Last Name", "First Name", "Email", "Phone"];
            headers.forEach(headerText => {
                const th = document.createElement("th");
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
    
            // Create the table body
            const tbody = document.createElement("tbody");
            data.empData.forEach(classItem => {
                const row = document.createElement("tr");
                const cells = [
                    classItem.student_id,
                    classItem.last_name,
                    classItem.first_name,
                    classItem.email,
                    classItem.phone_number,
                ];
                cells.forEach(cellText => {
                    const td = document.createElement("td");
                    td.textContent = cellText;
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
    
            // Append the table to the class list container
            classList.appendChild(table);
        } else {
            alert(data.message ||"No class found for the given criteria.");
        }
    } catch (error) {
        console.error("Error fetching class data:", error);
    }
});

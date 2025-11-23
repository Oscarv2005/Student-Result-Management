document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBtn");
  const schoolInput = document.getElementById("schoolNameInput");

  downloadBtn.addEventListener("click", () => {

    let schoolFilter = schoolInput.value.trim().toLowerCase();
    if (!schoolFilter) {
      alert("Please enter school name first!");
      return;
    }

    let students = JSON.parse(localStorage.getItem("students") || "[]");

    let filtered = students.filter(s =>
      (s.schoolName || "").toLowerCase() === schoolFilter
    );

    if (filtered.length === 0) {
      alert("No records found for this school!");
      return;
    }

    let excelData = [];

    filtered.forEach(s => {
      s.results.forEach(r => {
        excelData.push({
          Name: s.name,
          Class: s.className,
          Roll_No: s.rollNo,
          School: s.schoolName,
          Subject: r.subject,
          Marks: r.marks,
          Total: s.total,
          Percentage: s.percentage,
          Grade: s.grade
        });
      });
    });

    let sheet = XLSX.utils.json_to_sheet(excelData);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Filtered Records");
    XLSX.writeFile(workbook, "Filtered_Records.xlsx");
  });
});

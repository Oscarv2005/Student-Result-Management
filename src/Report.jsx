import { useState } from "react";

function Report({ studentsData }) {
  const [searchFilters, setSearchFilters] = useState({
    university: "",
    school: "",
    studentName: "",
    rollNo: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);

  const getGradeClass = (grade) => {
    const classMap = {
      "O": "grade-o",
      "A+": "grade-a-plus",
      A: "grade-a",
      "B+": "grade-b-plus",
      B: "grade-b",
      C: "grade-c",
      D: "grade-d",
      F: "grade-f",
    };
    return classMap[grade] || "grade-f";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setSearchFilters({
      university: "",
      school: "",
      studentName: "",
      rollNo: "",
    });
    setSelectedStudent(null);
  };

  const isSearching =
    searchFilters.university.trim() !== "" ||
    searchFilters.school.trim() !== "" ||
    searchFilters.studentName.trim() !== "" ||
    searchFilters.rollNo.trim() !== "";

  const filteredStudents = studentsData.filter((student) => {
    return (
      (student.university || "")
        .toLowerCase()
        .includes(searchFilters.university.toLowerCase()) &&
      (student.school || "")
        .toLowerCase()
        .includes(searchFilters.school.toLowerCase()) &&
      (student.studentName || "")
        .toLowerCase()
        .includes(searchFilters.studentName.toLowerCase()) &&
      (student.rollNo || "")
        .toLowerCase()
        .includes(searchFilters.rollNo.toLowerCase())
    );
  });

  return (
    <div className="page-container">
      <h1 className="page-title">Institutional Grade Ledger</h1>
      <p className="page-subtitle">
        Search, isolate, and evaluate historical performance records.
      </p>

      <div className="search-container">
        <div className="search-grid">
          <div className="form-group">
            <label>Filter by University</label>
            <input
              type="text"
              name="university"
              className="search-input"
              placeholder="Search university branch..."
              value={searchFilters.university}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Filter by School</label>
            <input
              type="text"
              name="school"
              className="search-input"
              placeholder="Search school branch..."
              value={searchFilters.school}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Filter by Student Name</label>
            <input
              type="text"
              name="studentName"
              className="search-input"
              placeholder="Search full name..."
              value={searchFilters.studentName}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Filter by Roll Number</label>
            <input
              type="text"
              name="rollNo"
              className="search-input"
              placeholder="Search unique ID code..."
              value={searchFilters.rollNo}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <button type="button" className="clear-button" onClick={handleClear}>
          Clear Query Constraints
        </button>
      </div>

      {!isSearching ? (
        <div className="results-container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>Waiting for Search Parameters</h3>
            <p>
              Please enter a university, school, student name, or roll number to
              display specific match records.
            </p>
          </div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="results-container">
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3>No Profile Matches</h3>
            <p>Modify search filters to fetch associated database entries.</p>
          </div>
        </div>
      ) : (
        <div className="results-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Institution / Branch</th>
                <th>Average Marks</th>
                <th style={{ textAlign: "right" }}>Overall Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() =>
                    setSelectedStudent(
                      selectedStudent?.id === student.id ? null : student,
                    )
                  }
                >
                  <td className="student-info">{student.studentName}</td>
                  <td>{student.rollNo}</td>
                  <td>
                    {student.institutionType === "university"
                      ? student.university
                      : student.school}
                  </td>
                  <td className="marks-color">{student.averageMarks}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className={`cyber-badge ${getGradeClass(student.overallGrade)}`}
                    >
                      {student.overallGrade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isSearching &&
        selectedStudent &&
        filteredStudents.some((s) => s.id === selectedStudent.id) && (
          <div className="student-detail-card">
            <div className="student-detail-header">
              <div>
                <h2>{selectedStudent.studentName} — Detailed Report Card</h2>
                <p>
                  Affiliation:{" "}
                  {selectedStudent.institutionType === "university"
                    ? `${selectedStudent.university} [${selectedStudent.degreeProgram || selectedStudent.degree}]`
                    : selectedStudent.school}
                </p>
              </div>
              <div className="overall-grade-circle glow-grade">
                {selectedStudent.overallGrade}
              </div>
            </div>
            <div className="student-detail-body">
              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <div className="label">Evaluated Courses</div>
                  <div className="value">{selectedStudent.subjects.length}</div>
                </div>
                <div className="detail-meta-item">
                  <div className="label">Cumulative Session Mean</div>
                  <div className="value marks-color">
                    {selectedStudent.averageMarks}
                  </div>
                </div>
              </div>
              <div className="results-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Academic Subject Field</th>
                      <th>Marks Obtained</th>
                      <th style={{ textAlign: "right" }}>
                        Assigned Letter Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent.subjects.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.subject}</td>
                        <td className="marks-color">{item.marks}</td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className={`cyber-badge ${getGradeClass(item.grade)}`}
                          >
                            {item.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default Report;

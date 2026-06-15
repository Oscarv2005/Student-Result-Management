import { useState } from "react";

function Result({ onAddStudent }) {
  const [formData, setFormData] = useState({
    institutionType: "school",
    studentName: "",
    rollNo: "",
    university: "",
    school: "",
    degree: "",
    subjects: [],
  });

  const [subjectMarks, setSubjectMarks] = useState({});
  const [alert, setAlert] = useState(null);
  const [submittedStudent, setSubmittedStudent] = useState(null);
  const [newSubject, setNewSubject] = useState("");

  const getGrade = (marks) => {
    const marksNum = parseFloat(marks);
    if (marksNum >= 90) return "O";
    if (marksNum >= 80) return "A+";
    if (marksNum >= 70) return "A";
    if (marksNum >= 60) return "B+";
    if (marksNum >= 50) return "B";
    if (marksNum >= 45) return "C";
    if (marksNum >= 40) return "D";
    return "F";
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      institutionType: type,
      university: "",
      school: "",
      degree: "",
    }));
  };

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (!trimmed) return;
    if (formData.subjects.includes(trimmed)) {
      setAlert({
        type: "error",
        message: `${trimmed} has already been configured.`,
      });
      return;
    }
    setFormData((prev) => ({ ...prev, subjects: [...prev.subjects, trimmed] }));
    setNewSubject("");
  };

  const handleRemoveSubject = (subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
    setSubjectMarks((prev) => {
      const updated = { ...prev };
      delete updated[subject];
      return updated;
    });
  };

  const handleMarksChange = (subject, marks) => {
    setSubjectMarks((prev) => ({ ...prev, [subject]: marks }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isUniversity = formData.institutionType === "university";

    if (
      !formData.studentName ||
      !formData.rollNo ||
      (isUniversity
        ? !formData.university || !formData.degree
        : !formData.school) ||
      formData.subjects.length === 0
    ) {
      setAlert({
        type: "error",
        message: "Form incomplete. Verify all required structural entries.",
      });
      return;
    }

    for (let subject of formData.subjects) {
      if (subjectMarks[subject] === undefined || subjectMarks[subject] === "") {
        setAlert({
          type: "error",
          message: `Please input valid evaluation marks for ${subject}.`,
        });
        return;
      }
      const marks = parseFloat(subjectMarks[subject]);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        setAlert({
          type: "error",
          message: `Invalid values. ${subject} score must fall inside 0-100.`,
        });
        return;
      }
    }

    const subjectDetails = formData.subjects.map((subject) => {
      const marks = parseFloat(subjectMarks[subject]);
      return { subject, marks, grade: getGrade(marks) };
    });

    const averageMarks =
      subjectDetails.reduce((sum, d) => sum + d.marks, 0) /
      subjectDetails.length;
    const overallGrade = getGrade(averageMarks);

    const studentData = {
      institutionType: formData.institutionType,
      studentName: formData.studentName,
      rollNo: formData.rollNo,
      university: formData.university,
      school: formData.school,
      degree: formData.degree,
      subjects: subjectDetails,
      averageMarks: averageMarks.toFixed(2),
      overallGrade,
    };

    onAddStudent(studentData);
    setSubmittedStudent(studentData);
    setAlert({
      type: "success",
      message: "Student metrics saved into institutional ledger.",
    });

    setFormData({
      institutionType: formData.institutionType,
      studentName: "",
      rollNo: "",
      university: "",
      school: "",
      degree: "",
      subjects: [],
    });
    setSubjectMarks({});
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Enter Academic Marks</h1>
      <p className="page-subtitle">
        Register individual student evaluations and course milestones.
      </p>

      {alert && (
        <div className={`alert ${alert.type}`}>
          <span>{alert.message}</span>
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Student Profile Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student Full Name *</label>
                <input
                  type="text"
                  name="studentName"
                  placeholder="e.g. John Smith"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Roll Number / Registration ID *</label>
                <input
                  type="text"
                  name="rollNo"
                  placeholder="Unique academic index code"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Institutional Affiliation</h3>
            <div className="toggle-grid">
              <button
                type="button"
                className={`toggle-item ${formData.institutionType === "school" ? "active" : ""}`}
                onClick={() => handleTypeChange("school")}
              >
                School
              </button>
              <button
                type="button"
                className={`toggle-item ${formData.institutionType === "university" ? "active" : ""}`}
                onClick={() => handleTypeChange("university")}
              >
                University Faculty
              </button>
            </div>

            {formData.institutionType === "school" ? (
              <div className="form-row">
                <div className="form-group">
                  <label>School Name *</label>
                  <input
                    type="text"
                    name="school"
                    placeholder="Enter branch/campus name"
                    value={formData.school}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>University Campus Name *</label>
                  <input
                    type="text"
                    name="university"
                    placeholder="Enter formal university title"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Degree Track / Program *</label>
                  <input
                    type="text"
                    name="degree"
                    placeholder="e.g. Bachelor of Science"
                    value={formData.degree}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Course Registration</h3>
            <div className="form-group">
              <label>Add Course Module</label>
              <div className="input-with-button">
                <input
                  type="text"
                  placeholder="e.g. English Literature"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                />
                <button
                  type="button"
                  className="action-neon-button"
                  onClick={handleAddSubject}
                >
                  + Add Course
                </button>
              </div>
            </div>
            {formData.subjects.length > 0 && (
              <div className="cyber-tags-container">
                {formData.subjects.map((subject) => (
                  <div key={subject} className="cyber-tag">
                    <span>{subject}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.subjects.length > 0 && (
            <div className="form-section">
              <h3 className="form-section-title">
                Mark Allocation (0-100 Scale)
              </h3>
              <div className="marks-list">
                {formData.subjects.map((subject) => (
                  <div key={subject} className="marks-row-item">
                    <span className="subject-row-label">{subject}</span>
                    <div className="marks-input-wrapper">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Marks"
                        value={subjectMarks[subject] ?? ""}
                        onChange={(e) =>
                          handleMarksChange(subject, e.target.value)
                        }
                      />
                      {subjectMarks[subject] !== undefined &&
                        subjectMarks[subject] !== "" && (
                          <div
                            className={`cyber-badge ${getGradeClass(getGrade(subjectMarks[subject]))}`}
                          >
                            {getGrade(subjectMarks[subject])}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-hero btn-primary">
              Commit Result Profile
            </button>
          </div>
        </form>
      </div>

      {submittedStudent && (
        <div className="student-detail-card">
          <div className="student-detail-header">
            <div>
              <h2>{submittedStudent.studentName}</h2>
              <p>Registration Token: {submittedStudent.rollNo}</p>
            </div>
            <div className="overall-grade-circle glow-grade">
              {submittedStudent.overallGrade}
            </div>
          </div>
          <div className="student-detail-body">
            <div className="results-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Registered Course Title</th>
                    <th>Earned Marks</th>
                    <th style={{ textAlign: "right" }}>Letter Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {submittedStudent.subjects.map((item, idx) => (
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

export default Result;

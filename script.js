document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('studentForm');
  const resultsContainer = document.getElementById('resultsContainer');
  const clearBtn = document.getElementById('clearBtn');
  const studentIdInput = document.getElementById('studentId');

  const pendingEditIndex = localStorage.getItem('editIndex');
if (pendingEditIndex !== null) {
  try {
    const idx = Number(pendingEditIndex);
    localStorage.removeItem('editIndex');
    populateFormForEdit(idx);
  } catch (e) {}
}


  (function addControls() {
    const header = resultsContainer.querySelector('h3');
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    controls.style.marginTop = '8px';
    controls.style.alignItems = 'center';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Add Subject';
    addBtn.style.padding = '6px 10px';
    addBtn.style.fontSize = '14px';

    addBtn.addEventListener('click', addResultRow);
    controls.appendChild(addBtn);
    header.insertAdjacentElement('afterend', controls);
  })();

  function attachRemoveButtons() {
    resultsContainer.querySelectorAll('.result-row').forEach(row => {
      if (!row.querySelector('.remove-subject')) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Remove';
        remove.className = 'remove-subject';
        remove.style.minWidth = '80px';
        remove.addEventListener('click', () => {
          row.remove();
        });
        row.appendChild(remove);
      }
    });
  }

  attachRemoveButtons();

  function addResultRow(subject = '', marks = '') {
    const row = document.createElement('div');
    row.className = 'result-row';

    const subj = document.createElement('input');
    subj.placeholder = 'Subject';
    subj.className = 'subject';
    subj.required = true;
    subj.value = subject;

    const m = document.createElement('input');
    m.type = 'number';
    m.placeholder = 'Marks';
    m.className = 'marks';
    m.required = true;
    m.min = 0;
    m.max = 100;
    m.value = marks;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Remove';
    remove.className = 'remove-subject';
    remove.style.minWidth = '80px';
    remove.addEventListener('click', () => row.remove());

    row.appendChild(subj);
    row.appendChild(m);
    row.appendChild(remove);

    resultsContainer.appendChild(row);
  }

  function collectFormData() {
    const name = form.name.value.trim();
    const className = form['class'].value.trim();
    const rollNo = form.rollNo.value.trim();

    if (!name || !className || !rollNo) {
      throw new Error('Name, Class and Roll No are required.');
    }

    const rows = Array.from(resultsContainer.querySelectorAll('.result-row'));
    if (rows.length === 0) throw new Error('Add at least one subject.');

    const results = rows.map((row, idx) => {
      const subjectEl = row.querySelector('.subject');
      const marksEl = row.querySelector('.marks');
      const subj = subjectEl?.value?.trim();
      const marksRaw = marksEl?.value;

      if (!subj) throw new Error(`Subject name required for row ${idx + 1}.`);
      if (marksRaw === '' || marksRaw == null) throw new Error(`Marks required for "${subj}".`);
      const marks = Number(marksRaw);
      if (Number.isNaN(marks) || marks < 0 || marks > 100) throw new Error(`Marks for "${subj}" must be 0–100.`);

      return { subject: subj, marks };
    });

    return { name, className, rollNo, results };
  }

  function computeTotals(results) {
    const total = results.reduce((s, r) => s + r.marks, 0);
    const maxTotal = results.length * 100;
    const percentage = (total / maxTotal) * 100;
    let grade;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';
    return { total, percentage: Number(percentage.toFixed(2)), grade };
  }

  function loadStudents() {
    try {
      const raw = localStorage.getItem('students');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveStudents(list) {
    localStorage.setItem('students', JSON.stringify(list));
  }

  function openDetailModal(student) {
    let txt = `Name: ${student.name}\nClass: ${student.className}\n
    Roll: ${student.rollNo}\nTotal: ${student.total} / ${student.results.length * 100}\n
    Percentage: ${student.percentage}%\nGrade: ${student.grade}\n\nSubjects:\n`;
    student.results.forEach(r => {
      txt += ` - ${r.subject}: ${r.marks}\n`;
    });
    alert(txt);
  }

  function populateFormForEdit(index) {
    const students = loadStudents();
    const s = students[index];
    if (!s) return;

    form.name.value = s.name;
    form['class'].value = s.className;
    form.rollNo.value = s.rollNo;

    resultsContainer.querySelectorAll('.result-row').forEach(r => r.remove());

    s.results.forEach(r => addResultRow(r.subject, r.marks));
    attachRemoveButtons();
    studentIdInput.value = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    form.reset();
    studentIdInput.value = '';
    resultsContainer.querySelectorAll('.result-row').forEach(r => r.remove());
    addResultRow();
    attachRemoveButtons();
  }

  clearBtn.addEventListener('click', () => resetForm());

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    try {
      const { name, className, rollNo, results } = collectFormData();
      const totals = computeTotals(results);
      const record = {
        name,
        className,
        rollNo,
        schoolName: document.getElementById('schoolName').value.trim(),
        results,
        total: totals.total,
        percentage: totals.percentage,
        grade: totals.grade,
        createdAt: new Date().toISOString()
      };

      const students = loadStudents();
      const editIndex = studentIdInput.value;
      if (editIndex !== '') {
        students[Number(editIndex)] = record;
      } else {
        students.push(record);
      }
      saveStudents(students);
      resetForm();
      alert('Saved successfully.');
    } catch (err) {
      alert(err.message || 'Error saving form.');
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  if (resultsContainer.querySelectorAll('.result-row').length === 0) addResultRow();
  attachRemoveButtons();
});

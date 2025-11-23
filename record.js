document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const qName = document.getElementById('qName');
  const qClass = document.getElementById('qClass');
  const qRoll = document.getElementById('qRoll');
  const qSchool = document.getElementById('qSchool');
  const resultsArea = document.getElementById('resultsArea');
  const resultsList = document.getElementById('resultsList');
  const resetBtn = document.getElementById('resetBtn');
  const showAllBtn = document.getElementById('showAllBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');

  function loadStudents() {
    try {
      const raw = localStorage.getItem('students');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function renderResults(list) {
    resultsList.innerHTML = '';
    if (!list || list.length === 0) {
      resultsList.innerHTML = '<div style="padding:12px">No matching records found.</div>';
      resultsArea.style.display = 'block';
      return;
    }

    list.forEach((s, idx) => {
      const item = document.createElement('div');
      item.className = 'list-item';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `<strong>${escapeHtml(s.name)}</strong> — Class: ${escapeHtml(s.className)} — Roll: ${escapeHtml(s.rollNo)}<br>
                  School: ${escapeHtml(s.schoolName)}<br>
                  Total: ${s.total} / ${s.results.length * 100} — ${s.percentage}% — Grade: <strong>${escapeHtml(s.grade)}</strong>`;
                  
      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.textContent = 'View';
      viewBtn.addEventListener('click', () => openDetailModal(s));

      const openEditBtn = document.createElement('button');
      openEditBtn.type = 'button';
      openEditBtn.textContent = 'Open in Editor';
      openEditBtn.addEventListener('click', () => openInEditor(idx));

      actions.appendChild(viewBtn);
      actions.appendChild(openEditBtn);

      item.appendChild(meta);
      item.appendChild(actions);
      resultsList.appendChild(item);
    });

    resultsArea.style.display = 'block';
  }

  function openDetailModal(student) {
    let txt = `Name: ${student.name}\nClass: ${student.className}\nRoll: ${student.rollNo}\nTotal: ${student.total} / ${student.results.length * 100}\nPercentage: ${student.percentage}%\nGrade: ${student.grade}\n\nSubjects:\n`;
    student.results.forEach(r => {
      txt += ` - ${r.subject}: ${r.marks}\n`;
    });
    alert(txt);
  }

  function openInEditor(index) {
    const students = loadStudents();
    if (!students[index]) {
      alert('Record not found.');
      return;
    }
    try {
      localStorage.setItem('editIndex', String(index));
      window.open('Result.html', '_blank');
      alert('Opening editor (new tab). The student record will load automatically in Result.html.');
    } catch (e) {
      alert('Could not open editor: ' + (e.message || e));
    }
}

  function performSearch(e) {
    if (e) e.preventDefault();
    const nameVal = qName.value.trim().toLowerCase();
    const classVal = qClass.value.trim().toLowerCase();
    const rollVal = qRoll.value.trim().toLowerCase();
    const schoolVal = qSchool.value.trim().toLowerCase();


    const students = loadStudents();
    const filtered = students.filter(s => {
      const nameMatch = !nameVal || (s.name || '').toLowerCase().includes(nameVal);
      const classMatch = !classVal || (s.className || '').toLowerCase().includes(classVal);
      const rollMatch = !rollVal || (s.rollNo || '').toLowerCase().includes(rollVal);
      const schoolMatch = !schoolVal || (s.schoolName || '').toLowerCase().includes(schoolVal);
      return nameMatch && classMatch && rollMatch && schoolMatch;
    });


    renderResults(filtered);
  }

  form.addEventListener('submit', performSearch);
  resetBtn.addEventListener('click', () => {
    qName.value = '';
    qClass.value = '';
    qRoll.value = '';
    resultsArea.style.display = 'none';
  });

  showAllBtn.addEventListener('click', () => {
    const students = loadStudents();
    renderResults(students);
  });

  clearAllBtn.addEventListener('click', () => {
    if (!confirm('Delete all saved records permanently?')) return;
    localStorage.removeItem('students');
    resultsList.innerHTML = '<div style="padding:12px">All records removed.</div>';
    resultsArea.style.display = 'block';
  });

  qName.addEventListener('input', () => {
    if (qName.value || qClass.value || qRoll.value) performSearch();
    else resultsArea.style.display = 'none';
  });
  qClass.addEventListener('input', () => {
    if (qName.value || qClass.value || qRoll.value) performSearch();
    else resultsArea.style.display = 'none';
  });
  qRoll.addEventListener('input', () => {
    if (qName.value || qClass.value || qRoll.value) performSearch();
    else resultsArea.style.display = 'none';
  });

  const editIndex = localStorage.getItem('editIndex');
  if (editIndex !== null) {
    try {
      const idx = Number(editIndex);
      localStorage.removeItem('editIndex');
      const students = loadStudents();
      if (students[idx]) {
        openDetailModal(students[idx]);
      }
    } catch (e) {}
  }
});

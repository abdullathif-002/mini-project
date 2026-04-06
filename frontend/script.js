// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const editModal = document.getElementById('edit-modal');
const closeBtn = document.querySelector('.close');

// authentication check
async function ensureAuth() {
    try {
        const resp = await fetch(API_BASE_URL + '/check_auth', { 
            credentials: 'include',
            method: 'GET'
        });
        console.log('Auth check status:', resp.status);
        if (resp.ok) {
            const data = await resp.json();
            console.log('User authenticated:', data.user);
            return true;
        }
        if (resp.status === 401) {
            // not logged in
            console.log('Not authenticated, redirecting to login');
            window.location.href = '/login.html';
            return false;
        }
        console.error('Unexpected auth response', resp.status);
        return false;
    } catch (e) {
        console.error('Auth check failed', e);
        alert('Unable to contact backend server. Please make sure it is running on http://localhost:5000');
        return false;
    }
}

// logout helper
async function logout() {
    try {
        await fetch(API_BASE_URL + '/logout', { 
            method: 'POST', 
            credentials: 'include' 
        });
    } catch (e) {
        console.error('Logout error:', e);
    }
    window.location.href = '/login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    const ok = await ensureAuth();
    if (!ok) return;    
    loadStudents();
    setupTabListeners();
    setupModalListeners();
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.addEventListener('click', logout);
});

// Tab Navigation
function setupTabListeners() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });
}

function showTab(tabName) {
    // Hide all tabs
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Load manage tab data when switched
    if (tabName === 'manage') {
        loadManageTable();
    }
}

// Load all students
async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, { credentials: 'include' });
        const students = await response.json();

        if (!Array.isArray(students)) {
            console.error('Invalid response format');
            return;
        }

        displayStudentsTable(students);
        updateStats(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading students', 'error');
    }
}

// Load manage table
async function loadManageTable() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`, { credentials: 'include' });
        const students = await response.json();

        if (!Array.isArray(students)) {
            console.error('Invalid response format');
            return;
        }

        displayManageStudents(students);
    } catch (error) {
        console.error('Error loading students:', error);
        showMessage('Error loading students', 'error');
    }
}

// Display students in table
function displayStudentsTable(students) {
    const tbody = document.getElementById('students-tbody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="center">No students found</td></tr>';
        return;
    }

    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.course}</td>
            <td>${parseFloat(student.gpa).toFixed(2)}</td>
            <td>${student.enrollment_date}</td>
            <td>
                <button class="btn-warning" onclick="openEditModal(${student.id})">Edit</button>
                <button class="btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Display students in manage section
function displayManageStudents(students) {
    const container = document.getElementById('manage-students-list');
    
    if (!students || students.length === 0) {
        container.innerHTML = '<p class="center">No students found</p>';
        return;
    }

    container.innerHTML = students.map(student => `
        <div class="student-card">
            <div class="student-card-header">
                <h3>${student.name}</h3>
                <span>#${student.id}</span>
            </div>
            <div class="student-card-details">
                <div class="detail-item">
                    <strong>Email:</strong> ${student.email}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> ${student.phone}
                </div>
                <div class="detail-item">
                    <strong>Course:</strong> ${student.course}
                </div>
                <div class="detail-item">
                    <strong>GPA:</strong> ${parseFloat(student.gpa).toFixed(2)}
                </div>
                <div class="detail-item">
                    <strong>Enrollment:</strong> ${student.enrollment_date}
                </div>
            </div>
            <div class="student-card-actions">
                <button class="btn-warning" onclick="openEditModal(${student.id})">Edit</button>
                <button class="btn-danger" onclick="deleteStudent(${student.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update statistics
function updateStats(students) {
    const totalStudents = students.length;
    const avgGPA = students.length > 0 
        ? (students.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / students.length).toFixed(2)
        : '0.0';

    document.getElementById('total-students').textContent = totalStudents;
    document.getElementById('avg-gpa').textContent = avgGPA;
}

// Add new student
async function addStudent(event) {
    event.preventDefault();

    const studentData = {
        name: document.getElementById('student-name').value,
        email: document.getElementById('student-email').value,
        phone: document.getElementById('student-phone').value,
        course: document.getElementById('student-course').value,
        gpa: document.getElementById('student-gpa').value || 0
    };

    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Student added successfully!', 'success');
            document.getElementById('add-student-form').reset();
            loadStudents();
            setTimeout(() => showTab('dashboard'), 1500);
        } else {
            showMessage(data.error || 'Error adding student', 'error');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showMessage('Error adding student', 'error');
    }
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Student deleted successfully!', 'success');
            loadStudents();
            loadManageTable();
        } else {
            showMessage(data.error || 'Error deleting student', 'error');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showMessage('Error deleting student', 'error');
    }
}

// Open edit modal
async function openEditModal(studentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, { credentials: 'include' });
        const student = await response.json();

        if (response.ok) {
            document.getElementById('edit-student-id').value = student.id;
            document.getElementById('edit-name').value = student.name;
            document.getElementById('edit-email').value = student.email;
            document.getElementById('edit-phone').value = student.phone;
            document.getElementById('edit-course').value = student.course;
            document.getElementById('edit-gpa').value = student.gpa;

            editModal.style.display = 'block';
        } else {
            showMessage('Error loading student details', 'error');
        }
    } catch (error) {
        console.error('Error loading student:', error);
        showMessage('Error loading student', 'error');
    }
}

// Close edit modal
function closeEditModal() {
    editModal.style.display = 'none';
}

// Update student
async function updateStudent(event) {
    event.preventDefault();

    const studentId = document.getElementById('edit-student-id').value;
    const studentData = {
        name: document.getElementById('edit-name').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        course: document.getElementById('edit-course').value,
        gpa: document.getElementById('edit-gpa').value || 0
    };

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Student updated successfully!', 'success');
            closeEditModal();
            loadStudents();
            loadManageTable();
        } else {
            showMessage(data.error || 'Error updating student', 'error');
        }
    } catch (error) {
        console.error('Error updating student:', error);
        showMessage('Error updating student', 'error');
    }
}

// Search students
async function searchStudents() {
    const query = document.getElementById('search-input').value.trim();

    if (!query) {
        showMessage('Please enter a search term', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/students/search/${encodeURIComponent(query)}`, { credentials: 'include' });
        const students = await response.json();

        if (response.ok) {
            displayStudentsTable(students);
            if (students.length === 0) {
                showMessage('No students found matching your search', 'error');
            }
        } else {
            showMessage('Error searching students', 'error');
        }
    } catch (error) {
        console.error('Error searching students:', error);
        showMessage('Error searching students', 'error');
    }
}

// Clear search
function clearSearch() {
    document.getElementById('search-input').value = '';
    loadStudents();
    showMessage('Search cleared', 'success');
}

// Setup modal listeners
function setupModalListeners() {
    closeBtn.addEventListener('click', closeEditModal);

    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Find appropriate container based on active tab
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(messageDiv, activeTab.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

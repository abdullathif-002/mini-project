# Student Management System

A complete student management system with Flask backend, SQLite database, and HTML/CSS/JS frontend.

## Project Structure

```
mini project/
├── backend/
│   ├── app.py                 # Flask application with REST API
│   ├── requirements.txt       # Python dependencies
│   └── students.db           # SQLite database (auto-created)
└── frontend/
    ├── index.html            # Main HTML page
    ├── style.css             # Styling
    └── script.js             # JavaScript functionality
```

## Features

✅ **Dashboard** - View statistics (total students, average GPA)
✅ **Add Students** - Create new student records with validation
✅ **View Students** - Display all students in a table format
✅ **Search** - Search students by name, course, or email
✅ **Edit Students** - Update student information
✅ **Delete Students** - Remove student records with confirmation
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Real-time Updates** - All changes reflect immediately

## Backend API Endpoints

### Authentication
- `POST /api/register` - Register new user (username/password)
- `POST /api/login` - Log in and start a session
- `POST /api/logout` - Log out
- `GET /api/check_auth` - Verify session (used by frontend)

### Students (require login)
- `GET /api/students` - Get all students
- `GET /api/students/<id>` - Get specific student
- `POST /api/students` - Create new student
- `PUT /api/students/<id>` - Update student
- `DELETE /api/students/<id>` - Delete student
- `GET /api/students/search/<query>` - Search students
- `GET /api/health` - Health check

## Database Schema

### Students Table
```sql
id              INTEGER PRIMARY KEY AUTOINCREMENT
name            TEXT NOT NULL
email           TEXT NOT NULL UNIQUE
phone           TEXT NOT NULL
enrollment_date TEXT NOT NULL
course          TEXT NOT NULL
gpa             REAL DEFAULT 0.0
```

## Setup Instructions

### Prerequisites
- Python 3.7+
- pip (Python package manager)
- A web browser

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   ```
   
   The backend will start at `http://localhost:5000`.
   A default administrator account is automatically created on first run:
   **username:** `admin`, **password:** `admin` (you should change this by
   registering a new user or directly in the database).

### Frontend Setup

1. **Open the frontend in a browser:**
   - Simply open `frontend/index.html` in your web browser, or
   - Use a local server (recommended):
     ```bash
     # Using Python's built-in server (from frontend folder)
     python -m http.server 8000
     ```
   - Then visit `http://localhost:8000`

## How to Use

### Adding a Student
1. Click on the "Add Student" tab
2. Fill in all required fields (marked with *)
3. Optionally enter the GPA
4. Click "Add Student"
5. You'll be redirected to the dashboard to see the new student

### Viewing Students
- Go to the "Dashboard" tab to see all students in a table
- View statistics: total students and average GPA
- Use the search box to filter students by name, course, or email

### Searching Students
1. Enter a search term in the search box
2. Click "Search" button
3. Results will be filtered in real-time
4. Click "Clear" to reset the search

### Editing a Student
1. Click the "Edit" button on any student (in Dashboard or Manage tab)
2. A modal will appear with student details
3. Update the information as needed
4. Click "Update Student" to save changes

### Deleting a Student
1. Click the "Delete" button on any student
2. Confirm the deletion when prompted
3. The student will be removed from the system

### Managing Students
- Go to the "Manage Students" tab for a card-based view
- Each card displays complete student information
- Edit or delete students directly from this view

## Testing the System

### Sample Student Data
You can test the system by adding these sample students:

**Student 1:**
- Name: John Smith
- Email: john.smith@email.com
- Phone: 555-0001
- Course: Computer Science
- GPA: 3.85

**Student 2:**
- Name: Alice Johnson
- Email: alice.johnson@email.com
- Phone: 555-0002
- Course: Mathematics
- GPA: 3.92

**Student 3:**
- Name: Bob Wilson
- Email: bob.wilson@email.com
- Phone: 555-0003
- Course: Physics
- GPA: 3.45

## Troubleshooting

### Backend Won't Start
- Ensure Python is installed: `python --version`
- Check if port 5000 is available
- Verify Flask is installed: `pip list | grep Flask`
- Try reinstalling: `pip install -r requirements.txt --force-reinstall`

### Frontend Can't Connect to Backend
- Verify backend is running on http://localhost:5000
- Check browser console for CORS errors
- Ensure the API_BASE_URL in script.js is correct
- Make sure frontend is not served with `file://` protocol

### Database Issues
- Delete `students.db` to reset the database
- It will be automatically recreated on next backend start

### Email Already Exists Error
- Each student must have a unique email address
- Check if the email is already in the system

## API Response Examples

### Creating a Student (POST)
```json
Request:
{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "555-1234",
  "course": "Computer Science",
  "gpa": 3.8
}

Response:
{
  "id": 1,
  "message": "Student created successfully"
}
```

### Getting All Students (GET)
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@email.com",
    "phone": "555-1234",
    "course": "Computer Science",
    "gpa": 3.8,
    "enrollment_date": "2026-03-03"
  }
]
```

## Project Customization

### Adding More Fields
To add new fields to students:
1. Modify the database schema in `app.py` (alter table or recreate)
2. Update the form in `index.html`
3. Update the JavaScript functions in `script.js`

### Styling Changes
- Edit `frontend/style.css` to modify colors, fonts, or layout
- CSS variables are defined at the top for easy theme changes

### Adding Authentication
- Add user login/logout functionality to `app.py`
- Implement JWT tokens for API security
- Add login form to the frontend

## Security Notes

⚠️ **Production Deployment:**
- This system is for learning/development purposes
- For production: use environment variables for sensitive data
- Enable HTTPS
- Add input validation and sanitization
- Implement proper authentication
- Add database password protection
- Use a production WSGI server (Gunicorn, etc.)

## Technologies Used

- **Backend:** Python, Flask, Flask-CORS
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Database:** SQLite3
- **API:** RESTful API

## Future Enhancements

- User authentication and authorization
- Advanced filtering and sorting
- Bulk import/export of student data
- Email notifications
- Academic performance reports
- File upload for student documents
- Admin dashboard
- API rate limiting
- Database backups

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, check the troubleshooting section or review the code comments for more details.

---

**Created:** March 3, 2026
**Version:** 1.0

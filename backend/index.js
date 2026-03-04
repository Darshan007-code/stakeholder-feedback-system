require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, initDb } = require('./db');
const { DEPARTMENTS, DEPARTMENT_SUBJECTS, FEEDBACK_CATEGORIES } = require('./constants');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'supersecret';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database
initDb().then(() => console.log('Database initialized'));

// --- Multer Setup for File Uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- Helper Functions ---
const getStakeholderTable = (role) => {
  switch (role.toLowerCase()) {
    case 'student': return 'students';
    case 'teacher': return 'teachers';
    case 'parent': return 'parents';
    case 'employee': return 'employees';
    case 'admin': return 'employees';
    default: return null;
  }
};

const getIdentifierField = (role) => {
  switch (role.toLowerCase()) {
    case 'student': return 'usn';
    case 'teacher': return 'teacher_id';
    case 'parent': return 'parent_id';
    case 'employee': return 'employee_id';
    case 'admin': return 'employee_id';
    default: return null;
  }
};

const notify = async (userId, userRole, message) => {
    if (!userId) return;
    try {
        await db('notifications').insert({ user_id: userId, user_role: userRole, message, is_read: false });
        console.log(`[EMAIL SIMULATION TO ${userId}]: ${message}`);
    } catch (err) {
        console.error('Notification failed:', err);
    }
};

// --- Middleware ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

// --- Routes ---

app.get('/api/metadata', (req, res) => {
  res.json({ departments: DEPARTMENTS, categories: FEEDBACK_CATEGORIES, subjects: DEPARTMENT_SUBJECTS });
});

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { role, name, email, password, department, year, identifier } = req.body;
  const table = getStakeholderTable(role);
  const idField = getIdentifierField(role);
  if (!table) return res.status(400).json({ error: 'Invalid role' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { [idField]: identifier, name, email, password: hashedPassword };
    if (role === 'student') {
        data.department = department;
        data.year = year;
    } else if (role === 'teacher') {
        data.department = department;
    } else if (role === 'employee' || role === 'admin') {
        data.department = department;
        data.role = role;
    }
    await db(table).insert(data);
    res.status(201).json({ message: `${role} registered` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { role, identifier, password } = req.body;
  const table = getStakeholderTable(role);
  const idField = getIdentifierField(role);
  if (!table) return res.status(400).json({ error: 'Invalid role' });
  try {
    const user = await db(table)
      .whereRaw(`LOWER(${idField}) = ?`, [identifier.toLowerCase()])
      .first();
    if (user && await bcrypt.compare(password, user.password)) {
      if ((role === 'admin' || role === 'employee') && user.role !== role) return res.status(401).json({ error: 'Role mismatch' });
      const token = jwt.sign({ id: identifier, role, name: user.name }, SECRET);
      res.json({ token, user: { id: identifier, name: user.name, role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

// Feedback & Tickets
app.post('/api/feedback', authenticate, upload.single('attachment'), async (req, res) => {
  const { category, department, rating, description, is_anonymous } = req.body;
  const isAnonymous = is_anonymous === 'true';
  try {
    const [feedback_id] = await db('feedback').insert({
      stakeholder_type: req.user.role,
      stakeholder_id: isAnonymous ? null : req.user.id,
      is_anonymous: isAnonymous,
      category, department, description, rating,
      attachment: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'Open'
    });
    await db('tickets').insert({ feedback_id, assigned_department: department || 'General', status: 'Open' });
    if (!isAnonymous) await notify(req.user.id, req.user.role, `Feedback #${feedback_id} submitted successfully.`);
    res.status(201).json({ message: 'Feedback submitted', feedback_id });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

app.get('/api/feedback/my', authenticate, async (req, res) => {
  const data = await db('feedback').leftJoin('tickets', 'feedback.feedback_id', 'tickets.feedback_id').where({ stakeholder_id: req.user.id, stakeholder_type: req.user.role }).select('feedback.*', 'tickets.status as ticket_status', 'tickets.resolution');
  res.json(data);
});

app.get('/api/admin/export', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const tickets = await db('tickets').join('feedback', 'tickets.feedback_id', 'feedback.feedback_id').select('tickets.ticket_id', 'feedback.category', 'feedback.stakeholder_type', 'tickets.status', 'feedback.date', 'tickets.resolution');
        const header = "TicketID,Category,Stakeholder,Status,Date,Resolution\n";
        const rows = tickets.map(t => `${t.ticket_id},${t.category},${t.stakeholder_type},${t.status},"${t.date}","${t.resolution || ''}"`).join("\n");
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=feedback_report.csv');
        res.send(header + rows);
    } catch (err) { res.status(500).json({ error: 'Export failed' }); }
});

app.patch('/api/admin/tickets/:ticket_id', authenticate, authorize(['admin']), async (req, res) => {
  const { status, assigned_staff, resolution } = req.body;
  const ticket = await db('tickets').join('feedback', 'tickets.feedback_id', 'feedback.feedback_id').where({ ticket_id: req.params.ticket_id }).first();
  await db('tickets').where({ ticket_id: req.params.ticket_id }).update({ status, assigned_staff, resolution });
  if (status) {
    await db('feedback').where({ feedback_id: ticket.feedback_id }).update({ status });
    if (!ticket.is_anonymous) await notify(ticket.stakeholder_id, ticket.stakeholder_type, `Ticket for Feedback #${ticket.feedback_id} updated to: ${status}`);
  }
  res.json({ message: 'Ticket updated' });
});

app.get('/api/admin/tickets', authenticate, authorize(['admin']), async (req, res) => {
    const tickets = await db('tickets').join('feedback', 'tickets.feedback_id', 'feedback.feedback_id').select('tickets.*', 'feedback.category', 'feedback.description', 'feedback.stakeholder_id', 'feedback.is_anonymous', 'feedback.attachment');
    res.json(tickets);
});

app.get('/api/admin/analytics/unresolved', authenticate, authorize(['admin']), async (req, res) => {
    const data = await db('tickets').whereNot({ status: 'Resolved' }).andWhereNot({ status: 'Closed' }).count('ticket_id as count').first();
    res.json(data);
});

app.get('/api/admin/analytics/department-complaints', authenticate, authorize(['admin']), async (req, res) => {
    const data = await db('tickets').select('assigned_department').count('ticket_id as count').groupBy('assigned_department');
    res.json(data);
});

app.get('/api/admin/analytics/teacher-ratings', authenticate, authorize(['admin']), async (req, res) => {
    const evaluations = await db('teacher_evaluations').join('teachers', 'teacher_evaluations.teacher_id', 'teachers.teacher_id').select('teachers.name', 'teacher_evaluations.ratings');
    const teacherAverages = {};
    evaluations.forEach(ev => {
        const ratings = JSON.parse(ev.ratings);
        const avg = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;
        if (!teacherAverages[ev.name]) teacherAverages[ev.name] = { total: 0, count: 0 };
        teacherAverages[ev.name].total += avg;
        teacherAverages[ev.name].count += 1;
    });
    const result = Object.keys(teacherAverages).map(name => ({ name, averageRating: (teacherAverages[name].total / teacherAverages[name].count).toFixed(2) }));
    res.json(result);
});

app.get('/api/admin/analytics/category-distribution', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const data = await db('feedback')
            .select('category')
            .count('feedback_id as count')
            .groupBy('category');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch category analytics' });
    }
});

app.get('/api/admin/analytics/monthly-feedback', authenticate, authorize(['admin']), async (req, res) => {
    const data = await db('feedback').select(db.raw("strftime('%Y-%m', date) as month")).count('feedback_id as count').groupBy('month').orderBy('month', 'asc');
    res.json(data);
});

app.get('/api/notifications', authenticate, async (req, res) => {
  const data = await db('notifications').where({ user_id: req.user.id, user_role: req.user.role }).orderBy('created_at', 'desc');
  res.json(data);
});

app.post('/api/evaluation', authenticate, authorize(['student']), async (req, res) => {
  const { teacher_id, subject, ratings, comments } = req.body;
  await db('teacher_evaluations').insert({ evaluator_id: req.user.id, teacher_id, subject, ratings: JSON.stringify(ratings), comments });
  res.status(201).json({ message: 'Evaluation submitted' });
});

app.get('/api/teachers/:department', authenticate, async (req, res) => {
    const teachers = await db('teachers').where({ department: req.params.department }).select('teacher_id', 'name');
    res.json(teachers);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(__dirname, '../../../database/better_tomorrow.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;');

export const query = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
};

export const getOne = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
};

export const run = (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize database schema
export const initDb = async () => {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`Schema file not found at ${schemaPath}`);
    return;
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  // Strip single-line comments
  const cleanSql = schemaSql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    try {
      await run(statement);
    } catch (err) {
      console.error('Error executing schema statement:', statement, err);
    }
  }

  console.log('Database schema initialized successfully.');

  // Seed demo student account if empty
  await seedDemoData();
};

const seedDemoData = async () => {
  const demoEmail = 'alex.student@hostel.edu';
  const existingUser = await getOne('SELECT * FROM users WHERE email = ?', [demoEmail]);

  if (existingUser) return; // Already seeded

  const userId = 'demo-user-123';
  const passwordHash = await bcrypt.hash('password123', 10);
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Create demo user
  await run(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
    [userId, 'Alex Chen', demoEmail, passwordHash]
  );

  // 2. User settings
  await run(
    'INSERT INTO user_settings (id, user_id, wake_up_time, study_start_time, default_focus_duration) VALUES (?, ?, ?, ?, ?)',
    ['set-1', userId, '07:00', '09:00', 25]
  );

  // 3. Demo Tasks
  const demoTasks = [
    {
      id: 'task-1',
      title: 'Complete Data Structures Assignment',
      description: 'Implement AVL Tree balancing and test search operations',
      category: 'Assignment',
      priority: 'HIGH',
      due_date: todayStr,
      due_time: '18:00',
      notes: 'Check textbook chapter 5 for reference',
      completed: 1,
    },
    {
      id: 'task-2',
      title: 'Revise Python Functions & Modules',
      description: 'Review generator functions, decorators, and list comprehensions',
      category: 'Study',
      priority: 'HIGH',
      due_date: todayStr,
      due_time: '20:30',
      notes: 'Prepare notes for weekend lab exam',
      completed: 1,
    },
    {
      id: 'task-3',
      title: 'Prepare Project Presentation Slides',
      description: 'Draft 5 slides outlining system design & database ERD',
      category: 'Project',
      priority: 'MEDIUM',
      due_date: todayStr,
      due_time: '22:00',
      notes: 'Collaborate with hostel team member Rahil',
      completed: 0,
    },
    {
      id: 'task-4',
      title: 'Read AI Ethics Case Study Notes',
      description: 'Read assigned paper on algorithmic fairness',
      category: 'Study',
      priority: 'LOW',
      due_date: todayStr,
      due_time: '23:00',
      notes: 'Summary required for Friday discussion class',
      completed: 0,
    },
  ];

  for (const t of demoTasks) {
    await run(
      'INSERT INTO tasks (id, user_id, title, description, category, priority, due_date, due_time, notes, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [t.id, userId, t.title, t.description, t.category, t.priority, t.due_date, t.due_time, t.notes, t.completed]
    );
  }

  // 4. Demo Schedule Timeline
  const demoSchedules = [
    { id: 'sch-1', title: 'Wake Up & Morning Routine', start: '07:00', end: '08:00', cat: 'Personal', completed: 1 },
    { id: 'sch-2', title: 'Hostel Mess Breakfast', start: '08:00', end: '08:45', cat: 'Meal', completed: 1 },
    { id: 'sch-3', title: 'Data Structures Lecture', start: '09:00', end: '11:00', cat: 'Class', completed: 1 },
    { id: 'sch-4', title: 'Database Management Lab', start: '11:15', end: '13:15', cat: 'Class', completed: 1 },
    { id: 'sch-5', title: 'Lunch & Rest', start: '13:15', end: '14:30', cat: 'Meal', completed: 1 },
    { id: 'sch-6', title: 'Data Structures Assignment Work', start: '15:00', end: '17:00', cat: 'Assignment', completed: 1 },
    { id: 'sch-7', title: 'Evening Walk & Hostel Break', start: '17:30', end: '18:30', cat: 'Rest', completed: 1 },
    { id: 'sch-8', title: 'Python Self-Study Session', start: '19:00', end: '20:30', cat: 'Study', completed: 1 },
    { id: 'sch-9', title: 'Dinner at Mess', start: '20:30', end: '21:15', cat: 'Meal', completed: 1 },
    { id: 'sch-10', title: 'Project Presentation Draft', start: '21:30', end: '23:00', cat: 'Study', completed: 0 },
  ];

  for (const s of demoSchedules) {
    await run(
      'INSERT INTO schedules (id, user_id, title, date, start_time, end_time, category, completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [s.id, userId, s.title, todayStr, s.start, s.end, s.cat, s.completed]
    );
  }

  // 5. Demo Focus Sessions
  const demoFocus = [
    { id: 'foc-1', task_id: 'task-1', mins: 25 },
    { id: 'foc-2', task_id: 'task-1', mins: 25 },
    { id: 'foc-3', task_id: 'task-2', mins: 45 },
  ];

  for (const f of demoFocus) {
    await run(
      'INSERT INTO focus_sessions (id, user_id, task_id, duration_minutes) VALUES (?, ?, ?, ?)',
      [f.id, userId, f.task_id, f.mins]
    );
  }

  // 6. Demo Reflections
  await run(
    'INSERT INTO daily_reflections (id, user_id, date, distraction_level, focus_level, notes) VALUES (?, ?, ?, ?, ?, ?)',
    ['ref-1', userId, todayStr, '30–60 min', 'Good', 'Felt organized after planning morning classes ahead of time.']
  );

  console.log(`Seeded demo student account: ${demoEmail} (Password: password123)`);
};

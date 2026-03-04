const knex = require('knex');
const path = require('path');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite'),
  },
  useNullAsDefault: true,
});

async function initDb() {
  // 1. Students
  if (!(await db.schema.hasTable('students'))) {
    await db.schema.createTable('students', (table) => {
      table.string('usn').primary();
      table.string('name').notNullable();
      table.string('department');
      table.integer('year');
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
    });
  }

  // 2. Teachers
  if (!(await db.schema.hasTable('teachers'))) {
    await db.schema.createTable('teachers', (table) => {
      table.string('teacher_id').primary();
      table.string('name').notNullable();
      table.string('department');
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
    });
  }

  // 3. Employees
  if (!(await db.schema.hasTable('employees'))) {
    await db.schema.createTable('employees', (table) => {
      table.string('employee_id').primary();
      table.string('name').notNullable();
      table.string('department');
      table.string('role');
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
    });
  }

  // 3.1 Parents
  if (!(await db.schema.hasTable('parents'))) {
    await db.schema.createTable('parents', (table) => {
      table.string('parent_id').primary();
      table.string('name').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
    });
  }

  // 4. Feedback
  if (!(await db.schema.hasTable('feedback'))) {
    await db.schema.createTable('feedback', (table) => {
      table.increments('feedback_id').primary();
      table.string('stakeholder_type').notNullable();
      table.string('stakeholder_id'); // Can be NULL for anonymous feedback
      table.boolean('is_anonymous').defaultTo(false);
      table.string('category').notNullable();
      table.string('department');
      table.text('description').notNullable();
      table.string('attachment'); // Store the file path
      table.integer('rating');
      table.timestamp('date').defaultTo(db.fn.now());
      table.string('status').defaultTo('Open');
    });
  }

  // 5. Tickets
  if (!(await db.schema.hasTable('tickets'))) {
    await db.schema.createTable('tickets', (table) => {
      table.increments('ticket_id').primary();
      table.integer('feedback_id').references('feedback_id').inTable('feedback');
      table.string('assigned_department');
      table.string('assigned_staff');
      table.string('status').defaultTo('Pending');
      table.text('resolution');
    });
  }

  // 7. Notifications
  if (!(await db.schema.hasTable('notifications'))) {
    await db.schema.createTable('notifications', (table) => {
      table.increments('id').primary();
      table.string('user_id').notNullable(); // usn, teacher_id, or employee_id
      table.string('user_role').notNullable();
      table.text('message').notNullable();
      table.boolean('is_read').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
}

module.exports = { db, initDb };

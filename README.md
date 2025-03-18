Test Hapi Web Server with PostgreSQL & Prisma

## Getting Started

### Install Hapi Packages

```
# Create new project
mkdir task-manager-poc
cd task-manager-poc
npm init -y

# @hapi/hapi:  Hapi.js web app API
# pg:          PostgreSQL client for Node.js.
# joi:         Web app incoming data validation
npm install @hapi/hapi pg joi
```

### Launch PostgreSQL Container & Seed
```
docker run -e POSTGRES_PASSWORD=pwd --name=pg --rm -d -p 5432:5432 postgres:14
docker exec -u postgres -it pg psql

CREATE DATABASE task_manager;

\c task_manager

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

INSERT INTO tasks (title, description) VALUES
('Deploy to Staging', 'Deploy the latest version of the app to the staging environment.'),
('Create User Guide', 'Develop a user guide for the new features of the app.');

SELECT * FROM tasks;
```

### Launch Hapi Web App
```
node hapi-server.js
```

### Test
```
# Get tasks
curl http://localhost:3000/tasks

# Add task
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title": "New", "description": "New task."}'

# Update task
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"title": "Updated", "description": "Updated task", "completed": true}'

# Delete task
curl -X DELETE 1
```

## With Prisma

### Install Prisma Packages
```
# Prisma
npm install @prisma/client
npx prisma init -y
```

### Configure Prisma with PostgreSQL Connection String
```
# .env
DATABASE_URL="postgres://postgres:pwd@localhost:5432/postgres"
```

### Configure Prisma
```
# Generate Prisma schema from existing database
# Updates prisma\prisma.schema file
npx prisma introspect

# Run generate in case environment vars updated
npx prisma generate
```

### Launch Hapi Web App
```
# Run the Hapi server using Prisma for DB Access
node hapi-server-with-prisma.js
```

const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const { Client } = require('pg');

// PostgreSQL client setup
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'task_manager',
    password: 'pwd',
    port: 5432,
});

client.connect()
    .then(() => {
        console.log("Connected to PostgreSQL!");
    })
    .catch(err => {
        console.error("Connection error", err.stack);
    });

// Server setup
const server = Hapi.server({
    port: 3000,
    host: 'localhost',
});

server.route({
    method: 'GET',
    path: '/tasks',
    handler: async (request, h) => {
        try {
            const res = await client.query('SELECT * FROM tasks');
            return h.response(res.rows);
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    }
});

server.route({
    method: 'POST',
    path: '/tasks',
    handler: async (request, h) => {
        const { title, description } = request.payload;
        try {
            const result = await client.query(
                'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
                [title, description]
            );
            return h.response(result.rows[0]).code(201);
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    },
    options: {
        validate: {
            payload: Joi.object({
                title: Joi.string().min(3).required(),
                description: Joi.string().min(3).required(),
            })
        }
    }
});

server.route({
    method: 'PUT',
    path: '/tasks/{id}',
    handler: async (request, h) => {
        const { id } = request.params;
        const { title, description, completed } = request.payload;
        try {
            const result = await client.query(
                'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
                [title, description, completed, id]
            );
            if (result.rowCount === 0) {
                return h.response({ message: 'Task not found' }).code(404);
            }
            return h.response(result.rows[0]);
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    },
    options: {
        validate: {
            payload: Joi.object({
                title: Joi.string().min(3).required(),
                description: Joi.string().min(3).required(),
                completed: Joi.boolean().required(),
            })
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    handler: async (request, h) => {
        const { id } = request.params;
        try {
            const result = await client.query(
                'DELETE FROM tasks WHERE id = $1 RETURNING *',
                [id]
            );
            if (result.rowCount === 0) {
                return h.response({ message: 'Task not found' }).code(404);
            }
            return h.response({ message: 'Task deleted successfully' }).code(200);
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    }
});

// Start the server
const start = async () => {
    try {
        await server.start();
        console.log('Server running on %s', server.info.uri);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

start();

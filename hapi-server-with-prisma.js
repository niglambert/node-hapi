// hapi-server-with-prisma.js
const Hapi = require('@hapi/hapi');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
            const tasks = await prisma.tasks.findMany();
            return h.response(tasks);
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
            const newTask = await prisma.tasks.create({
                data: { title, description }
            });
            return h.response(newTask).code(201);
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
            const updatedTask = await prisma.tasks.update({
                where: { id: Number(id) },
                data: { title, description, completed },
            });
            return h.response(updatedTask);
        } catch (err) {
            return h.response({ error: err.message }).code(500);
        }
    }
});

server.route({
    method: 'DELETE',
    path: '/tasks/{id}',
    handler: async (request, h) => {
        const { id } = request.params;
        try {
            const deletedTask = await prisma.tasks.delete({
                where: { id: Number(id) },
            });
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

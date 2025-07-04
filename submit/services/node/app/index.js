const Fastify = require('fastify');
const fstat = require('fs');
const path = require('path');
const Database = require('better-sqlite3'); 
const fastifyStatic = require('@fastify/static');

const fastify = Fastify({ 
    logger: true,
    https:{
         key: fstat.readFileSync('/certs/node.key'),
         cert: fstat.readFileSync('/certs/node.crt'),
    }
});

//static files
fastify.register(fastifyStatic,{
    root: path.join(__dirname, 'public'),
    prefix: '/', // optional: default '/'
    wildcard: true // optional: default true
});

//metrics scrape endpoint for Prometheus
const metricsPlugin = require('fastify-metrics');
fastify.register(metricsPlugin, { endpoint: '/metrics' });

// fastify.register(require('@fastify/cors'), {
//     origin: ['http://localhost:5173'], //frontend URL
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
//   });
  
const db = new Database('/app/db/database.db');

// Create users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY,username TEXT);
    CREATE TABLE IF NOT EXISTS tournament_counter (id INTEGER PRIMARY KEY CHECK (id = 1), current_id INTEGER DEFAULT -1);
    `);

const inittournament = db.prepare(`INSERT OR IGNORE INTO tournament_counter (id,current_id) VALUES (1, -1) `);
inittournament.run();

// API router
// API: Add user
fastify.post('/users', async (req, reply) => {
    const { username } = req.body;
    if (!username) {
        return reply.code(400).send({ error: 'Username is required' });
    }
    const stmt = db.prepare("INSERT INTO users (username) VALUES (?)");
    stmt.run(username);
    return reply.code(201).send({ message: 'User added' });
});

// API: Get all users
fastify.get('/users', async (req, reply) => {
    const stmt = db.prepare("SELECT * FROM users");
    return stmt.all();
});

fastify.get('/tournament-id', async (req, reply) => {
    const stmt = db.prepare(` SELECT current_id FROM tournament_counter WHERE id = 1 `);
    const result = stmt.get();
    return { tournament_id: result.current_id };
}
); // API: Get tournament id

fastify.post('/increment-tournament-id', async (req, reply) => {
    const increment = db.transaction(() =>  {
    const stmt = db.prepare(`UPDATE tournament_counter SET current_id = current_id + 1 WHERE id = 1`);
    stmt.run();
    const getStmt = db.prepare(` SELECT current_id FROM tournament_counter WHERE id = 1 `);
    return getStmt.get().current_id;
    }
    );
    const newId = increment();
    return { tournament_id: newId };
}
); // API: Increment tournament id

fastify.post('/set-tournament-id', async(req, reply) => {
    const { tournament_id } = req.body;

    if (!tournament_id || isNaN(tournament_id) || tournament_id < 0) {
        return reply.code(400).send({ error: 'Tournament ID is required' });
    }
    else {
        const stmt = db.prepare(`UPDATE tournament_counter SET current_id = ? WHERE id = 1`);
        stmt.run(tournament_id);
        return reply.code(200).send({ message: 'Tournament ID set' });
    }
});


//catchall router for spa
//fastify.get('/*', (req, reply) => {
//    reply.sendFile('index.html'); // serving index.html for all other routes
//});
    
// Start server
fastify.listen({ port: 3001, host: "0.0.0.0" }, (err) =>{
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    } 
    console.log("Server running on port 3001");
});

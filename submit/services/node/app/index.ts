import Fastify from 'fastify';
import Database from 'better-sqlite3';

// 定义 User 类型
interface User {
  id: number;
  username: string;
}

const fastify = Fastify({ logger: true });
const db = new Database('/app/db/database.db');

// 创建 users 表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    username TEXT
  )
`);

// 添加用户 API
fastify.post<{ Body: { username: string } }>('/users', async (req, reply) => {
    const { username } = req.body;
    const stmt = db.prepare("INSERT INTO users (username) VALUES (?)");
    stmt.run(username);
    return { message: 'User added' };
});

// 获取所有用户 API
fastify.get('/users', async (req, reply) => {
    const stmt = db.prepare("SELECT * FROM users");
    const users: User[] = stmt.all(); // 明确指定返回类型
    return users;
});

// 启动服务器
fastify.listen({ port: 3001, host: "0.0.0.0" }, () => {
    console.log("Server running on port 3000");
});

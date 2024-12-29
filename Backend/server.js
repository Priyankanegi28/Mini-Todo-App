const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post('/signup', (req, res) => {
    const users = router.db.get('users');
    const { email, password } = req.body;

    if (users.find({ email }).value()) {
    return res.status(400).json({ message: 'User already exists' });
}

    users.push({ email, password }).write();
    res.status(201).json({ message: 'Signup successful' });
});

server.post('/login', (req, res) => {
    const users = router.db.get('users');
    const { email, password } = req.body;

    const user = users.find({ email, password }).value();

    if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
}

res.status(200).json({ message: 'Login successful' });
});

server.use(router);
server.listen(3000, () => {
console.log('JSON Server is running on port 3000');
});

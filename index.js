const express = require('express');
const cors = require('cors');

const projectRoutes = require('./projectRoutes');
const server = express(); 

server.use(express.json());
server.use(cors());
server.use('/api/projectRoutes', projectRoutes);

server.get('/', (req, res) => {
    res.status(200).send('The App is working');
})

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Server is running on Port ${5000}`);
})
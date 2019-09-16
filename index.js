const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt')
const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const restricted = require('./Auth/restricted-middleware')

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let { username, password } = req.body;
  const hash = bcrypt.hashSync(password, 14)
  Users.add({ username, password: hash })
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      console.log(user)
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});
server.get('/hash', (req, res) => {
  const name = req.query.name;


  const hash = bcrypt.hashSync(name, 14)
  req.query.name = hash
  res.send(`the has for ${name} is ${hash}`)
})
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));

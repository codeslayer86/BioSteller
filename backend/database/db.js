const knex = require('knex');
const knexConfig = require('../knexfile');

// Use 'development' config by default, but 'production' if NODE_ENV is set
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

module.exports = db;
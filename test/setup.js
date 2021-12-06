/* eslint-disable no-console */
const factoryGirl = require('factory-girl');
const faker = require('faker');
const moment = require('moment');
const http = require('http');
const request = require('supertest');
const requireTree = require('require-tree');
const path = require('path');
const app = require('../src/app');
const models = require('../src/model');
require('should');

exports.mochaHooks = {
  async beforeAll() {
    const { factory } = factoryGirl;
    const factoryAdapter = new factoryGirl.SequelizeAdapter();
    const factories = requireTree(path.join(process.cwd(), 'test', 'factories'));

    factory.setAdapter(factoryAdapter);

    global.faker = faker;
    global.models = models;
    global.moment = moment;
    global.request = request;
    global.server = http.createServer(app);

    Object.keys(factories).forEach((key) => {
      factories[key](factory, models);
    });

    global.factory = factory;

    console.info('test server started!!!');
  },
  async afterAll() {
    await global.server.close();

    console.info('test server stopped!!!');
  },
  async afterEach() {
    const { Contract, Job, Profile } = models;

    await Contract.sync({ force: true });
    await Profile.sync({ force: true });
    await Job.sync({ force: true });
  },
  async beforeEach() {
    const { Contract, Job, Profile } = models;

    await Contract.sync({ force: true });
    await Profile.sync({ force: true });
    await Job.sync({ force: true });
  },
};

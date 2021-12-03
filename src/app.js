const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * FIX ME!
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const { id } = req.params;
  const { profile } = req;
  const contract = await Contract.findOne({ where: { id, [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id } });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

app.get('/contracts/', getProfile, async (req, res) => {
  const { Contract } = req.app.get('models');
  const { profile } = req;
  const contracts = await Contract.findAll({
    where: {
      status: {
        [Op.not]: 'terminated',
      },
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
    },
  });

  res.json(contracts);
});

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const { Contract, Job } = req.app.get('models');
  const { profile } = req;
  const contracts = await Contract.findAll({
    where: {
      status: 'in_progress',
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
    },
    include: {
      model: Job,
      where: {
        paid: {
          [Op.not]: true,
        },
      },
    },

  });

  const jobs = contracts.map((contract) => contract.Jobs).flat();

  res.json(jobs);
});

app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
  const { Contract, Job, Profile } = req.app.get('models');
  const { profile, params } = req;
  const { job_id: jobId } = params;
  const contracts = await Contract.findAll({
    where: {
      status: 'in_progress',
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
    },
    include: [{
      model: Job,
      where: {
        id: jobId,
        paid: {
          [Op.not]: true,
        },
      },
    }, {
      model: Profile,
      as: 'Client',
    }],

  });

  const [contractWithJob = {}] = contracts.filter((contract) => contract.Jobs.length > 0);
  const { Jobs: [job] = [], Client: client } = contractWithJob;

  if (!job) return res.status(404).end();

  if (profile.balance >= job.price) {
    await Profile.update(
      { balance: profile.balance - job.price },
      { where: { id: profile.id } },
    );
    await Profile.update(
      { balance: client.balance + job.price },
      { where: { id: client.id } },
    );
    await Job.update(
      { paid: true, paymentDate: new Date() },
      { where: { id: job.id } },
    );
  } else {
    return res.status(404).end();
  }

  res.json({});
});

app.post('/balances/deposit/:userId', async (req, res) => {
  const { Profile, Contract, Job } = req.app.get('models');
  const { userId } = req.params;
  const { deposit } = req.body;
  const contracts = await Contract.findAll({
    where: {
      status: 'in_progress',
      ClientId: userId,
    },
    include: [{
      model: Job,
      where: {
        paid: {
          [Op.not]: true,
        },
      },
    }, {
      model: Profile,
      as: 'Client',
    }],
  });

  const jobs = contracts.map((contract) => contract.Jobs).flat();
  const total = jobs.reduce((acc, job) => acc + job.price, 0);

  if (total * 0.25 >= deposit) {
    const client = contracts[0].Client;
    await Profile.update(
      { balance: client.balance + deposit },
      { where: { id: userId, type: 'client' } },
    );

    res.json({});
  } else {
    return res.status(404).end();
  }
});

app.get('/admin/best-profession', async (req, res) => {
  const { Contract, Job, Profile } = req.app.get('models');
  const { start, end } = req.query;

  const jobQuery = {
    paid: true,
  };

  if (start && end) {
    jobQuery.paymentDate = {
      [Op.between]: [start, end],
    };
  } else if (start) {
    jobQuery.paymentDate = {
      [Op.gte]: start,
    };
  } else if (end) {
    jobQuery.paymentDate = {
      [Op.lte]: end,
    };
  }

  const profiles = await Profile.findAll({
    group: ['Profile.profession'],
    attributes: ['profession'],
    order: sequelize.literal('`Contractor.total` DESC'),
    where: {
      type: 'contractor',
    },
    include: {
      model: Contract,
      as: 'Contractor',
      attributes: [[sequelize.fn('sum', sequelize.col('price')), 'total']],
      group: ['Contractor.id'],
      include: {
        model: Job,
        where: jobQuery,
      },
    },
  });

  const [profile] = profiles;
  const { profession } = profile;

  res.json({ profession });
});

app.get('/admin/best-clients', async (req, res) => {
  const { Contract, Job, Profile } = req.app.get('models');
  const { limit = 2 } = req.query;
  const { start, end } = req.query;

  const jobQuery = {
    paid: true,
  };

  if (start && end) {
    jobQuery.paymentDate = {
      [Op.between]: [start, end],
    };
  } else if (start) {
    jobQuery.paymentDate = {
      [Op.gte]: start,
    };
  } else if (end) {
    jobQuery.paymentDate = {
      [Op.lte]: end,
    };
  }

  const profiles = await Profile.findAll({
    where: {
      type: 'client',
    },
    include: {
      model: Contract,
      as: 'Client',
      include: {
        model: Job,
        where: jobQuery,
        limit: 1,
        order: [['price', 'DESC']],
      },
    },
  });

  let profilesSort = profiles.map((profile) => {
    // eslint-disable-next-line prefer-spread
    const maxPrice = Math.max.apply(Math, profile.Client.map((client) => {
      const { Jobs: [job = {}] = [] } = client;
      const { price = 0 } = job;

      return price;
    }));

    return {
      id: profile.id,
      fullName: `${profile.firstName} ${profile.lastName}`,
      paid: maxPrice,
    };
  });

  profilesSort = profilesSort.sort((a, b) => {
    if (a.paid > b.paid) {
      return -1;
    }
    if (a.paid < b.paid) {
      return 1;
    }

    return 0;
  });

  res.json(profilesSort.slice(0, limit));
});

module.exports = app;

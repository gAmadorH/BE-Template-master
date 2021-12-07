/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
describe('task 6: GET /admin/best-profession', () => {
  it('should returns the profession that earned the most money (backend-developer)', async () => {
    const professions = ['backend-developer', 'frontend-developer', 'designer'];

    for (const name of professions) {
      const contractor = await global.factory.create('profile', {
        type: 'contractor',
        profession: name,
      });
      const contracts = await global.factory.createMany('contract', 3, {
        ContractorId: contractor.id,
      });

      contracts.forEach(async (contract) => {
        // some unpaid jobs
        await global.factory.createMany('job', 3, {
          ContractId: contract.id,
          paid: false,
          paymentDate: null,
        });
      });

      // add one paid job for backend-developer
      if (name === 'backend-developer') {
        const [contract] = contracts;

        await global.factory.create('job', {
          ContractId: contract.id,
          paid: true,
          paymentDate: global.faker.date.recent(),
        });
      }
    }

    return global.request(global.server)
      .get('/admin/best-profession')
      .expect(200)
      .then(async (response) => {
        // should be backend-developer
        response.body.should.have.property('profession', 'backend-developer');
      });
  });

  it('should returns the profession that earned the most money (frontend-developer)', async () => {
    const professions = ['backend-developer', 'frontend-developer', 'designer'];

    for (const name of professions) {
      const contractor = await global.factory.create('profile', {
        type: 'contractor',
        profession: name,
      });
      const contracts = await global.factory.createMany('contract', 3, {
        ContractorId: contractor.id,
      });

      contracts.forEach(async (contract) => {
        // some unpaid jobs
        await global.factory.createMany('job', 3, {
          ContractId: contract.id,
          paid: false,
          paymentDate: null,
        });
      });

      // add one paid job for frontend-developer
      if (name === 'frontend-developer') {
        const [contract] = contracts;

        await global.factory.create('job', {
          ContractId: contract.id,
          paid: true,
          paymentDate: global.faker.date.recent(),
        });
      }
    }

    return global.request(global.server)
      .get('/admin/best-profession')
      .expect(200)
      .then(async (response) => {
        // should return frontend-developer
        response.body.should.have.property('profession', 'frontend-developer');
      });
  });

  it('should returns the profession that earned the most money (designer)', async () => {
    const professions = ['backend-developer', 'frontend-developer', 'designer'];

    for (const name of professions) {
      const contractor = await global.factory.create('profile', {
        type: 'contractor',
        profession: name,
      });
      const contracts = await global.factory.createMany('contract', 3, {
        ContractorId: contractor.id,
      });

      contracts.forEach(async (contract) => {
        // some unpaid jobs
        await global.factory.createMany('job', 3, {
          ContractId: contract.id,
          paid: false,
          paymentDate: null,
        });
      });

      // add one paid job for designer
      if (name === 'designer') {
        const [contract] = contracts;

        await global.factory.create('job', {
          ContractId: contract.id,
          paid: true,
          paymentDate: global.faker.date.recent(),
        });
      }
    }

    return global.request(global.server)
      .get('/admin/best-profession')
      .expect(200)
      .then(async (response) => {
        // should return designer
        response.body.should.have.property('profession', 'designer');
      });
  });
});

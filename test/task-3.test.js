/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
describe('task 3: GET /jobs/unpaid', () => {
  it('should Get all unpaid jobs for profile only for active contracts', async () => {
    const profile = await global.factory.create('profile');

    // some activated contracts
    const numContracts = global.faker.datatype.number({ min: 3, max: 5 });
    const contracts = await global.factory.createMany('contract', numContracts, {
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
      status: 'in_progress',
    });

    let unpaidJobs = 0;

    for (const contract of contracts) {
      // unpaid jobs in activated contract
      const numUnpaidJobs = global.faker.datatype.number({ min: 2, max: 3 });

      await global.factory.createMany('job', numUnpaidJobs, {
        ContractId: contract.id,
        paid: false,
        paymentDate: null,
      });

      unpaidJobs += numUnpaidJobs;

      // paid jobs in activated contract
      const numPaidJobs = global.faker.datatype.number({ min: 2, max: 3 });

      await global.factory.createMany('job', numPaidJobs, {
        ContractId: contract.id,
        paid: true,
        paymentDate: global.faker.date.recent(),
      });
    }

    // some terminated contracts
    const numTerminatedContracts = global.faker.datatype.number({ min: 3, max: 5 });
    const terminatedContracts = await global.factory.createMany('contract', numTerminatedContracts, {
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
      status: 'terminated',
    });

    for (const contract of terminatedContracts) {
      // unpaid jobs in activated contract
      const numUnpaidJobs = global.faker.datatype.number({ min: 2, max: 3 });

      await global.factory.createMany('job', numUnpaidJobs, {
        ContractId: contract.id,
        paid: false,
        paymentDate: null,
      });
    }

    return global.request(global.server)
      .get('/jobs/unpaid')
      .query({
        profile_id: profile.id,
      })
      .expect(200)
      .then((response) => {
        response.body.should.have.length(unpaidJobs);

        response.body.forEach((job) => {
          job.should.have.property('id');
          job.should.have.property('description');
          job.should.have.property('price');

          // just unpaid jobs
          job.should.have.property('paid', false);
          job.should.have.property('paymentDate', null);

          job.should.have.property('createdAt');
          job.should.have.property('updatedAt');
          job.should.have.property('ContractId');
        });
      });
  });
});

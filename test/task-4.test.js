/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
describe('task 4: POST /jobs/:job_id/pay', () => {
  it('should pay for a job', async () => {
    const client = await global.factory.create('profile', {
      type: 'client',
      balance: 100,
    });
    const contractor = await global.factory.create('profile', {
      type: 'contractor',
      balance: 15,
    });
    const contract = await global.factory.create('contract', {
      ClientId: client.id,
      ContractorId: contractor.id,
      status: 'in_progress',
    });
    const numUnpaidJobs = global.faker.datatype.number({ min: 2, max: 3 });

    const [job] = await global.factory.createMany('job', numUnpaidJobs, {
      ContractId: contract.id,
      price: 40,
      paid: false,
      paymentDate: null,
    });

    return global.request(global.server)
      .post(`/jobs/${job.id}/pay`)
      .query({
        profile_id: client.id,
      })
      .expect(200)
      .then(async () => {
        const { Profile, Job } = global.models;

        // check client
        const findClient = await Profile.findOne({ where: { id: client.id, type: 'client' } });
        findClient.should.have.property('balance', client.balance - job.price);

        // check contractor
        const findContractor = await Profile.findOne({ where: { id: contractor.id, type: 'contractor' } });
        findContractor.should.have.property('balance', contractor.balance + job.price);

        // check job
        const findJob = await Job.findByPk(job.id);
        findJob.should.have.property('price', job.price);
        findJob.should.have.property('paid', true);
        findJob.should.have.property('paymentDate');
      });
  });
});

describe('task 5: POST /balances/deposit/:userId', () => {
  it('should deposits money into the the the balance of a client', async () => {
    const client = await global.factory.create('profile', {
      type: 'client',
      balance: 100,
    });
    const contract = await global.factory.create('contract', {
      ClientId: client.id,
      status: 'in_progress',
    });

    // some unpaid jobs
    const numUnpaidJobs = global.faker.datatype.number({ min: 2, max: 3 });
    const unpaidJobs = await global.factory.createMany('job', numUnpaidJobs, {
      ContractId: contract.id,
      paid: false,
      paymentDate: null,
    });

    // to pay
    const totalToPay = unpaidJobs.reduce((acc, job) => acc + job.price, 0);
    const toPay = totalToPay * 0.25;

    // some paid jobs (not to pay)
    const numPaidJobs = global.faker.datatype.number({ min: 2, max: 3 });
    await global.factory.createMany('job', numPaidJobs, {
      ContractId: contract.id,
      paid: true,
      paymentDate: global.faker.date.recent(),
    });

    return global.request(global.server)
      .post(`/balances/deposit/${client.id}`)
      .send({
        deposit: toPay,
      })
      .expect(200)
      .then(async () => {
        const { Profile } = global.models;

        // check client
        const findClient = await Profile.findOne({ where: { id: client.id, type: 'client' } });
        findClient.should.have.property('balance', client.balance + toPay);
      });
  });

  it('should not deposits money into the the the balance of a client (mor than 25 % to pay)', async () => {
    const client = await global.factory.create('profile', {
      type: 'client',
      balance: 100,
    });
    const contract = await global.factory.create('contract', {
      ClientId: client.id,
      status: 'in_progress',
    });

    // some unpaid jobs
    const numUnpaidJobs = global.faker.datatype.number({ min: 2, max: 3 });
    const unpaidJobs = await global.factory.createMany('job', numUnpaidJobs, {
      ContractId: contract.id,
      paid: false,
      paymentDate: null,
    });

    // to pay
    const totalToPay = unpaidJobs.reduce((acc, job) => acc + job.price, 0);
    const toPay = totalToPay * 0.25;

    return global.request(global.server)
      .post(`/balances/deposit/${client.id}`)
      .send({
        deposit: toPay + 0.01, // it is more than 25 %
      })
      .expect(404);
  });
});

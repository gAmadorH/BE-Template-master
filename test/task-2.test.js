describe('task 2: GET /contracts', () => {
  it('should returns a list of contracts belonging to a profile, the list should only contain non terminated contracts', async () => {
    // create one profile and its contract
    const profile = await global.factory.create('profile');
    await global.factory.createMany('contract', 3, {
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
    });

    // create other profile with its contract
    const otherProfile = await global.factory.create('profile');
    const otherNumContracts = global.faker.datatype.number({ min: 5, max: 10 });
    const otherContracts = await global.factory.createMany('contract', otherNumContracts, {
      [otherProfile.type === 'client' ? 'ClientId' : 'ContractorId']: otherProfile.id,
    });
    // some terminated contracts
    const otherNumTerminatedContracts = global.faker.datatype.number({ min: 5, max: 10 });
    await global.factory.createMany('contract', otherNumTerminatedContracts, {
      [otherProfile.type === 'client' ? 'ClientId' : 'ContractorId']: otherProfile.id,
      status: 'terminated',
    });

    const otherNotTerminatedContracts = otherContracts.filter((contract) => contract.status !== 'terminated');

    return global.request(global.server)
      .get('/contracts')
      .query({
        profile_id: otherProfile.id,
      })
      .expect(200)
      .then((response) => {
        response.body.should.have.length(otherNotTerminatedContracts.length);

        response.body.forEach((contract) => {
          contract.should.have.property('id');
          contract.should.have.property('terms');
          contract.should.have.property('status');

          // terminated contracts are not allowed
          contract.status.should.not.be.equal('terminated');

          contract.should.have.property('createdAt');
          contract.should.have.property('updatedAt');
          contract.should.have.property(otherProfile.type === 'client' ? 'ClientId' : 'ContractorId', otherProfile.id);
          contract.should.have.property(otherProfile.type === 'client' ? 'ContractorId' : 'ClientId', null);
        });
      });
  });
});

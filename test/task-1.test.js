describe('task 1: GET /contracts/:id', () => {
  it('should return the contract only if it belongs to the profile calling', async () => {
    // create one profile and its contract
    const profile = await global.factory.create('profile');
    await global.factory.create('contract', {
      [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id,
    });

    // create other profile with its contract
    const otherProfile = await global.factory.create('profile');
    const otherContract = await global.factory.create('contract', {
      [otherProfile.type === 'client' ? 'ClientId' : 'ContractorId']: otherProfile.id,
    });

    return global.request(global.server)
      .get(`/contracts/${otherContract.id}`)
      .query({
        profile_id: otherProfile.id,
      })
      .expect(200)
      .then((response) => {
        response.body.should.have.property('id', otherContract.id);
        response.body.should.have.property('terms', otherContract.terms);
        response.body.should.have.property('status', otherContract.status);
        response.body.should.have.property('createdAt', global.moment.utc(otherContract.createdAt).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
        response.body.should.have.property('updatedAt', global.moment.utc(otherContract.updatedAt).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'));
        response.body.should.have.property(otherProfile.type === 'client' ? 'ClientId' : 'ContractorId', otherProfile.id);
        response.body.should.have.property(otherProfile.type === 'client' ? 'ContractorId' : 'ClientId', null);
      });
  });
});

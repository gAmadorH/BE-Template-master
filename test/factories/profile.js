module.exports = (factory, models) => {
  factory.define('profile', models.Profile, {
    firstName: global.faker.name.findName(),
    lastName: global.faker.name.lastName(),
    profession: global.faker.name.jobTitle(),
    balance: global.faker.datatype.float(),
    type: global.faker.random.arrayElement(['client', 'contractor']),
  });
};

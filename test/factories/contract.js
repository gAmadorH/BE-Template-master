module.exports = (factory, models) => {
  factory.define('contract', models.Contract, {
    terms: global.faker.finance.transactionDescription(),
    status: global.faker.random.arrayElement(['new', 'in_progress', 'terminated']),
  });
};

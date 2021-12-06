module.exports = (factory, models) => {
  const isPaid = global.faker.datatype.boolean();

  factory.define('job', models.Job, {
    description: global.faker.name.jobDescriptor(),
    price: global.faker.datatype.float(),
    paid: isPaid,
    paymentDate: isPaid ? global.faker.date.recent() : null,
  });
};

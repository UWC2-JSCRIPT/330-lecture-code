module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
    const users = await db.collection('users').find().toArray();
    for (let user of users) {
      const transactions = user.transactions;
      if (transactions && transactions.length > 0) {
        transactions.forEach((t) => {
          t.userId = user._id;
        })
        await db.collection('transactions').insertMany(transactions);
        await db.collection('users').updateOne({ _id: user._id }, { $unset: { transactions: true } })
      }
    }
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // insertMany await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};

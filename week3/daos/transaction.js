const Transaction = require("../models/transaction");

const mongoose = require("mongoose");

module.exports = {};

module.exports.getAll = (userId, page, perPage) => {
  return Transaction.find({ userId })
    .limit(perPage)
    .skip(perPage * page)
    .lean();
};

module.exports.getById = async (userId, transactionId) => {
  // return Transaction.findOne({ _id: transactionId, userId }).lean();
  return (
    await Transaction.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(transactionId), userId } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ])
  )[0];
};

module.exports.deleteById = (userId, transactionId) => {
  return Transaction.deleteOne({ _id: transactionId, userId });
};

module.exports.updateById = (userId, transactionId, newObj) => {
  return Transaction.updateOne({ _id: transactionId, userId }, newObj);
};

module.exports.create = (transactionData) => {
  return Transaction.create(transactionData);
};

module.exports.getStats = (userId, startDate, endDate) => {
  return Transaction.aggregate([
    { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: userId, count: { $sum: 1 }, sum: { $sum: "$charge" } } },
  ]);
};

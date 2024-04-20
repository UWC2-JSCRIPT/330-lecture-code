const { Router } = require("express");
const router = Router({ mergeParams: true });

const transactionDAO = require("../daos/transaction");

// Create
router.post("/", async (req, res, next) => {
  const userId = req.params.userId;
  const transaction = req.body;
  transaction.userId = userId;
  if (!transaction || JSON.stringify(transaction) === "{}") {
    res.status(400).send("transaction is required");
  } else {
    try {
      const savedtransaction = await transactionDAO.create(transaction);
      res.json(savedtransaction);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
});

// Read - transaction stats
router.get("/stats", async (req, res, next) => {
  const userId = req.params.userId;
  const { start, end } = req.query;
  const stats = await transactionDAO.getStats(
    userId,
    new Date(start),
    new Date(end)
  );
  res.json(stats);
});

// Read - single transaction
router.get("/:id", async (req, res, next) => {
  const userId = req.params.userId;
  // TODO populate user field in response with actual user data
  const transaction = await transactionDAO.getById(userId, req.params.id);
  if (transaction) {
    res.json(transaction);
  } else {
    res.sendStatus(404);
  }
});

// Read - all transactions
router.get("/", async (req, res, next) => {
  const userId = req.params.userId;
  let { page, perPage } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  // TODO speed this up
  const transactions = await transactionDAO.getAll(userId, page, perPage);
  res.json(transactions);
});

// Update
router.put("/:id", async (req, res, next) => {
  const userId = req.params.userId;
  const transactionId = req.params.id;
  const transaction = req.body;
  transaction.userId = userId;
  if (!transaction || JSON.stringify(transaction) === "{}") {
    res.status(400).send('transaction is required"');
  } else {
    const updatedtransaction = await transactionDAO.updateById(
      userId,
      transactionId,
      transaction
    );
    res.json(updatedtransaction);
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const userId = req.params.userId;
  const transactionId = req.params.id;
  try {
    await transactionDAO.deleteById(userId, transactionId);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;

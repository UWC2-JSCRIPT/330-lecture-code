const { Router } = require("express");
const router = Router();

const userDAO = require("../daos/user");

// Create
router.post("/", async (req, res, next) => {
  const user = req.body;
  if (!user || JSON.stringify(user) === "{}") {
    res.status(400).send("user is required");
  } else {
    try {
      // TODO ensure userId does not already exist
      const saveduser = await userDAO.create(user);
      res.json(saveduser);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
});

// Read - single user
router.get("/:id", async (req, res, next) => {
  const user = await userDAO.getById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
});

// Read - all users
router.get("/", async (req, res, next) => {
  let { page, perPage, query } = req.query;
  page = page ? Number(page) : 0;
  perPage = perPage ? Number(perPage) : 10;
  if (query) {
    const users = await userDAO.search(query);
    res.json(users);
  } else {
    const users = await userDAO.getAll(page, perPage);
    res.json(users);
  }
});

// Update
router.put("/:id", async (req, res, next) => {
  const userId = req.params.id;
  const user = req.body;
  if (!user || JSON.stringify(user) === "{}") {
    res.status(400).send('user is required"');
  } else {
    const updateduser = await userDAO.updateById(userId, user);
    res.json(updateduser);
  }
});

// Delete
router.delete("/:id", async (req, res, next) => {
  const userId = req.params.id;
  try {
    await userDAO.deleteById(userId);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;

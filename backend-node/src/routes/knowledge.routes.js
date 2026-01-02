const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/knowledge.controller");
const {
  validateCreateKnowledge,
  validateUpdateKnowledge
} = require("../validators/knowledge.validator");

router.post("/", auth, role("company_admin"), validateCreateKnowledge, controller.createItem);
router.get("/", auth, controller.listItems);
router.put("/:id", auth, role("company_admin"), validateUpdateKnowledge, controller.updateItem);
router.delete("/:id", auth, role("company_admin"), controller.deleteItem);

module.exports = router;
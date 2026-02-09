const express = require("express");
const router = express.Router();
const multer = require('multer');

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/knowledge.controller");
const {
  validateCreateKnowledge,
  validateUpdateKnowledge
} = require("../validators/knowledge.validator");

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post("/", auth, role("company_admin"), validateCreateKnowledge, controller.createItem);
router.get("/", auth, controller.listItems);
router.put("/:id", auth, role("company_admin"), validateUpdateKnowledge, controller.updateItem);
router.delete("/:id", auth, role("company_admin"), controller.deleteItem);

// PDF upload endpoint
router.post('/upload-pdf', auth, upload.single('file'), controller.uploadPDF);

// Toggle use in calls
router.patch('/:id/toggle-calls', auth, controller.toggleUseInCalls);

module.exports = router;
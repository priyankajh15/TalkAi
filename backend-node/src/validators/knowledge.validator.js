const Joi = require("joi");

const createSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  category: Joi.string().trim().max(100).optional(),
  content: Joi.string().trim().min(5).required()
});

const updateSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  category: Joi.string().trim().max(100).optional(),
  content: Joi.string().trim().min(5).optional()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(e => ({
        field: e.path.join("."),
        message: e.message
      }))
    });
  }

  next();
};

module.exports = {
  validateCreateKnowledge: validate(createSchema),
  validateUpdateKnowledge: validate(updateSchema)
};
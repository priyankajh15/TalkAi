const mongoose = require("mongoose");
const KnowledgeBase = require("../models/KnowledgeBase.model");

/**
 * CREATE
 */
exports.createItem = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    
    const item = await KnowledgeBase.create({
      companyId: req.user.companyId,
      title,
      content,
      category
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

/**
 * LIST (pagination + search)
 */
exports.listItems = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {
      companyId: req.user.companyId,
      isActive: true
    };

    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: new RegExp(escapedSearch, "i") },
        { content: new RegExp(escapedSearch, "i") }
      ];
    }

    const [items, total] = await Promise.all([
      KnowledgeBase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      KnowledgeBase.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE
 */
exports.updateItem = async (req, res, next) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format"
      });
    }

    // Check if req.body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required"
      });
    }

    const { title, content, category } = req.body;
    
    // Validate at least one field is provided
    if (title === undefined && content === undefined && category === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (title, content, category) is required"
      });
    }
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    
    const item = await KnowledgeBase.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.user.companyId,
        isActive: true
      },
      updateData,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE (soft)
 */
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await KnowledgeBase.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.user.companyId,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found"
      });
    }

    res.json({
      success: true,
      message: "Knowledge item deleted"
    });
  } catch (err) {
    next(err);
  }
};
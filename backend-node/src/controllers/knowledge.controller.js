const mongoose = require("mongoose");
const KnowledgeBase = require("../models/KnowledgeBase.model");
const fs = require('fs');
const pdfParse = require('pdf-parse');

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
      query.$text = { $search: req.query.search };
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

/**
 * UPLOAD PDF
 */
function chunkContent(text, chunkSize = 1500) {
  const chunks = [];
  if (text.length <= chunkSize) return [text];
  
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += '\n\n' + para;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

exports.uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Extract text from PDF
    let pdfText = '';
    try {
      const pdfBuffer = await fs.promises.readFile(req.file.path);
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = pdfData.text;
      
      await fs.promises.unlink(req.file.path);
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      pdfText = `PDF file: ${req.file.originalname}. Text extraction failed.`;
      
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('File cleanup error:', unlinkError);
      }
    }

    // Create knowledge base entry with extracted text
    const extractionFailed = pdfText.includes('Text extraction failed');
    
    const item = await KnowledgeBase.create({
      companyId: req.user.companyId,
      title: req.file.originalname.replace('.pdf', ''),
      content: pdfText,
      chunks: chunkContent(pdfText, 1500),
      category: 'pdf',
      fileSize: req.file.size,
      useInCalls: !extractionFailed,
      extractionFailed: extractionFailed
    });
    
    res.status(201).json({
      success: !extractionFailed,
      data: item,
      message: extractionFailed 
        ? "PDF upload failed. File may be corrupted, try again."
        : "PDF uploaded and processed successfully",
      extractionFailed
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('File cleanup error:', unlinkError);
      }
    }
    next(err);
  }
};

/**
 * TOGGLE USE IN CALLS
 */
exports.toggleUseInCalls = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { useInCalls } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format"
      });
    }

    const item = await KnowledgeBase.findOneAndUpdate(
      {
        _id: id,
        companyId: req.user.companyId,
        isActive: true
      },
      { useInCalls },
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
      data: item,
      message: useInCalls 
        ? `"${item.title}" is now active for voice calls` 
        : `"${item.title}" is now inactive for voice calls`
    });
  } catch (err) {
    next(err);
  }
};
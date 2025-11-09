const express = require('express');
const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const authenticateToken = require('../middleware/auth');
const errorResponse = require('../utils/errorResponse');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    errorResponse(res, 500, 'Server error fetching assignments', error);
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, numbers } = req.body;

    if (!Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Numbers array is required and cannot be empty' });
    }

    const dpNumbers = numbers.map((num) => {
      const cleanNum = num.toString().replace(/^DP/i, '').trim();
      const numValue = parseInt(cleanNum, 10);
      if (isNaN(numValue) || numValue <= 0 || cleanNum.includes('.')) {
        throw new Error(`Invalid number format: ${num}. Only positive whole numbers are allowed.`);
      }
      return `DP${cleanNum.padStart(4, '0')}`;
    });

    const uniqueNumbers = [...new Set(dpNumbers)];
    if (uniqueNumbers.length !== dpNumbers.length) {
      const duplicatesInInput = dpNumbers.filter(
        (num, index) => dpNumbers.indexOf(num) !== index
      );
      return res.status(400).json({
        error: `Duplicate numbers found in your input: ${[...new Set(duplicatesInInput)].join(', ')}`,
      });
    }

    const existingAssignments = await Assignment.find({
      createdBy: req.user._id,
      numbers: { $in: dpNumbers },
    });

    if (existingAssignments.length > 0) {
      const existingNumbers = existingAssignments.flatMap((a) => a.numbers);
      const duplicates = dpNumbers.filter((num) => existingNumbers.includes(num));
      return res.status(400).json({
        error: `These numbers already exist in your assignments: ${duplicates.join(', ')}`,
      });
    }

    const assignment = new Assignment({
      title,
      description,
      numbers: dpNumbers,
      createdBy: req.user._id,
    });

    await assignment.save();
    await assignment.populate('createdBy', 'email role');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    if (error.message.includes('Invalid number format')) {
      return res.status(400).json({ error: error.message });
    }
    errorResponse(res, 500, 'Server error creating assignment', error);
  }
});

router.get('/numbers', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id });
    const allNumbers = assignments.flatMap((assignment) => assignment.numbers);

    const uniqueNumbers = [...new Set(allNumbers)].sort((a, b) => {
      const numA = Number(a.replace(/^DP0*/, '') || 0);
      const numB = Number(b.replace(/^DP0*/, '') || 0);
      return numA - numB;
    });

    res.json({
      numbers: uniqueNumbers,
      totalNumbers: uniqueNumbers.length,
    });
  } catch (error) {
    errorResponse(res, 500, 'Server error fetching numbers', error);
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate('createdBy', 'email role');
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ assignment });
  } catch (error) {
    errorResponse(res, 500, 'Server error fetching assignment', error);
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    errorResponse(res, 500, 'Server error deleting assignment', error);
  }
});

module.exports = router;

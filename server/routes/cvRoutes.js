// routes/cvRoutes.js

import express from 'express';
import mongoose from 'mongoose';
import CV from '../models/CV.js';

const cvRouter = express.Router();

cvRouter.get('/cv/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(req.session);

    const userCV = await CV.findOne({ user: userId }).populate('user');

    if (!userCV) {
      return res.status(404).json({ message: 'CV not found' });
    }

    res.status(200).json(userCV);
  } catch (error) {
    console.error('Error retrieving CV:', error);
    res.status(500).json({ message: 'Failed to retrieve CV' });
  }
});

cvRouter.patch('/cv/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { headline, phone, skills, education, projects, experience } =
      req.body;

    // Ensure the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid user ID');
    }

    // Find the CV by user ID
    const existingCV = await CV.findOne({ user: userId });
    if (!existingCV) {
      return res.status(404).json({ message: 'CV not found' });
    }

    // Update the existing CV with the new data
    existingCV.headline = headline || existingCV.headline;
    existingCV.phone = phone || existingCV.phone;
    existingCV.skills = skills || existingCV.skills;
    existingCV.education = education || existingCV.education;
    existingCV.projects = projects || existingCV.projects;
    existingCV.experience = experience || existingCV.experience;

    const updatedCV = await existingCV.save();
    res.status(200).json(updatedCV);
  } catch (error) {
    console.error('Error updating CV:', error);
    res.status(500).json({ message: 'Failed to update CV' });
  }
});


cvRouter.delete('/cv/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedCV = await CV.findOneAndDelete({ user: userId });
    if (!deletedCV) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.status(200).json({ message: 'CV deleted successfully' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ message: 'Failed to delete CV' });
  }
});

export default cvRouter;

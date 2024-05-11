// routes/cvRoutes.js

import express from 'express';
import CV from '../models/CV.js';
// import { createCV } from '../controllers/cvController.js';

const cvRouter = express.Router();

// cvRouter.post('/cv', async (req, res) => {
//   try {
//     const { user, headline, phone, skills, education, projects, experience } =
//       req.body;
//     const newCV = new CV({
//       user,
//       headline,
//       phone,
//       skills: skills ? skills : [],
//       education: education ? education : [],
//       projects: projects ? projects : [],
//       experience: experience ? experience : [],
//     });
//     const savedCV = await newCV.save();
//     res.status(201).json(savedCV);
//   } catch (error) {
//     console.error('Error creating CV:', error);
//     res.status(500).json({ message: 'Failed to create CV' });
//   }
// });

cvRouter.post('/cv', async (req, res) => {
  try {
    const { user, headline, phone, skills, education, projects, experience } =
      req.body;

    // Check if a CV already exists for the user
    const existingCV = await CV.findOne({ user });

    // If a CV already exists, update it; otherwise, create a new one
    if (existingCV) {
      existingCV.headline = headline;
      existingCV.phone = phone;
      existingCV.skills = skills || [];
      existingCV.education = education || [];
      existingCV.projects = projects || [];
      existingCV.experience = experience || [];
      const updatedCV = await existingCV.save();
      res.status(200).json(updatedCV);
    } else {
      const newCV = new CV({
        user,
        headline,
        phone,
        skills: skills || [],
        education: education || [],
        projects: projects || [],
        experience: experience || [],
      });
      const savedCV = await newCV.save();
      res.status(201).json(savedCV);
    }
  } catch (error) {
    console.error('Error creating or updating CV:', error);
    res.status(500).json({ message: 'Failed to create or update CV' });
  }
});


cvRouter.get('/cv/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(req.params);

    const userCV = await CV.findOne({ user: userId });
    if (!userCV) {
      return res.status(404).json({ message: 'CV not found' });
    }
    res.status(200).json(userCV);
  } catch (error) {
    console.error('Error retrieving CV:', error);
    res.status(500).json({ message: 'Failed to retrieve CV' });
  }
});

cvRouter.put('/cv/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedCVData = req.body;
    const updatedCV = await CV.findOneAndUpdate(
      { user: userId },
      updatedCVData,
      { new: true }
    );
    if (!updatedCV) {
      return res.status(404).json({ message: 'CV not found' });
    }
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

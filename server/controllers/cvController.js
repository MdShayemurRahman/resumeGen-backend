// controllers/cvController.js

import CV from '../models/CV.js';

const createCV = async (req, res) => {
  try {
    const { user, headline, phone, skills, education, projects, experience } =
      req.body;
    const newCV = new CV({
      user,
      headline,
      phone,
      skills,
      education,
      projects,
      experience,
    });
    const savedCV = await newCV.save();
    res.status(201).json(savedCV);
  } catch (error) {
    console.error('Error creating CV:', error);
    res.status(500).json({ message: 'Failed to create CV' });
  }
};

export { createCV };

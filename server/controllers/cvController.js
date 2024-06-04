import { findCvByUserId, updateCv } from '../services/cvService.js';

export const getCvByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userCV = await findCvByUserId(userId);

    if (!userCV) {
      return res.status(404).json({ message: 'CV not found' });
    }

    res.status(200).json(userCV);
  } catch (error) {
    console.error('Error retrieving CV:', error);
    res.status(500).json({ message: 'Failed to retrieve CV' });
  }
};

export const updateCvByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updatedCV = await updateCv(userId, req.body);

    res.status(200).json(updatedCV);
  } catch (error) {
    console.error('Error updating CV:', error);
    if (
      error.message === 'Invalid user ID' ||
      error.message === 'CV not found'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update CV' });
  }
};

// controllers/resume/controller.resume.js
import Resume from '../../models/resume.model.js';
import { createError } from '../../utils/error.util.js';
import LinkedInService from '../../services/linkedin.service.js';
import User from '../../models/user.model.js';

// Create a new resume
export const createResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeData = {
      ...req.body,
      user: userId,
    };

    const resume = await Resume.create(resumeData);

    // Add resume reference to user
    await User.findByIdAndUpdate(userId, {
      $push: { resumes: resume._id },
    });

    res.status(201).json({
      status: 'success',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// Import resume from LinkedIn
export const importFromLinkedIn = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.linkedinId) {
      throw createError(400, 'No LinkedIn account linked');
    }

    // Get fresh LinkedIn data
    const accessToken = await LinkedInService.refreshAccessToken(user._id);
    const profileData = await LinkedInService.getProfileData(accessToken);

    // Create resume with LinkedIn data
    const resumeData = {
      user: user._id,
      title: `${userInfoResponse.data.name}'s LinkedIn Resume`,
      personalInfo: {
        name: userInfoResponse.data.name,
        jobTitle: profileResponse.data.headline?.localized?.en_US || '',
        email: userInfoResponse.data.email,
        profilePicture: userInfoResponse.data.picture,
        linkedinUrl: profileResponse.data.vanityName
          ? `https://www.linkedin.com/in/${profileResponse.data.vanityName}`
          : null,
      },
      // Add other LinkedIn data as it becomes available with more scopes
    };

    const resume = await Resume.create(resumeData);

    // Add resume reference to user
    await User.findByIdAndUpdate(user._id, {
      $push: { resumes: resume._id },
    });

    res.status(201).json({
      status: 'success',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// Get all resumes for a user
export const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id });
    res.json({
      status: 'success',
      data: { resumes },
    });
  } catch (error) {
    next(error);
  }
};

// Get a single resume
export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      throw createError(404, 'Resume not found');
    }

    res.json({
      status: 'success',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// Update a resume
export const updateResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!resume) {
      throw createError(404, 'Resume not found');
    }

    res.json({
      status: 'success',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a resume
export const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!resume) {
      throw createError(404, 'Resume not found');
    }

    // Remove resume reference from user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { resumes: resume._id },
    });

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// Get public resume by slug
export const getPublicResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      slug: req.params.slug,
      isPublic: true,
    });

    if (!resume) {
      throw createError(404, 'Resume not found');
    }

    res.json({
      status: 'success',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

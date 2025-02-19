import Resume from '../../models/resume.model.js';
import User from '../../models/user.model.js';
import { createError } from '../../utils/error.util.js';
import LinkedInService from '../../services/linkedin.service.js';

export const createResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeData = {
      ...req.body,
      user: userId,
    };

    const resume = await Resume.create(resumeData);

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

export const getUserResumes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { search, searchFields, filters } = req.query;

    const query = { user: req.user.id };

    if (search) {
      const searchQuery = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      query.$or = searchQuery;
    }

    if (filters) {
      if (filters.updatedAt) {
        query.updatedAt = {
          $gte: new Date(filters.updatedAt.startDate),
          $lte: new Date(filters.updatedAt.endDate),
        };
      }
      if (typeof filters.isPublic === 'boolean') {
        query.isPublic = filters.isPublic;
      }
    }

    const skip = (page - 1) * limit;
    const resumes = await Resume.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ updatedAt: -1 });

    const total = await Resume.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        resumes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

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
      message: 'Resume deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

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

export const importFromLinkedIn = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.linkedinId) {
      throw createError(400, 'No LinkedIn account linked');
    }

    const {
      importEducation = true,
      importExperience = true,
      importSkills = true,
      overwrite = false,
    } = req.body;

    const accessToken = await LinkedInService.refreshAccessToken(user._id);
    const profileData = await LinkedInService.getProfileData(accessToken);

    const resumeData = {
      user: user._id,
      title: `${profileData.name}'s LinkedIn Resume`,
      personalInfo: {
        name: profileData.name,
        jobTitle: profileData.headline,
        email: profileData.email,
        profilePicture: profileData.pictureUrl,
        linkedinUrl: profileData.publicProfileUrl,
      },
    };

    if (importEducation && profileData.education) {
      resumeData.education = profileData.education.map((edu) => ({
        institution: edu.schoolName,
        degree: edu.degree,
        field: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        current: !edu.endDate,
      }));
    }

    if (importExperience && profileData.positions) {
      resumeData.experience = profileData.positions.map((pos) => ({
        title: pos.title,
        company: pos.companyName,
        location: pos.location,
        startDate: pos.startDate,
        endDate: pos.endDate,
        current: pos.isCurrent,
        description: pos.description,
      }));
    }

    if (importSkills && profileData.skills) {
      resumeData.skills = [
        {
          category: 'Professional Skills',
          skills: profileData.skills.map((skill) => ({
            name: skill.name,
          })),
        },
      ];
    }

    const resume = await Resume.create(resumeData);

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

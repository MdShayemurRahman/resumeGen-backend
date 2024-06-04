// tests/cvController.test.js
import request from 'supertest';
import app from '../app.js';
import { findCvByUserId, updateCv, deleteCv } from '../services/cvService.js';
import mongoose from 'mongoose';

jest.mock('../services/cvService.js');
console.error = jest.fn();

describe('CV Controller', () => {
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /cv/:userId', () => {
    it('should return the CV when a valid user ID is provided', async () => {
      const userId = '60a1b0c0d2b3a04b1c7d0f1c';
      const mockCV = {
        _id: '665f2a5fda142cae42082ad7',
        user: {
          _id: userId,
          fullName: 'John Doe',
          email: 'johndoe@example.com',
        },
        headline: 'Software Engineer',
        phone: '1234567890',
        skills: ['JavaScript', 'Node.js'],
      };

      findCvByUserId.mockResolvedValue(mockCV);

      const response = await request(app).get(`/cv/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCV);
    });

    it('should return a 404 error when the CV is not found', async () => {
      const userId = '51a1b0c0d2b3a04b1c7d0f1d';

      findCvByUserId.mockResolvedValue(null);

      const response = await request(app).get(`/cv/${userId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'CV not found' });
    });

    it('should return a 500 error when an exception occurs', async () => {
      const userId = '60a1b0c0d2b3a04b1c7d0f1c';

      findCvByUserId.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get(`/cv/${userId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to retrieve CV' });
    });
  });

  describe('PATCH /cv/:userId', () => {
    it('should update the CV when a valid user ID and CV data are provided', async () => {
      const userId = '665f2a5fda142cae42082ad7';
      const updatedCVData = {
        headline: 'Updated Headline',
        phone: '9876543210',
        skills: ['JavaScript', 'Node.js', 'React'],
      };

      updateCv.mockResolvedValue({
        _id: '665f2a5fda142cae42082ad7',
        user: userId,
        ...updatedCVData,
      });

      const response = await request(app)
        .patch(`/cv/${userId}`)
        .send(updatedCVData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: '665f2a5fda142cae42082ad7',
        user: userId,
        ...updatedCVData,
      });
    });

    it('should return a 400 error when an invalid user ID is provided', async () => {
      const userId = 'invalidUserId';
      const updatedCVData = {
        headline: 'Updated Headline',
        phone: '9876543210',
        skills: ['JavaScript', 'Node.js', 'React'],
      };

      updateCv.mockRejectedValue(new Error('Invalid user ID'));

      const response = await request(app)
        .patch(`/cv/${userId}`)
        .send(updatedCVData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid user ID' });
    });

    it('should return a 400 error when the CV is not found', async () => {
      const userId = '60a1b0c0d2b3a04b1c7d0f1c';
      const updatedCVData = {
        headline: 'Updated Headline',
        phone: '9876543210',
        skills: ['JavaScript', 'Node.js', 'React'],
      };

      updateCv.mockRejectedValue(new Error('CV not found'));

      const response = await request(app)
        .patch(`/cv/${userId}`)
        .send(updatedCVData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'CV not found' });
    });

    it('should return a 500 error when an exception occurs', async () => {
      const userId = '60a1b0c0d2b3a04b1c7d0f1c';
      const updatedCVData = {
        headline: 'Updated Headline',
        phone: '9876543210',
        skills: ['JavaScript', 'Node.js', 'React'],
      };

      updateCv.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch(`/cv/${userId}`)
        .send(updatedCVData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: 'Failed to update CV' });
    });
  });
});

import request from 'supertest';
import app from '../app.js';
import linkedinAuthService from '../services/linkedinAuthService.js';
import User from '../models/User.js';
import CV from '../models/CV.js';
import { handleCheckAuth, handleLogOut } from '../controllers/linkedinController.js';

jest.mock('../services/linkedinAuthService.js');
jest.mock('../models/User.js');
jest.mock('../models/CV.js');

const userId = '6797f2182672b0761e36cd45';
describe('LinkedIn Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('POST /logout', () => {
    it('should log out the user and destroy the session', async () => {
      const destroySpy = jest.fn((callback) => callback());
      const clearCookieSpy = jest.fn().mockReturnThis();
      const req = {
        session: {
          destroy: destroySpy,
        },
      };
      const res = {
        clearCookie: clearCookieSpy,
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await handleLogOut(req, res);

      expect(destroySpy).toHaveBeenCalledTimes(1);
      expect(clearCookieSpy).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('Logged out successfully');
    });
  });

  describe('GET /checkAuth', () => {
    it('should return isAuthenticated true if user is authenticated', async () => {
      const req = {
        session: {
          user: {
            _id: userId,
          },
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handleCheckAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isAuthenticated: true });
    });

    it('should return isAuthenticated false if user is not authenticated', async () => {
      const req = {
        session: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await handleCheckAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ isAuthenticated: false });
    });
  });
});

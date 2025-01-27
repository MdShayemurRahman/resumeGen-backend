import express from 'express';
import {
  getCvByUserId,
  updateCvByUserId,
} from '../controllers/controller.cv.js';

const cvRouter = express.Router();

cvRouter.get('/:userId', getCvByUserId);
cvRouter.patch('/:userId', updateCvByUserId);

export default cvRouter;

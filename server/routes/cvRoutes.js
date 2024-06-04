import express from 'express';
import {
  getCvByUserId,
  updateCvByUserId,
} from '../controllers/cvController.js';

const cvRouter = express.Router();

cvRouter.get('/:userId', getCvByUserId);
cvRouter.patch('/:userId', updateCvByUserId);

export default cvRouter;

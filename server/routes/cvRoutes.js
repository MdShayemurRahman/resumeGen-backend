import express from 'express';
import {
  getCvByUserId,
  updateCvByUserId,
  deleteCvByUserId,
} from '../controllers/cvController.js';

const cvRouter = express.Router();

cvRouter.get('/:userId', getCvByUserId);
cvRouter.patch('/:userId', updateCvByUserId);
cvRouter.delete('/:userId', deleteCvByUserId);

export default cvRouter;

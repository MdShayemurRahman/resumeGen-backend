import { ZodError } from 'zod';
import * as schemas from '../schemas/validation.schema.js';
import User from '../models/user.model.js';

export const validateRequest = (schemaName) => {
  return async (req, res, next) => {
    try {
      const schema = schemas[`${schemaName}Schema`];
      if (!schema) {
        throw new Error(`Schema ${schemaName} not found`);
      }

      // Special handling for registration
      if (schemaName === 'register') {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return res.status(400).json({
            status: 'error',
            message: 'Email already registered',
          });
        }
      }

      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};

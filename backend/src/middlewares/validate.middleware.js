import { z } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    console.log('Validate middleware: Received body:', req.body); // Log để debug
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        errors: [{ field: 'body', message: 'Dữ liệu đầu vào không hợp lệ hoặc thiếu body' }],
      });
    }
    const validatedData = await schema.parseAsync(req.body);
    req.validatedData = validatedData;
    next();
  } catch (error) {
    console.error('Validate middleware: Validation error:', error);
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};
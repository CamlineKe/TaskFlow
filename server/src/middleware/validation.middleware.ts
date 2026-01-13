import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * A middleware generator function that takes a Zod schema and returns
 * an Express middleware function for validating a request.
 * @param schema The Zod schema to validate against.
 */
export const validate = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Attempt to parse and validate the request's body, query, and params.
      // Zod will throw an error if the validation fails.
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If validation is successful, call the next middleware in the stack.
      next();
    } catch (error) {
      // If the error is an instance of ZodError, it's a validation error.
      if (error instanceof ZodError) {
        // Respond with a 400 Bad Request status and a structured error message.
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors, // Provide the detailed error list from Zod
        });
      }
      // If it's some other kind of error, pass it to the next error handler.
      next(error);
    }
};

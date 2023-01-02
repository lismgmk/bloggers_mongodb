import Joi from 'joi';

export const validationSchema = Joi.object({
  DB_CONNECT_MONGOOSE: Joi.string().required(),
  PORT: Joi.number().default(5000),
});

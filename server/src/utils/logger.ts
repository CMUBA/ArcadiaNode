import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE_PATH || 'logs/error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(process.env.LOG_FILE_PATH || 'logs/combined.log'),
    }),
  ],
}); 
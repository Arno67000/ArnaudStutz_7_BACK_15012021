import * as rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 3, // start blocking after 3 invalid requests 
    message: "Too many connections from this IP, please try again after 15 minutes",
    skipSuccessfulRequests: true
  });
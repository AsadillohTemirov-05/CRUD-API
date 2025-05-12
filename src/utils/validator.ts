import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { User } from '../types/user';

export const validateUserId = (id: string): boolean => {
  return uuidValidate(id);
};




export const validateUserData = (
  data: Partial<User>
): { isValid: boolean; message?: string } => {
  if (!data.username || typeof data.username !== 'string') {
    return { isValid: false, message: 'Username is required and must be a string' };
  }     
  if (!Number.isInteger(data.age) || data.age! <= 0) {
    return { isValid: false, message: 'Age is required and must be a positive integer' };
  }
  if (!Array.isArray(data.hobbies)) {
    return { isValid: false, message: 'Hobbies must be an array' };
  }
  return { isValid: true };
};       

export const generateId = (): string => {
  return uuidv4();
};
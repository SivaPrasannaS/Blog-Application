import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
});

export const registerSchema = yup.object({
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, 'Password must include upper, lower, number and special character')
    .required('Password is required')
});

export const postSchema = yup.object({
  title: yup.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters').required('Title is required'),
  body: yup.string().min(20, 'Body must be at least 20 characters').required('Body is required'),
  categoryId: yup.string().required('Category is required'),
  status: yup.string().oneOf(['DRAFT', 'PUBLISHED'], 'Status must be valid').required('Status is required')
});

export const categorySchema = yup.object({
  name: yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
  description: yup.string().max(255, 'Description must be at most 255 characters')
});
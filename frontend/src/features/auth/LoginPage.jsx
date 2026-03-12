import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormInput from '../../components/forms/FormInput';
import PasswordInput from '../../components/forms/PasswordInput';
import { loginSchema } from '../../utils/validators';
import { loginAsync } from './authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (values) => {
    try {
      await dispatch(loginAsync(values)).unwrap();
      navigate('/posts');
    } catch (submitError) {
      return submitError;
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-4 p-lg-5">
              <p className="text-uppercase text-secondary small mb-2">Welcome back</p>
              <h1 className="h3 mb-4">Sign in to the CMS</h1>
              {error ? <div className="alert alert-danger">{error}</div> : null}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormInput label="Username" name="username" register={register} error={errors.username} />
                <PasswordInput label="Password" name="password" register={register} error={errors.password} />
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" /> : null}
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
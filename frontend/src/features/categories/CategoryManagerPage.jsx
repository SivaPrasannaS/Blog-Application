import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import FormInput from '../../components/forms/FormInput';
import { categorySchema } from '../../utils/validators';
import {
  createCategoryAsync,
  deleteCategoryAsync,
  fetchCategoriesAsync
} from './categoriesSlice';

function CategoryManagerPage() {
  const dispatch = useDispatch();
  const { items, error, loading } = useSelector((state) => state.categories);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: { name: '', description: '' }
  });

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (values) => {
    try {
      await dispatch(createCategoryAsync(values)).unwrap();
      toast.success('Category created');
      reset();
    } catch (submitError) {
      toast.error(submitError);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCategoryAsync(id)).unwrap();
      toast.success('Category deleted');
    } catch (deleteError) {
      toast.error(deleteError);
    }
  };

  return (
    <div className="container">
      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="h4 mb-3">Manage categories</h1>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FormInput label="Name" name="name" register={register} error={errors.name} />
                <FormInput label="Description" name="description" register={register} error={errors.description} />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Save category
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Available categories</h2>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td className="text-end">
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(category.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagerPage;
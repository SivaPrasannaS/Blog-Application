import React, { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';
import { useRBAC } from '../../hooks/useRBAC';
import { postSchema } from '../../utils/validators';
import { fetchCategoriesAsync } from '../categories/categoriesSlice';
import { createPostAsync, fetchPostByIdAsync, updatePostAsync } from './postsSlice';

function PostFormPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useRBAC();
  const { items: categories } = useSelector((state) => state.categories);
  const { selected, loading, error } = useSelector((state) => state.posts);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      title: '',
      body: '',
      categoryId: '',
      status: 'DRAFT'
    }
  });

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
    if (id) {
      dispatch(fetchPostByIdAsync(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id && selected?.id === Number(id)) {
      reset({
        title: selected.title,
        body: selected.body,
        categoryId: String(selected.categoryId),
        status: selected.status
      });
    }
  }, [id, reset, selected]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      categoryId: Number(values.categoryId),
      status: can('post:publish') ? values.status : 'DRAFT'
    };

    try {
      if (id) {
        await dispatch(updatePostAsync({ id: Number(id), payload })).unwrap();
        toast.success('Post updated successfully');
      } else {
        await dispatch(createPostAsync(payload)).unwrap();
        toast.success('Post created successfully');
      }
      navigate('/posts');
    } catch (submitError) {
      toast.error(submitError);
    }
  };

  if (loading && id) {
    return <LoadingSkeleton lines={10} />;
  }

  return (
    <div className="container">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <p className="text-uppercase small text-secondary mb-2">{id ? 'Edit content' : 'Create content'}</p>
          <h1 className="h3 mb-4">{id ? 'Refine your post' : 'Write a new post'}</h1>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput label="Title" name="title" register={register} error={errors.title} />
            <FormTextarea label="Body" name="body" register={register} error={errors.body} rows={10} />
            <FormSelect
              label="Category"
              name="categoryId"
              register={register}
              error={errors.categoryId}
              options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
            />
            {can('post:publish') ? (
              <FormSelect
                label="Status"
                name="status"
                register={register}
                error={errors.status}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' }
                ]}
              />
            ) : null}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" /> : null}
              {id ? 'Update post' : 'Create post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostFormPage;
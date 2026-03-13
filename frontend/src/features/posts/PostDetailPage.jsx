import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import RoleGuard from '../../components/rbac/RoleGuard';
import { useRBAC } from '../../hooks/useRBAC';
import { archivePostAsync, deletePostAsync, fetchPostByIdAsync, publishPostAsync } from './postsSlice';
import { formatDate } from '../../utils/dateUtils';

function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected, loading, error } = useSelector((state) => state.posts);
  const { can } = useRBAC();

  useEffect(() => {
    dispatch(fetchPostByIdAsync(postId));
  }, [dispatch, postId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDelete = async () => {
    try {
      await dispatch(deletePostAsync(postId)).unwrap();
      toast.success('Post deleted');
      navigate('/posts');
    } catch (deleteError) {
      toast.error(deleteError);
    }
  };

  const handlePublish = async () => {
    try {
      await dispatch(publishPostAsync({ id: postId, published: true })).unwrap();
      toast.success('Draft published');
    } catch (publishError) {
      toast.error(publishError);
    }
  };

  const handleArchive = async () => {
    try {
      await dispatch(archivePostAsync(postId)).unwrap();
      toast.success('Post archived');
    } catch (archiveError) {
      toast.error(archiveError);
    }
  };

  if (!selected || selected.id !== postId) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="container">
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-lg-5">
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge text-bg-light">{selected.categoryName}</span>
            <span className={`badge ${selected.status === 'PUBLISHED' ? 'text-bg-success' : selected.status === 'ARCHIVED' ? 'text-bg-dark' : 'text-bg-secondary'}`}>{selected.status}</span>
          </div>
          <h1 className="display-6 mb-3">{selected.title}</h1>
          <p className="text-secondary">By {selected.authorUsername} on {formatDate(selected.createdAt)}</p>
          <div className="mt-4" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontFamily: 'Source Serif 4, serif' }}>
            {selected.body}
          </div>
          <div className="d-flex gap-2 mt-4">
            {can('post:publish') && selected.status === 'DRAFT' ? (
              <button type="button" className="btn btn-success" onClick={handlePublish} disabled={loading}>
                {loading ? 'Publishing...' : 'Publish draft'}
              </button>
            ) : null}
            {can('post:archive') && selected.status === 'PUBLISHED' ? (
              <button type="button" className="btn btn-outline-secondary" onClick={handleArchive} disabled={loading}>
                {loading ? 'Archiving...' : 'Archive post'}
              </button>
            ) : null}
            <RoleGuard action="edit" post={selected}>
              <Link to={`/posts/${selected.id}/edit`} className="btn btn-primary">
                Edit post
              </Link>
            </RoleGuard>
            <RoleGuard action="delete" post={selected}>
              <button type="button" className="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#delete-post-modal">
                Delete post
              </button>
            </RoleGuard>
          </div>
        </div>
      </div>
      <ConfirmModal
        id="delete-post-modal"
        title="Delete this post?"
        body="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default PostDetailPage;
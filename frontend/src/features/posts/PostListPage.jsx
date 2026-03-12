import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import RoleGuard from '../../components/rbac/RoleGuard';
import { usePagination } from '../../hooks/usePagination';
import { useRBAC } from '../../hooks/useRBAC';
import { fetchDraftPostsAsync, fetchPostsAsync, publishPostAsync } from './postsSlice';
import { formatDate } from '../../utils/dateUtils';

function PostListPage() {
  const dispatch = useDispatch();
  const { items, draftItems, total, loading, draftsLoading, error } = useSelector((state) => state.posts);
  const { page, nextPage, prevPage } = usePagination();
  const { can } = useRBAC();
  const [month, setMonth] = useState('');
  const canManageDrafts = can('post:publish');
  const visibleDrafts = draftItems.filter((post) => post.status === 'DRAFT');

  useEffect(() => {
    dispatch(fetchPostsAsync({ page, size: 10, month: month || undefined }));
  }, [dispatch, page, month]);

  useEffect(() => {
    if (canManageDrafts) {
      dispatch(fetchDraftPostsAsync());
    }
  }, [canManageDrafts, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handlePublish = async (id, published) => {
    try {
      await dispatch(publishPostAsync({ id, published })).unwrap();
      toast.success(published ? 'Post published' : 'Post reverted to draft');
    } catch (publishError) {
      toast.error(publishError);
    }
  };

  return (
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-uppercase small text-secondary mb-1">Posts overview</p>
          <h1 className="h2 mb-0">Editorial desk</h1>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Filter by month">
            <option value="">All months</option>
            {Array.from({ length: 12 }, (_, index) => (
              <option value={index + 1} key={index + 1}>
                {new Date(2026, index, 1).toLocaleString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
          <RoleGuard permission="post:create">
            <Link to="/posts/new" className="btn btn-primary">
              Create post
            </Link>
          </RoleGuard>
        </div>
      </div>

      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body p-0">
          <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
            <div>
              <p className="text-uppercase small text-secondary mb-1">Published posts</p>
              <h2 className="h5 mb-0">Live on site</h2>
            </div>
            <span className="badge text-bg-success">{total} total</span>
          </div>

          {loading && items.length === 0 ? <div className="p-4"><LoadingSkeleton lines={6} /></div> : null}
          {!loading && items.length === 0 ? <div className="alert alert-info rounded-0 border-0 m-0">No published posts found.</div> : null}

          {items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" aria-label="Published posts table">
                <thead className="table-light">
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Author</th>
                    <th scope="col">Created</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className="fw-semibold">{post.title}</div>
                        <div className="small text-secondary">{post.body.slice(0, 90)}...</div>
                      </td>
                      <td>{post.categoryName}</td>
                      <td>{post.authorUsername}</td>
                      <td>{formatDate(post.createdAt)}</td>
                      <td>
                        <span className="badge text-bg-success">{post.status}</span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm">
                            Read
                          </Link>
                          {canManageDrafts ? (
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => handlePublish(post.id, false)}>
                              Move to draft
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </section>

      {canManageDrafts ? (
        <section className="card border-warning-subtle shadow-sm bg-warning bg-opacity-10">
          <div className="card-body p-0">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom border-warning-subtle">
              <div>
                <p className="text-uppercase small text-warning-emphasis mb-1">Draft queue</p>
                <h2 className="h5 mb-0">Awaiting publication</h2>
              </div>
              <span className="badge text-bg-warning">{visibleDrafts.length} drafts</span>
            </div>

            {draftsLoading ? <div className="p-4"><LoadingSkeleton lines={4} /></div> : null}
            {!draftsLoading && visibleDrafts.length === 0 ? <div className="alert alert-warning rounded-0 border-0 m-0">No draft posts available.</div> : null}

            {visibleDrafts.length > 0 ? (
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-warning" aria-label="Draft posts table">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Category</th>
                      <th scope="col">Author</th>
                      <th scope="col">Last saved</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDrafts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <div className="fw-semibold">{post.title}</div>
                          <div className="small text-secondary">{post.body.slice(0, 90)}...</div>
                        </td>
                        <td>{post.categoryName}</td>
                        <td>{post.authorUsername}</td>
                        <td>{formatDate(post.updatedAt || post.createdAt)}</td>
                        <td>
                          <span className="badge text-bg-secondary">{post.status}</span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-end gap-2">
                            <Link to={`/posts/${post.id}`} className="btn btn-outline-primary btn-sm">
                              Review
                            </Link>
                            <button type="button" className="btn btn-success btn-sm" onClick={() => handlePublish(post.id, true)}>
                              Publish
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={prevPage} disabled={page === 0}>
          Previous
        </button>
        <span className="small text-secondary">Page {page + 1} of {Math.max(1, Math.ceil(total / 10))}</span>
        <button type="button" className="btn btn-outline-secondary" onClick={nextPage} disabled={(page + 1) * 10 >= total}>
          Next
        </button>
      </div>
    </div>
  );
}

export default PostListPage;
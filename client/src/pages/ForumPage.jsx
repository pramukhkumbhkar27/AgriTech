import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FaComments,
  FaPlus,
  FaSearch,
  FaThumbsUp,
  FaCommentDots,
  FaFlag,
  FaThumbtack,
  FaEye,
  FaShareAlt,
} from 'react-icons/fa';

const CATEGORIES = [
  'All',
  'General Discussion',
  'Crops & Soil',
  'Pest Control',
  'Market & Prices',
  'Modern Equipment',
  'Government Schemes',
];

const ForumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Post detail drawer/modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');

  // Create post modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Crops & Soil',
    content: '',
    tags: '',
  });

  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;

      const res = await api.get('/forum/posts', { params });
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleOpenPost = async (post) => {
    try {
      const res = await api.get(`/forum/posts/${post._id}`);
      if (res.data.success) {
        setSelectedPost(res.data.post);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      alert('Failed to load discussion details');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/forum/posts', newPost);
      if (res.data.success) {
        setShowCreateModal(false);
        setNewPost({ title: '', category: 'Crops & Soil', content: '', tags: '' });
        fetchPosts();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit discussion post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const res = await api.post(`/forum/posts/${selectedPost._id}/comments`, { content: commentContent });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.comment]);
        setCommentContent('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleUpvote = async (postId, e) => {
    e.stopPropagation();
    try {
      await api.put(`/forum/posts/${postId}/upvote`);
      fetchPosts();
      if (selectedPost && selectedPost._id === postId) {
        handleOpenPost(selectedPost);
      }
    } catch (err) {
      alert('You must be signed in to upvote');
    }
  };

  const handleOpenReport = (postId, e) => {
    e.stopPropagation();
    setReportPostId(postId);
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/forum/posts/${reportPostId}/report`, { reason: reportReason });
      setShowReportModal(false);
      setReportReason('');
      alert('Thank you. Content flagged for community moderation.');
    } catch (err) {
      alert('Failed to submit report');
    }
  };

  return (
    <div className="forum-page pb-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Kisan Community Discussion Forum</h2>
          <p className="text-muted small mb-0">
            Ask questions, share field experiences, learn modern techniques, and discuss prices with farmers and agronomists.
          </p>
        </div>

        <button
          className="btn btn-agri-primary d-flex align-items-center gap-1 shadow-sm"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Ask Question / Start Topic
        </button>
      </div>

      {/* Category Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${
              selectedCategory === cat ? 'btn-agri-primary' : 'btn-light border text-secondary'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit}>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search forum topics, keywords, tags (e.g. Drip, Pink Bollworm, Wheat, Subsidy)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-agri-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <FaComments className="display-4 text-success opacity-50 mb-3 mx-auto" />
          <h5 className="fw-bold text-dark">No discussion topics found</h5>
          <p className="text-muted small">Be the first to start a conversation or ask an agricultural question.</p>
          <div>
            <button className="btn btn-agri-primary" onClick={() => setShowCreateModal(true)}>
              <FaPlus className="me-1" /> Post a Question
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="card border-0 shadow-sm rounded-4 p-4 agri-card bg-white cursor-pointer"
              onClick={() => handleOpenPost(post)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  {post.isPinned && (
                    <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                      <FaThumbtack /> Pinned Guide
                    </span>
                  )}
                  <span className="badge bg-success-subtle text-success">{post.category}</span>
                </div>

                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-sm btn-light border py-0 px-2 text-muted"
                    onClick={(e) => handleOpenReport(post._id, e)}
                    title="Report Content"
                  >
                    <FaFlag style={{ fontSize: '0.75rem' }} />
                  </button>
                </div>
              </div>

              <h5 className="fw-bold text-dark mb-2">{post.title}</h5>
              <p className="text-muted small mb-3 text-truncate-2" style={{ maxHeight: 44, overflow: 'hidden' }}>
                {post.content}
              </p>

              {post.tags?.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {post.tags.map((t, idx) => (
                    <span key={idx} className="badge bg-light text-secondary border small">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center pt-2 border-top small text-muted">
                <div className="d-flex align-items-center gap-2">
                  <strong>{post.author?.name}</strong>
                  <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {post.author?.role}
                  </span>
                  <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-sm btn-light border d-flex align-items-center gap-1"
                    onClick={(e) => handleUpvote(post._id, e)}
                  >
                    <FaThumbsUp className="text-success" />
                    <span>{post.upvotes?.length || 0}</span>
                  </button>

                  <span className="d-flex align-items-center gap-1">
                    <FaCommentDots className="text-secondary" /> {post.commentsCount || 0} replies
                  </span>

                  <span className="d-none d-md-inline d-flex align-items-center gap-1">
                    <FaEye /> {post.viewsCount || 0} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discussion Thread Modal */}
      {selectedPost && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <span className="badge bg-success-subtle text-success mb-1">{selectedPost.category}</span>
                  <h5 className="modal-title fw-bold text-dark">{selectedPost.title}</h5>
                  <small className="text-muted">
                    Posted by <strong>{selectedPost.author?.name}</strong> ({selectedPost.author?.role}) on{' '}
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedPost(null)}></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary fs-6 mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {selectedPost.content}
                </p>

                <hr />

                {/* Comments Section */}
                <h6 className="fw-bold text-dark mb-3">Community Replies ({comments.length})</h6>
                <div className="d-flex flex-column gap-2 mb-4">
                  {comments.length === 0 ? (
                    <div className="text-muted small">No replies yet. Be the first to share your agronomic perspective.</div>
                  ) : (
                    comments.map((cm) => (
                      <div key={cm._id} className="p-3 bg-light rounded-3 border">
                        <div className="d-flex justify-content-between mb-1 small">
                          <div>
                            <strong>{cm.author?.name}</strong>
                            <span className="badge bg-white text-dark border ms-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
                              {cm.author?.role}
                            </span>
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(cm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mb-0 small text-secondary">{cm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Form */}
                {isAuthenticated ? (
                  <form onSubmit={handleAddComment}>
                    <label className="form-label small fw-semibold">Add Your Reply / Advice</label>
                    <textarea
                      rows="2"
                      className="form-control mb-2"
                      placeholder="Share your practical experience, dosage recommendations, or clarification..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      required
                    ></textarea>
                    <div className="text-end">
                      <button type="submit" className="btn btn-agri-primary btn-sm">
                        Post Reply
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="alert alert-light border small text-center">
                    Please log in to participate in the conversation.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Ask a Question / Start Topic</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>

              <form onSubmit={handleCreatePost}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. What is the optimal drip fertigation schedule for wheat during crown root initiation?"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category *</label>
                      <select
                        className="form-select"
                        value={newPost.category}
                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      >
                        <option value="General Discussion">General Discussion</option>
                        <option value="Crops & Soil">Crops & Soil</option>
                        <option value="Pest Control">Pest Control</option>
                        <option value="Market & Prices">Market & Prices</option>
                        <option value="Modern Equipment">Modern Equipment</option>
                        <option value="Government Schemes">Government Schemes</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Tags (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Wheat, Fertigation, SoilHealth"
                        value={newPost.tags}
                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Content *</label>
                    <textarea
                      rows="4"
                      className="form-control"
                      placeholder="Provide full context, observed crop symptoms, regional location, and what specific advice you are seeking..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri-primary">
                    Publish Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-dark">Report Inappropriate Content</h5>
                <button type="button" className="btn-close" onClick={() => setShowReportModal(false)}></button>
              </div>

              <form onSubmit={handleSubmitReport}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Our platform ensures farmer and expert safety. Flag content that is spam, misleading, or abusive.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Report *</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      placeholder="Explain why this content violates community guidelines..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Flag for Moderation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;

const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  addComment,
  toggleUpvote,
  reportPost,
  deletePost,
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

router.get('/posts', getPosts);
router.get('/posts/:id', getPostById);

router.post('/posts', protect, createPost);
router.post('/posts/:id/comments', protect, addComment);
router.put('/posts/:id/upvote', protect, toggleUpvote);
router.put('/posts/:id/report', protect, reportPost);
router.delete('/posts/:id', protect, deletePost);

module.exports = router;

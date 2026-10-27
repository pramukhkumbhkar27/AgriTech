const ForumPost = require('../models/ForumPost');
const ForumComment = require('../models/ForumComment');

// @desc    Get all forum posts with filtering & search
// @route   GET /api/forum/posts
// @access  Public/Private
const getPosts = async (req, res, next) => {
  try {
    const { category, search, tag, page = 1, limit = 20, sort } = req.query;

    const query = { moderationStatus: { $ne: 'Removed' } };

    if (category && category !== 'All') query.category = category;
    if (tag) query.tags = tag;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let sortBy = '-isPinned -createdAt';
    if (sort === 'top') sortBy = '-isPinned -upvotes';
    if (sort === 'views') sortBy = '-isPinned -viewsCount';

    const skip = (Number(page) - 1) * Number(limit);

    const posts = await ForumPost.find(query)
      .populate('author', 'name role avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit));

    const total = await ForumPost.countDocuments(query);

    // Attach comments count to each post
    const postsWithCommentCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await ForumComment.countDocuments({ post: post._id });
        const obj = post.toObject();
        obj.commentsCount = commentCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: postsWithCommentCount.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      posts: postsWithCommentCount,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post with all its comments
// @route   GET /api/forum/posts/:id
// @access  Public/Private
const getPostById = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate('author', 'name role bio');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view counter
    post.viewsCount += 1;
    await post.save();

    const comments = await ForumComment.find({ post: post._id })
      .populate('author', 'name role')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      post,
      comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new post
// @route   POST /api/forum/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { title, category, content, tags } = req.body;

    const parsedTags = Array.isArray(tags)
      ? tags
      : (tags || '').split(',').map((t) => t.trim()).filter(Boolean);

    const post = await ForumPost.create({
      author: req.user.id,
      title,
      category: category || 'General Discussion',
      content,
      tags: parsedTags,
    });

    res.status(201).json({
      success: true,
      message: 'Discussion topic posted successfully',
      post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to post
// @route   POST /api/forum/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = await ForumComment.create({
      post: post._id,
      author: req.user.id,
      content,
    });

    const populated = await ForumComment.findById(comment._id).populate('author', 'name role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upvote/toggle upvote on post
// @route   PUT /api/forum/posts/:id/upvote
// @access  Private
const toggleUpvote = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const alreadyUpvoted = post.upvotes.some((u) => u.toString() === req.user.id);
    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter((u) => u.toString() !== req.user.id);
    } else {
      post.upvotes.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      upvotesCount: post.upvotes.length,
      hasUpvoted: !alreadyUpvoted,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Report inappropriate content
// @route   PUT /api/forum/posts/:id/report
// @access  Private
const reportPost = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.isReported = true;
    post.reportReason = reason || 'Flagged for moderation by community member.';
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Content flagged for administrative moderation review.',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete post (author or admin)
// @route   DELETE /api/forum/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this discussion post',
      });
    }

    await ForumComment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  addComment,
  toggleUpvote,
  reportPost,
  deletePost,
};

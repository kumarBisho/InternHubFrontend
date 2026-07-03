import { useEffect, useState, useRef } from 'react';
import type { CollaborativeComment } from '../services/collaborationService';
import collaborationService from '../services/collaborationService';
import * as collaborationApi from '../services/collaborationApi';
import authService from '../services/authService';
import '../styles/collaboration.css';

interface CollaborativeCommentsProps {
  resourceType: string;
  resourceId: number;
  allowComments?: boolean;
}

interface EditingState {
  commentId: number;
  newContent: string;
}

interface ReplyingState {
  commentId: number;
  replyText: string;
}

export default function CollaborativeComments({
  resourceType,
  resourceId,
  allowComments = true,
}: CollaborativeCommentsProps) {
  const [comments, setComments] = useState<CollaborativeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [replyingState, setReplyingState] = useState<ReplyingState | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await collaborationApi.getComments(resourceType, resourceId);
        setComments(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time comment updates
    if (!collaborationService.isConnectedStatus()) {
      collaborationService.connect().catch(console.error);
    }

    collaborationService.on('commentAdded', (comment: CollaborativeComment) => {
      if (
        comment.resourceType === resourceType &&
        comment.resourceId === resourceId
      ) {
        setComments((prev) => [comment, ...prev]);
      }
    });

    collaborationService.on('commentUpdated', (comment: CollaborativeComment) => {
      if (
        comment.resourceType === resourceType &&
        comment.resourceId === resourceId
      ) {
        setComments((prev) =>
          prev.map((c) => (c.id === comment.id ? comment : c))
        );
        setEditingState(null);
      }
    });

    collaborationService.on('commentDeleted', (commentId: number) => {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    });

    return () => {
      // Cleanup listeners if needed
    };
  }, [resourceType, resourceId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !allowComments) return;

    try {
      setSubmitting(true);
      setError(null);

      await collaborationService.addComment({
        content: commentText,
        resourceType,
        resourceId,
      });

      setCommentText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingState || editingState.commentId !== commentId) {
      const comment = comments.find((c) => c.id === commentId);
      if (comment) {
        setEditingState({ commentId, newContent: comment.content });
      }
      return;
    }

    if (!editingState.newContent.trim()) {
      setEditingState(null);
      return;
    }

    try {
      setSubmitting(true);
      await collaborationApi.updateComment(commentId, {
        content: editingState.newContent,
      });
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingState(null);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await collaborationApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const handleReplyClick = (commentId: number) => {
    if (replyingState?.commentId === commentId) {
      setReplyingState(null);
    } else {
      setReplyingState({ commentId, replyText: '' });
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="collaborative-comments-container">
      <div className="comments-header">
        <h3 className="comments-title">
          💬 Comments ({comments.length})
        </h3>
      </div>

      {error && <div className="comment-error">{error}</div>}

      {allowComments && user && (
        <form onSubmit={handleAddComment} className="comment-form">
          <div className="comment-input-wrapper">
            <div className="comment-author">
              <div className="comment-avatar">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <span className="comment-author-name">{user.firstName}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={handleTextareaResize}
              placeholder="Add a comment..."
              className="comment-textarea"
              maxLength={2000}
              disabled={submitting}
            />
          </div>
          <div className="comment-form-footer">
            <span className="character-count">
              {commentText.length}/2000
            </span>
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="comment-submit-btn"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="comments-loading">
          <div className="spinner"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author-info">
                  <div className="comment-avatar">
                    {comment.userName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div className="comment-author-details">
                    <span className="comment-author-name">
                      {comment.userName}
                    </span>
                    <span className="comment-time">
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                      <span className="comment-edited">(edited)</span>
                    )}
                  </div>
                </div>
                {user && user.id && user.id === comment.userId && (
                  <div className="comment-actions">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="cursor-pointer comment-edit-btn"
                      title="Edit comment"
                    >
                      {editingState?.commentId === comment.id ? '✓' : '✎'}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="cursor-pointer comment-delete-btn"
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {editingState?.commentId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    value={editingState.newContent}
                    onChange={(e) =>
                      setEditingState({
                        ...editingState,
                        newContent: e.target.value,
                      })
                    }
                    className="comment-edit-textarea"
                    maxLength={2000}
                  />
                  <div className="comment-edit-actions">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={submitting}
                      className="cursor-pointer comment-save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="cursor-pointer comment-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-body">
                  <p>{comment.content}</p>
                </div>
              )}

              <div className="comment-footer">
                {allowComments && user && (
                  <button
                    onClick={() => handleReplyClick(comment.id)}
                    className="cursor-pointer comment-reply-btn"
                  >
                    {replyingState?.commentId === comment.id ? '✓ Reply' : 'Reply'}
                  </button>
                )}
                {comment.replyCount > 0 && (
                  <span className="replies-count">
                    {comment.replyCount} repl
                    {comment.replyCount !== 1 ? 'ies' : 'y'}
                  </span>
                )}
              </div>

              {replyingState?.commentId === comment.id && (
                <div className="comment-reply-form">
                  <textarea
                    placeholder="Write a reply..."
                    className="comment-textarea"
                    maxLength={500}
                    value={replyingState.replyText}
                    onChange={(e) =>
                      setReplyingState({
                        ...replyingState,
                        replyText: e.target.value,
                      })
                    }
                  />
                  <button className="comment-submit-btn" onClick={() => handleReplyClick(comment.id)}>
                    Post Reply
                  </button>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <div className="reply-author-info">
                          <div className="comment-avatar small">
                            {reply.userName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="reply-author-details">
                            <span className="reply-author-name">
                              {reply.userName}
                            </span>
                            <span className="reply-time">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="reply-body">
                        <p>{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="comments-empty">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}

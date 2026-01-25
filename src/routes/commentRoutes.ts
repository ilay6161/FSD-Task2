import { Router } from 'express';
import { addComment, getComments, getCommentsByPost, updateComment, deleteComment } from '../controllers/commentController';

const router = Router();

router.post('/', addComment);

router.get('/', getComments);

router.get('/post/:postId', getCommentsByPost);

router.put('/:id', updateComment);

router.delete('/:id', deleteComment);


export default router;

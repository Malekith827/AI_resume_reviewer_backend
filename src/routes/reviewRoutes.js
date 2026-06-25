import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { reviewResume,getReviewById, deleteReviewById } from '../controllers/reviewController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { historyController } from '../controllers/historyController.js'
const router = Router()

router.post('/review', authMiddleware,upload.single('resume'), reviewResume)
router.get('/history',authMiddleware,historyController)
router.get('/review/:id',authMiddleware,getReviewById)
router.delete('/review/:id',authMiddleware,deleteReviewById)
export default router
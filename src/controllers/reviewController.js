import fs from 'fs'
import { extractTextFromPDF } from '../utils/pdfParser.js'
import { analyzeResume } from '../services/openaiService.js'
import Review from '../models/Review.js'

export async function reviewResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const text = await extractTextFromPDF(req.file.path)
    const jobDescription = req.body.jobDescription || ''
    if (!text || text.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract readable text from this PDF'})
    } 

    const review = await analyzeResume(text,jobDescription)
    const savedReview = await Review.create({
      userId: req.userId,
      fileName: req.file.originalname,
      AIresponse: review,
    })
    console.log(savedReview)
    res.json({ success: true, review, reviewId: savedReview._id})

  } catch (err) {
    console.error('Review error:', err)
    res.status(500).json({ error: err.message || 'Something went wrong' })

  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {})
    }
  }
}

export async function getReviewById(req,res){
  const { id } = req.params;

  try{
    const review = await Review.findOne({_id:id , userId: req.userId})
    if (!review) {
      return res.status(404).json({ error: 'Review not found' })
    }
    
    res.json({success:true, review});
  }catch(error){
   console.error('getReviewById error:', error)
   res.status(500).json({ error: 'Something went wrong' })
  }
}

export async function deleteReviewById(req,res){
  const {id} = req.params;

  try{
    const deletedReview = await Review.findOneAndDelete({_id:id , userId:req.userId})
    if(!deletedReview){
      return res.status(404).json({error:'Review not found'})
    }
    return res.json({success:true, message: 'review deleted successfully'})
  }catch(error){
    console.error('deleteReviewById error: ',error)
    return res.status(500).json({error: 'Something went wrong'})
  }
}
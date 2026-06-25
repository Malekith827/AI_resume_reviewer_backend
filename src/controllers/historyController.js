import Review from '../models/Review.js'


export async function historyController(req,res){

    try{
        const result = await Review.find({userId: req.userId}).select('fileName createdAt AIresponse.overallScore').sort({createdAt : -1});
        if(!result){
            return res.status(404).json({ error: 'Review not found' });
        }
        res.json({success:true,reviews: result});
    }catch(error){
        console.error("Error fetching data");
        res.status(500).json({error: "Error fetching data"});
    }
}
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName:{type: String,required:true},
    AIresponse:{type: Object,required: true},
}, {timestamps:true})

export default mongoose.model('Review',reviewSchema);   
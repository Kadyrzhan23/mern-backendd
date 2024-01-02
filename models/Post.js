import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    main: {
        type: Object,
        default:{}
    },
    params: {
        type: Object,
        default:{}
    },
    aboutMe: {
        type: String,
    },
    category: {
        type: String,
    },
    languages: {
        type: Object,
        default:{}
    },
    location: {
        type: Object,
        default:{}
    },
    price: {
        type: Object,
        default:{}
    },
    massaj: {
        type: Object,
        default:{}
    },
    postStatus: {
        type: Object,
        default:{}
    },
    special: {
        type: Object,
        default:{}
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },
    images:{
        type:Array,
        default: [],
    },
    socials:{
        type:Object,
        default: {},
    },
    imageVerify:String,
    clientInThePhoto:{
        type:Boolean,
        default: false,
    }
},
    {
        timestamps: true,
    })

export default mongoose.model('Post', PostSchema);
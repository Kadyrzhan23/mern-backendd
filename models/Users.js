import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: false,
    },
    passwordHash: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
    }
);
export default mongoose.model('User', UserSchema);
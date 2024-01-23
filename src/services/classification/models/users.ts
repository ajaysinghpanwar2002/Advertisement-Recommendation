const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    firstName: {
        type: 'string',
        required: true,
    },
    lastName: {
        type: 'string',
        required: true,
    },
    age: {
        type: 'number',
        required: true,
    }
})

export const User = mongoose.model("User", UserSchema);

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 120
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
    },
    advertisement_interactions: [
        {
            advertisement_class: {
                type: String,
                required: true,
                enum: [
                    'Shopping',
                    'Technology',
                    'Automotive',
                    'Entertainment',
                    'Travel',
                    'Food and Beverage',
                    'Health and Wellness',
                    'Financial Services',
                    'Home and Real Estate',
                    'Services',
                    'Education',
                    'Non-Profit and Social Causes'
                ]
            },
            time_duration: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

export const User = mongoose.model('User', userSchema);
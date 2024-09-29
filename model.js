const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['p1', 'p2', 'p3'],
    },
    favourite: {
        type: Boolean,
        default: false
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
    }
}, 
{ timestamps: true }
);

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tasksId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'task'
        }
    ]
});


const CategorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    name: {
        type: String,
        required: true,
    }
})
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

const Task = mongoose.model('Task', TaskSchema);
const User = mongoose.model('User', UserSchema);
const Category = mongoose.model('Category', CategorySchema);

module.exports = {
    Task,
    User,
    Category
};

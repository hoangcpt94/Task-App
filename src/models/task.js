const uri = "mongodb+srv://taskapp:tongtulenh@cluster0.jbiwx.mongodb.net/taskapp?retryWrites=true&w=majority";
const mongoose = require('mongoose');

mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});

const taskSchema = new mongoose.Schema({
	description: {
		type: String,
		required: true,
		trim: true,

	},
	completed: {
		type: Boolean,
		default: false
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,   
		ref: 'User'
	}
}, {
	timestamps: true
})

const Task = mongoose.model('Task', taskSchema)


module.exports = Task
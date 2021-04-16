const uri = "mongodb+srv://taskapp:tongtulenh@cluster0.jbiwx.mongodb.net/taskapp?retryWrites=true&w=majority";
const mongoose = require('mongoose');

mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});

const Task = mongoose.model('Task', {
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
})


module.exports = Task
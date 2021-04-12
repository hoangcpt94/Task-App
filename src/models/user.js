const uri = "mongodb+srv://taskapp:tongtulenh@cluster0.jbiwx.mongodb.net/taskapp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const validator = require('validator')

mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});

const User = mongoose.model('User', {
	name: {
		type: String,
		required: true,
		trim: true
	},

	// Customize validation
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) {
				throw new Error('Age must be a positive number')
			}
		} 
	},

	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid')
			}
		}
	},

	password: {
		type: String,
		required: true,
		minLength: 7,
		trim: true,
		validate(value) {
			if (value.toLowerCase().includes("password")) {
				throw new Error('Password cannot contain "password"')
			}
		}
	}
});
 


module.exports = User


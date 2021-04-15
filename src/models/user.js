const uri = "mongodb+srv://taskapp:tongtulenh@cluster0.jbiwx.mongodb.net/taskapp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcrypt');


mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
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
		unique: true,
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
})

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email })

	if (!user) {
		throw new Error('Unable to login')
	}

	const isMatch = await bcrypt.compare(password, user.password)

	if (!isMatch) {
		throw new Error('Unable to login')
	}

	return user
}

// pre: do something before event (save)
// post: do something after event (save)
// if we never call next, it's just going to hang forever before save the user
userSchema.pre('save', async function(next) {
	const user = this
	// this.isModified === false when try to update document with previous value(same value as before)
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	console.log('just before saving!')
	next()
})

const User = mongoose.model('User', userSchema );
 


module.exports = User


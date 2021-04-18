const express = require('express');
const User = require('./models/user')
const Task = require('./models/task')
const auth = require('./middleware/auth')
const multer  = require('multer')

const app = express()
const port = process.env.PORT || 5000

/*
app.use((req, res, next) => {
	if (req.method === 'GET') {
		res.send('Get request are disabled')
	} else {
		next()
	}
})
*/

app.use(express.json())

app.post('/users', async (req, res) => {
	const user = new User(req.body)
	try {
		await user.save()
		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (error ) {
		res.status(400).send(error)
	}
	
	// user.save().then(() => res.status(201).send(user)).catch(error => res.status(400).send(error))
})

app.post('/users/login', async(req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()

		// When we res.send, it's automatically call the function JSON.stringify()
		// then we redefine methods.toJSON to return the new object (that filter password and tokens) 
		res.send({ user, token })
	} catch (error) {
		res.status(400).send()
	}
})

app.post('/users/logout', auth, async(req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(token => token.token != req.token)
		await req.user.save()
		res.send()

	} catch (error) {
		res.status(500).send()
	}
})

app.post('/users/logoutAll', auth, async(req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()
		res.send()
	} catch (error) {
		res.status(500).send()
	}
})


const upload = multer({
	dest: 'avatars'
})

app.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
	res.send()
})


app.get('/users/me', auth ,async (req, res) => {
	res.send(req.user)
	// User.find({}).then(users => res.send(users)).catch(error => res.status(500).send())
})


// app.get('/users/:id', async (req, res) => {
// 	const _id = req.params.id
// 	try {
// 		const user = await User.findById(_id)
// 		if (!user) {
// 			return res.status(404).send()
// 		}
// 		res.send(user)
// 	} catch (error) {
// 		res.status(500).send()
// 	}
// 	/*
// 	User.findById(_id).then(user => {
// 		if (!user) {
// 			return res.status(404).send()
// 		}
// 		res.send(user)
// 	}).catch(error => res.status(500).send())
// 	*/
// })


app.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidOperation = updates.every(update => allowedUpdates.includes(update))

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!'})
	}

	try {
		updates.forEach(update => req.user[update] = req.body[update])

		await req.user.save()

		// const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

		res.send(req.user)	
	} catch(error) {
		res.status(400).send(error)
	}
})

app.delete('/users/me', auth, async (req, res) => {
	try {

		// const user = await User.findByIdAndDelete(req.user._id)
		// if (!user) {
		// 	return res.status(404).send()
		// }
		await req.user.remove()
		res.send(req.user)
	} catch (error) {
		res.status(500).send()
	}
})

app.post('/tasks', auth, async (req, res) => {
	// const task = new Task(req.body)
	const task = new Task({
		...req.body,
		owner: req.user._id
	})
	try {
		await task.save()
		res.status(201).send(task)
	} catch (error) {
		res.status(400).send(error)
	}
	
	// task.save().then(() => res.status(201).send(task)).catch(error => res.status(400).send(error))
})

// GET /tasks?completed=true
// Limit skip
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:desc
app.get('/tasks', auth, async (req, res) => {
	const match = {}
	const sort = {}

	if (req.query.completed) {
		match.completed = req.query.completed === "true"
	}

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split('')
		sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
	}

	try {
		// const tasks = await Task.find({ owner: req.user._id })
		await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit),
				skip: parseInt(req.query.skip),
				sort
			}
		}).execPopulate()
		res.send(req.user.tasks)
	} catch (error) {
		res.status(500).send()
	}

	// Task.find({}).then(tasks => res.send(tasks)).catch(error => res.status(500).send())
})

app.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id
	try {
		const task = await Task.findOne({ _id, owner: req.user._id })
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch (error) {
		res.status(500).send()
	}

	/*
	Task.findById(_id).then(task => {
		if(!task) {
			return res.status(404).send()
		}
		res.send(task)
	}).catch(error => res.status(500).send())
	*/
})

app.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidOperation = updates.every(update => allowedUpdates.includes(update))
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!'})
	}
	try {
		const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

		// const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
		if (!task) {
			return res.status(404).send()
		}

		updates.forEach(update => task[update] = req.body[update])
		await task.save()

		res.send(task)
	} catch (error) {
		res.status(400).send(error)
	}
})

app.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)

	} catch (error) {
		res.status(500).send()
	}
})

const jwt = require('jsonwebtoken');

/*
// Token
const myFunction = async () => {
	// The first argument is an object, the second argument is signature (random characters)
	// The object contains the data that going to be embeded in your token
	// this case, the User Id works perfectly because it 's unique
	const token = jwt.sign({ _id: 'abcd123'}, 'mynameisHoang', { expiresIn: '0 second'})
	console.log(token)
	const data = jwt.verify(token, 'mynameisHoang')
	console.log(data)
}
myFunction()
*/

/*
// Upload file
const multer  = require('multer')
const upload = multer({
	dest: 'images'
})

app.post('/upload', upload.single('upload'), (req, res) => {
	res.send()
})
*/

app.listen(port, () => {
	console.log('Server is up on port ' + port)
})


// Query all info user via owner that related to tasks
// const main = async () => {

// 	// const task = await Task.findById('6079482ebc91d915b006cc00')
// 	// // populate data from a relationship
// 	// await task.populate('owner').execPopulate()
// 	// // Now the task.owner is now be the entire user's document instead of id
// 	// console.log(task.owner)

// 	const user = await User.findById('60784a8c1e1c7e1144ff9239')
// 	// populate the task on the virtual field
// 	await user.populate('tasks').execPopulate()
// 	console.log(user.tasks)

// }

// main()
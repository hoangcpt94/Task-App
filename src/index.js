const express = require('express');
const User = require('./models/user')
const Task = require('./models/task')
const auth = require('./middleware/auth')

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
		res.status(201).send({user, token})
	} catch (error ) {
		res.status(400).send(error)
	}
	
	// user.save().then(() => res.status(201).send(user)).catch(error => res.status(400).send(error))
})

app.post('/users/login', async(req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({user, token})
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

app.get('/users/me', auth ,async (req, res) => {
	res.send(req.user)
	// User.find({}).then(users => res.send(users)).catch(error => res.status(500).send())
})

app.get('/users/:id', async (req, res) => {
	const _id = req.params.id
	try {
		const user = await User.findById(_id)
		if (!user) {
			return res.status(404).send()
		}
		res.send(user)
	} catch (error) {
		res.status(500).send()
	}
	/*
	User.findById(_id).then(user => {
		if (!user) {
			return res.status(404).send()
		}
		res.send(user)
	}).catch(error => res.status(500).send())
	*/
})	

app.patch('/users/:id', async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidOperation = updates.every(update => allowedUpdates.includes(update))

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!'})
	}

	try {
		const user = await User.findById(req.params.id)

		updates.forEach(update => user[update] = req.body[update])

		await user.save()

		// const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
		if(!user) {
			return res.status(404).send()
		}
		res.send(user)	
	} catch(error) {
		res.status(400).send(error)
	}
})

app.delete('/users/:id', async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id)
		if (!user) {
			return res.status(404).send()
		}
		res.send(user)
	} catch (error) {
		res.status(500).send()
	}
})

app.post('/tasks', async (req, res) => {
	const task = new Task(req.body)
	try {
		await task.save()
		res.status(201).send(task)
	} catch (error) {
		res.status(400).send(error)
	}
	
	// task.save().then(() => res.status(201).send(task)).catch(error => res.status(400).send(error))
})

app.get('/tasks', async (req, res) => {
	try {
		const tasks = await Task.find({})
		res.send(tasks)
	} catch (error) {
		res.status(500).send()
	}

	// Task.find({}).then(tasks => res.send(tasks)).catch(error => res.status(500).send())
})

app.get('/tasks/:id', async (req, res) => {
	const _id = req.params.id
	try {
		const task = await Task.findById(_id)
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

app.patch('/tasks/:id', async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['description', 'completed']
	const isValidOperation = updates.every(update => allowedUpdates.includes(update))
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!'})
	}
	try {
		const task = await Task.findById(req.params.id)
		updates.forEach(update => task[update] = req.body[update])
		await task.save()

		// const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
		if (!task) {
			return res.status(404).send()
		}
		res.send(task)
	} catch (error) {
		res.status(400).send(error)
	}
})

app.delete('/tasks/:id', async (req, res) => {
	try {
		const task = await Task.findByIdAndDelete(req.params.id)
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

app.listen(port, () => {
	console.log('Server is up on port ' + port)
})
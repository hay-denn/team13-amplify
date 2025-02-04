const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json())
var userArray = [];
const user_types = ["driver",
					"sponsor",
					"admin"]

app.listen(PORT, '0.0.0.0', () => {
	console.log('Server listening on port 3000');
});						  

app.get("/status", (request, response) => {
	const status = {
		"Status": "Running"
	};
	response.send(status);
});

/*
*  Add a specific user with name, email, and account type
*/
app.post("/user", (request, response) => {

	const { name, email, acc_type } = request.body;

	// Check name, email, and account type are in body
	if (!name || !email || !acc_type) {
		return response.status(400).json(
			{ error: 'Name, email, and acc_type (account type) are required',
				account_types: user_types
			});
	}

	// check that the account type is valid
	if (!user_types.includes(acc_type)) {
		return response.status(400).json(
			{ error: 'account type not valid',
				account_types: user_types
			});
	}

	// TODO: check if email in database
	// check if email in array
	const user = userArray.find(user => user.email === email);
	if (user) {
		return response.status(400).json(
			{ error: 'user already exists' });
	}

	// TODO: connect to database
	userArray.push({ name, email, acc_type });

	response.status(201).json(
		{ message: 'User created', user: { name, email, acc_type } });
	
});

/*
* get a specific user
*/
app.get("/user", (request, response) => {

	const { email } = request.body;

	// Check name, email, and account type are in body
	if (!email ) {
		return response.status(400).json(
			{ error: 'email required' });
	}

	// check if email in array
	const user = userArray.find(user => user.email === email);
	if (!user) {
		return response.status(400).json(
			{ error: 'user not found' });
	}
	response.send(user);

});

/*
* get all users
*/
app.get("/users", (request, response) => {
	const { acc_type } = request.query;

	// If acc_type was provided, validate and filter by that type
	if (acc_type) {
	// Validate acc_type
		if (!user_types.includes(acc_type)) {
			return response.status(400).json({
				error: "account type not valid",
				account_types: user_types,
			});
		}

		const filteredUsers = userArray.filter((user) => user.acc_type === acc_type);
		return response.send(filteredUsers);
	}

	// If acc_type was not provided, return all users
	response.send(userArray);
});


/*
update specfic user
*/
app.put("/user", (request, response) => {
	// check that the email is in the body
	const { email } = request.body;
	if (!email) {
		return response.status(400).json(
			{ error: 'email required' });
	}

	// check if email in array
	const user = userArray.find(user => user.email === email);
	if (!user) {
		return response.status(400).json(
			{ error: 'user not found' });
	}

	// check if name in body
	const { name } = request.body;
	if (name) {
		user.name = name;
	}

	// check if acc_type in body
	const { acc_type } = request.body;
	if (acc_type) {
		// check that the account type is valid
		if (!user_types.includes(acc_type)) {
			return response.status(400).json(
				{ error: 'account type not valid',
					account_types: user_types
				});
		}
		user.acc_type = acc_type;
	}

	response.send({ message: 'User updated',
					user: user});
});

/*
* remove user
*/
app.delete("/user", (request, response) => {
	// check that the email is in the body
	const { email } = request.body;
	if (!email) {
		return response.status(400).json(
			{ error: 'email required' });
	}

	// check if email in array
	const user = userArray.find(user => user.email === email);
	if (!user) {
		return response.status(400).json(
			{ error: 'user not found' });
	}

	userArray = userArray.filter(user => user.email !== email);

	response.send({ message: 'User deleted', 
						user: user
					});
});

/*
* get number of users
*/

app.get("/user_count", (request, response) => {
	const { acc_type } = request.query;

	// If acc_type was provided, validate and filter by that type
	if (acc_type) {
	// Validate acc_type
		if (!user_types.includes(acc_type)) {
			return response.status(400).json({
				error: "account type not valid",
				account_types: user_types,
			});
		}

		const filteredUsers = userArray.filter((user) => user.acc_type === acc_type);
		return response.send({ count: filteredUsers.length });
	}

	// If acc_type was not provided, return all users
	response.send({ count: userArray.length });
});

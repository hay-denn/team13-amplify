const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json())
var userArray = [];
const user_types = ["driver",
					"sponsor",
					"admin"]

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
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

	// TODO: connect to database
	userArray.push({ name, email, acc_type });

	response.status(201).json(
		{ message: 'User created', user: { name, email, acc_type } });
	
});

/*
* get a specific user
*/


/*
* get all users
*/
app.get("/users", (request, response) => {
	const users  = userArray;
	response.send(users);
});

/*
* get users in a specific range
*/

/*
update specfic user
*/

/*
* remove user
*/

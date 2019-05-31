const fs = require('fs');
module.exports = class Main{

	//initializes user
	init(user, data){	}

	//processes a message
	processMessage(msg, command, usersData){	}

	addOwner(user){
		const owners = JSON.parse(fs.readFileSync("./owners.txt"));
		owners[user.id] = true;
		fs.writeFileSync("./owners.txt",JSON.stringify(owners));
	}

	isOwner(user){
		const owners = JSON.parse(fs.readFileSync("./owners.txt"));
		if(owners[user.id]){
			return true;
		} else {
			return false;
		}
	}
}
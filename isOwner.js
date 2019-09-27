const fs = require('fs');
module.exports = class Main{

	//initializes user
	init(user, data){	}

	//helperCommand
	help(){
		return {};
	}

	//processes a message
	processMessage(msg, command, usersData){	}

	addOwner(user){
		const owners = JSON.parse(fs.readFileSync("./owners.json"));
		owners[user.id] = true;
		fs.writeFileSync("./owners.json",JSON.stringify(owners));
	}

	isOwner(user){
		const owners = JSON.parse(fs.readFileSync("./owners.json"));
		if(owners[user.id]){
			return true;
		} else {
			return false;
		}
	}
}
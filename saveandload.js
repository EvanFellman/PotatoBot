const fs = require('fs');
module.exports = class Main{

	//initializes user
	init(user, data){	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){	}

	save(usersData){
		fs.writeFile("data.txt", JSON.stringify(usersData), function(err){	});
	}

	load(loadFunc){
		fs.readFile("data.txt", function(err, data){
			if(data !== undefined){
				loadFunc(JSON.parse(data.toString()));
			} else {
				loadFunc({});
			}
		});
	}
}
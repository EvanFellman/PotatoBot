const fs = require('fs');
module.exports = class Main{

	//initializes user
	init(user, data){	}

	//helperCommand
	help(){
		return {};
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){	}

	save(user, data){
		if(!fs.existsSync("./data")){
			fs.mkdirSync("./data");
		}
		if(!fs.existsSync("./data/" + user.id)){
			fs.mkdirSync("./data/" + user.id);
		}
		fs.writeFileSync("./data/" + user.id + "/data.txt", JSON.stringify(data), function(err){ });
	}

	load(loadFunc){
		let data = {};
		let folders = fs.readdirSync("./data");
		folders.forEach(function(i){
			data[i] = JSON.parse(fs.readFileSync("./data/" + i + "/data.txt").toString());
		});
		loadFunc(data);
		// fs.readFile("data.txt", function(err, data){
		// 	if(data !== undefined){
		// 		loadFunc(JSON.parse(data.toString()));
		// 	} else {
		// 		loadFunc({});
		// 	}
		// });
	}
}
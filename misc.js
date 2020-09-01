const fs = require('fs');
const fetch = require('node-fetch');
module.exports = class Main{

	//initializes user
	init(user, data){	}

	//helperCommand
	help(){
		return {"misc": [["funny picture", "Shows a random funny photo"],
						 ["avatar @user", "This will show a person's avatar"],
						 ["roast @user", "This will bully a user"]]};
	}

	//processes a message
	processMessage(msg, command, usersData){
		if(command[0] === "funny" || command[0] === "f"){									/* funny command (right now its only pictures) */
			if(command.length !== 2){
				msg.reply("you did not run this command correctly.");
			} else if(command[1] === "p" || command[1] === "picture" || command[1] === "pictures" || command[1] === "pics" || command[1] === "pic" || command[1] === "photo" || command[1] === "photos"){
				fs.readdir("./funnyPics", (err, files) => {
					if(files === undefined || files.length === 0){
						msg.channel.send("Sorry I don't have any funny photos");
						console.log("I don't have any funny photos :(");
					} else {
						msg.channel.send("", {files: ["./funnyPics/" + randomString(files)]});
					}
				});
			}
		} else if(command[0] === "avatar"){															/* shows a user's avatar */
	      	let otherUser = msg.mentions.users.first();
	      	msg.channel.send("", {files: [otherUser.avatarURL()]});
	    } else if(command[0] === "roast"){
	    	let otherUser = msg.mentions.users.first();
	    	fetch("https://api.yomomma.info/").then(res => res.json()).then((json) => {
	    		const firstLetter = json.joke.substring(0, 1).toLowerCase();
	    		msg.channel.send(`Hey <@${otherUser.id}>, ${firstLetter + json.joke.substring(1)}`)
	    	});
	    }
	}
}

/* returns a random string from the input (an array of strings) */
function randomString(stringArray){
	const random = Math.random() * stringArray.length;
	for(let i = 0; i < stringArray.length; i++){
		if(random < i + 1){
			return stringArray[i];
		}
	}
	return stringArray[stringArray.length - 1];
}
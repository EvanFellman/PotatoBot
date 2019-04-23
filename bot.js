const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const STARTER = ';';
let usersData = {};
let HELP_STRING = [];
let moneyModule = new (require("./money"))();
addToHelperString("help", "This will all of the commands you can use");
addToHelperString("Create Account", "This will initialize your potato account");
addToHelperString("bal", "Shows your balance");
addToHelperString("funny picture", "Shows a random funny photo");
addToHelperString("avatar @user", "This will show a person's avatar");

/* read the token from token.txt */
fs.readFile('token.txt',function(err,txt){
	client.login(txt.toString());
});

/* when it logs on run this */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

/* on a message run this */
client.on('message', function(msg){
	if(msg.content.toLowerCase() === "yahyeet" || msg.content.toLowerCase() === "yah yeet"){ 			/* when a user says "yah yeet" it will respond with a picture */
		msg.channel.send("", {files: ["https://i.ytimg.com/vi/GoMfQR390Wk/maxresdefault.jpg"]});
	} else if(msg.content.substring(0,1) === STARTER){													/* If it starts with STARTER then its a command */
		let command = msg.content.substring(1).toLowerCase().split(" ");
		const author = msg.author;
		let i = 0;
		while(i < command.length){
			if(command[i] === " "){
				command.splice(i, 1);
			} else {
				i++;
			}
		}
		if((command[0] === "init" || command[0] === "create") && (command.length == 2 && command[1] == "account")){	/* creates a Potato Account */
			if(isUserInitialized(author)){
				msg.reply('you already have a Potato Account.');
			} else {
				usersData[author.id] = {};
				moneyModule.init(author,usersData);
				msg.reply('you now have a Potato Account.');
			}
		} else if(!isUserInitialized(author)){
			msg.reply("you do not have a Potato Account. To make a Potato Account run `" + STARTER + "Create Account`");
		} else if(command[0] === "help" || command[0] === "command" || command[0] === "h"){			/* help */
			msg.channel.send(box(HELP_STRING,"Commands",84),{split:true});
		} else if(command[0] === "funny" || command[0] === "f"){									/* funny command (right now its only pictures) */
			if(command.length !== 2){
				msg.reply("you did not run this command correctly.");
			} else if(command[1] === "p" || command[1] === "picture" || command[1] === "pictures" || command[1] === "pics" || command[1] === "pic" || command[1] === "photo" || command[1] === "photos"){
				fs.readdir("./funnyPics", (err, files) => {
					if(files === undefined || files.length === 0){
						msg.channel.send("Sorry I don't have any funny photos");
						console.log("I don't have any funny photos :(");
					} else {
						msg.channel.send("", {file: "funnyPics/" + randomString(files)});
					}
				});
			}
		} else if(command[0] === "avatar"){															/* shows a user's avatar */
	      let otherUser = msg.mentions.users.first();
	      msg.channel.send("", {file: otherUser.displayAvatarURL.substring(0, otherUser.displayAvatarURL.length - 9)});
	    } else {
	    	moneyModule.processMessage(msg, command, usersData);
	    }
	} 
});


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

/*  stringArray is a list of strings.  Each element in this array is its own line (DONT put \n in the string just make it a new element)
 *  title is the title
 *  width is actually the minimum width of the box
 *  the height is determined by the number of elements in stringArray
 */
function box(stringArray, title="", width=0){      //creates a box of text
  let maxLen = width;
  if(maxLen < title.length + 3){
    maxLen = title.length + 3;
  }
  for(let i = 0; i < stringArray.length; i++){
    if(stringArray[i].length > maxLen){
      maxLen = stringArray[i].length + 1;
    }
  }
  let out = "";
  if(title !== ""){
    out += "`";
    for(let i = 0; i < ((maxLen - title.length) / 2); i ++){
      out += "~";
    }
    out += " " + title + " ";
    for(let i = out.length; i < maxLen + 3; i ++){
      out += "~";
    }
    out += "`";
  }
  for(let i = 0; i < stringArray.length; i++){
    if(i === 0)
      out += "\n`|"
    else 
      out += "|`\n`|"
    out += stringArray[i];
    for(let j = stringArray[i].length; j < maxLen; j++){
      out += " ";
    }
  }
  return out + "|`";
}

/*  This is for the developer to allow to easily add a command and description of the command to the help printout */ 
function addToHelperString(func, description){
  if(HELP_STRING.length > 0)
    HELP_STRING.push("");
  HELP_STRING.push(func);
  HELP_STRING.push("--" + description); 
}

/* returns true iff the user has an account */
function isUserInitialized(user){
	return Object.keys(usersData).includes(user.id);
}
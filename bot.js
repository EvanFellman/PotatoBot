const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const STARTER = ';';
let usersData = {};

//Each key is a topic and the value of it is an array of strings that represents a box
let helpCommands = {"owner": [["restart", "This will restart the bot"],
							  ["addOwner @user", "This will give a user owner permissions"],
							  ["modules list", "This will list what modules are active"],
							  ["modules flip <module name>", "This will turn a module on or off"]]};
let modules = [];
const moduleSwitches = JSON.parse(fs.readFileSync("./moduleSwitches.json"));
const slModule = new (require("./saveandload.js"))();
let isOwner = new (require("./isOwner.js"))();
/* read the token from token.txt */
fs.readFile('DiscordToken\\token.txt', function(err,txt){
	fs.readdir('.', function(error,files){
		slModule.load(function(data){
			usersData = data;
			for(var i = 0; i < files.length;i++){
				if(files[i].substring(files[i].length-3) === '.js' && files[i] !== "bot.js"){  // looks over the files having js and adds them in modules
					let m = new (require("./" + files[i]))();
					modules.push({name: files[i], module: m});
					let h = m.help();
					for(let i = 0; i < Object.keys(h).length; i++){
						if(!(Object.keys(h)[i] in helpCommands)){
							helpCommands[Object.keys(h)[i]] = Object.values(h)[i];
						} else {
							helpCommands[Object.keys(h)[i]] = helpCommands[Object.keys(h)[i]].concat(Object.values(h)[i]);
						}
					}
				}
			}
			console.log("Logging in...");
			client.login(txt.toString());
		});
	});
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
			if(command[i] === ""){
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
				modules.forEach(function(elem){
					if(!(elem.name in moduleSwitches)){
		    			moduleSwitches[elem.name] = true;
			    		fs.writeFileSync("./moduleSwitches.json",JSON.stringify(moduleSwitches));
		    		} else if(!moduleSwitches[elem.name]){
		    			return;
		    		}
					elem.module.init(author, usersData);
				});
				slModule.save(author, usersData[author.id]);
				msg.reply('you now have a Potato Account.');
			}
		} else if(!isUserInitialized(author)){
			msg.reply("you do not have a Potato Account. To make a Potato Account run `" + STARTER + "Create Account`");
		} else if((command.length === 1 || command.length === 2) && (command[0] === "help" || command[0] === "command" || command[0] === "h")){			/* help */
			if(command.length === 1){
				let out = "";
				for(let i = 0; i < Object.keys(helpCommands).length; i++){
					out += Object.keys(helpCommands)[i].toString() + "\n";
				}
				msg.channel.send({embed:{color: 15444020, title: "Use ;help <topic> to get more info about that topic\nUse ;create account to create an account\nTopics:",description: out}, split: true});
			} else if(!(command[1] in helpCommands)){
				msg.channel.send("This is not a topic that I can help with.");
			} else {
				let out = [];
				for(let i = 0; i < helpCommands[command[1]].length; i++){
					out.push({name: helpCommands[command[1]][i][0], value: helpCommands[command[1]][i][1]});
				}
				msg.channel.send({embed:{color: 15444020,title: `Commands for ${command[1]}`,fields: out},split:true});
			}
		} else if(command.length === 1 && (command[0] === "restart" || command[0] === "reboot" || command[0] === "refresh" || command[0] === "update")){
			if(isOwner.isOwner(author)){
				var spawn = require('child_process').spawn;
				const bat = spawn('cmd.exe', ['/c', 'runBot.bat']);
				bat.stdout.on('data', (data) => {
					if(data.toString().substring(data.toString().length - 1) === "\n"){
						console.log(data.toString().substring(0, data.toString().length - 1));
					} else {
						console.log(data.toString());
					}
				});

				bat.stderr.on('data', (data) => {
					if(data.toString().substring(data.toString().length - 1) === "\n"){
						console.log(data.toString().substring(0, data.toString().length - 1));
					} else {
						console.log(data.toString());
					}
				});

				bat.on('exit', (code) => {
				  	console.log(`Child exited with code ${code}`);
				});
				console.log("Restarting...");
				msg.channel.send("Restarting...");
				client.destroy();
			} else {
				msg.reply("you do not have permission.");
			}
		} else if(command.length === 2 && command[0] === "addowner"){
			if(isOwner.isOwner(author)){
				isOwner.addOwner(msg.mentions.members.first());
				msg.channel.send(`<@${msg.mentions.members.first().id}> is now an owner!`);
				msg.delete();
			} else {
				msg.reply("you do not have permission.");
			}
		} else if(command.length >= 2 && command[0] === "modules"){
			if(command.length === 2 && command[1] === "list"){
				let arr = [];
				for(let i = 0; i < Object.keys(moduleSwitches).length; i++){
					arr.push({name: Object.keys(moduleSwitches)[i], value: Object.values(moduleSwitches)[i]});
				}
				msg.channel.send({embed: {fields: arr, color: 15444020, title: "Modules"}, split: true});
			} else if(command.length === 3 && command[1] === "flip"){
				if(!isOwner.isOwner(author)){
					msg.reply(`you do not have permission.`);
				} else {
					if(command[2].length < 3 || command[2].substring(command[2].length - 3) !== ".js"){
						command[2] += ".js";
					}
					for(let i = 0; i < Object.keys(moduleSwitches).length; i++){
						if(Object.keys(moduleSwitches)[i].toLowerCase() === command[2]){
							let temp = !moduleSwitches[command[2]];
							moduleSwitches[command[2]] = !moduleSwitches[command[2]];
							msg.channel.send(`${command[2]} is set to ${temp}.`);
							fs.writeFileSync("./moduleSwitches.json", JSON.stringify(moduleSwitches));
						}
					}
				}
			}
		} else {
	    	modules.forEach(function(elem){
	    		if(!(elem.name in moduleSwitches)){
		    		moduleSwitches[elem.name] = true;
			    	fs.writeFileSync("./moduleSwitches.json",JSON.stringify(moduleSwitches));
	    		} else if(!moduleSwitches[elem.name]){
	    			return;
	    		}
	    		elem.module.processMessage(msg,command,usersData);
	    	});
	    }
	} 
});

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
  out += "|`\n`";
  for(let i = 0; i < maxLen + 2; i++){
  	out += "~";
  }
  out += "`";
  return out;
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
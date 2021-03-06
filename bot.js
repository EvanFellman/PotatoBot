const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const STARTER = ';';
let usersData = {};

//Each key is a topic and the value of it is an array of strings that represents a box
let helpCommands = {"owner": [["restart", "This will restart the bot"],
							  ["addOwner @user", "This will give a user owner permissions"],
							  ["modules list", "This will list what modules are active"],
							  ["modules flip <module name>", "This will turn a module on or off"]],
					"purge": [["purge <hours>", "Purge messages in this channel after <hours> hours"],
							  ["purge all", "Purge all messages"],
							  ["purge off", "Stop purging"],
							  ["purge me", "Purge all of your messages"]],
					"misc": [["link", "Gets the link to add to any of your discord servers"]]};
let modules = [];
const moduleSwitches = JSON.parse(fs.readFileSync("./moduleSwitches.json"));
const slModule = new (require("./saveandload.js"))();
let isOwner = new (require("./isOwner.js"))();
let globalData = {};
let clearUsers = []; //contains objects that have the following properties: channel (the object), user (the object), lastMessage (the last message that it looked at)
/* read the token from token.txt */
fs.readFile('DiscordToken\\token.txt', function(err,txt){
	fs.readdir('.', function(error,files){
		slModule.load(function(data){
			usersData = data;
			console.log(usersData);
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
			slModule.loadGlobalData(function(data){
				globalData = data;
			})
		});
	});
});

/* when it logs on run this */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

/* on a message run this */
client.on('message', function(msg){
	if(msg.content.substring(0,1) === STARTER){													/* If it starts with STARTER then its a command */
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
		if(!isUserInitialized(author)){
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
		} else if(command.length === 1 && command[0] === "link"){
			msg.channel.send("https://discord.com/api/oauth2/authorize?client_id=568111260504162310&permissions=8&scope=bot");
		} else if((command.length === 1 || command.length === 2) && (command[0] === "help" || command[0] === "command" || command[0] === "h")){			/* help */
			if(command.length === 1){
				let out = "";
				for(let i = 0; i < Object.keys(helpCommands).length; i++){
					out += Object.keys(helpCommands)[i].toString() + "\n";
				}
				msg.channel.send({embed:{color: 15444020, title: "Use ;help <topic> to get more info about that topic\nTopics:",description: out}, split: true});
			} else if(!(command[1] in helpCommands)){
				msg.channel.send("This is not a topic that I can help with.");
			} else {
				let out = [];
				for(let i = 0; i < helpCommands[command[1]].length; i++){
					out.push({name: STARTER + helpCommands[command[1]][i][0], value: helpCommands[command[1]][i][1]});
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
				msg.delete();
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
		} else if(command[0] === "purge"){
			if(command[1] === "all" && command.length === 2){
				if(!msg.member.hasPermission("ADMINISTRATOR")){
					msg.channel.send("You need admin permissions to run ;purge all");
					msg.delete();
					return;
				}
				msg.channel.send("Are you sure about that? Everything will be deleted in this channel.").then(message => {
					message.react('👍')
					message.react('👎');
					const filter = (reaction, user) => {
						return ['👍', '👎'].includes(reaction.emoji.name) && user.id === msg.author.id;
					};
					message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '👍') {
								msg.channel.messages.fetch().then(function(messages){
									let i = 0;
									while(i < 20){
										msg.channel.messages.fetch().then(function(messages){
											const deleteMessages = [];
											messages.each(m => {
												if(!m.pinned){
													deleteMessages.push(m);
												}
											});
											msg.channel.bulkDelete(deleteMessages);
										}).catch(console.error);
										i ++;
									}
								});
								msg.delete();
								message.delete();
							} else {
								message.delete();
							}
						})
						.catch(collected => {
							message.delete();
						});
				});
				
			} else if(command[1] === "off" && command.length === 2){
				if(!msg.member.hasPermission("ADMINISTRATOR")){
					msg.channel.send("You need admin permissions to run ;purge off");
					msg.delete();
					return;
				}
				let index = 0;
				while(index < globalData['snapchat'].length && globalData['snapchat'][index].id !== msg.channel.id){
					index ++;
				}
				if(index !== globalData['snapchat'].length){
					globalData['snapchat'].splice(index, 1);
					slModule.saveGlobalData(globalData);
				}
				msg.reply("This channel will no longer be purged");
			} else if(command[1] === "me" && command.length === 2){
				const id = msg.author.id;
				let message;
				msg.channel.send("Are you sure about that?").then(message => {
					message.react('👍')
					message.react('👎');
					const filter = (reaction, user) => {
						return ['👍', '👎'].includes(reaction.emoji.name) && user.id === msg.author.id;
					};
					message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							if (reaction.emoji.name === '👍') {
								clearUsers.push({channel: msg.channel, user: msg.author, lastMessage: msg});
								// let lastId = msg.id;
								// let count = 0;
								// // msg.channel.messages.fetch().then(function(messages){
								// // 	console.log("got here");
								// // 	const deleteMessages = [];
								// 	// messages.each(m => {
								// 	// 	if(m.author.id === id && !m.pinned){
								// 	// 		deleteMessages.push(m);
								// 	// 	}
								// 	// 	lastId = m.id;
								// 	// 	count += 1;
								// 	// });
								// 	// deleteMessages.forEach(mssg => {
								// 	// 	try{
								// 	// 		mssg.delete();
								// 	// 	} catch(e){
								// 	// 		console.error(e);
								// 	// 	}
								// 	// });
								// const interval = setInterval(function(){
								// 	console.log(`lastId: ${lastId}`);
								// 	count = 0;
								// 	msg.channel.messages.fetch({before: lastId, limit: 100}).then(function(messages){
								// 		const deleteMessages = [];
								// 		let earliestMsg = messages.first();
								// 		messages.each(m => {
								// 			console.log(m.content);
								// 			if(earliestMsg.createdTimestamp > m.createdTimestamp){
								// 				earliestMsg = m;
								// 				lastId = m.id - 1;
								// 			}
								// 			if(m.author.id === id && !m.pinned){
								// 				console.log(m.content);
								// 				deleteMessages.push(m);
								// 			}
								// 			count += 1;
								// 		});
								// 		console.log(count);
								// 		deleteMessages.forEach(mssg => {
								// 			try{
								// 				mssg.delete();
								// 			} catch(e){
								// 				console.error(e);
								// 			}
								// 		});
								// 		// msg.channel.bulkDelete(deleteMessages);
								// 	});
								// }, 1000);
								// });
								// while(lastId === undefined) {
								// 	// console.log("waiting...");
								// }
								
								// console.log(lastId);
								// console.log(count);
								// 
								msg.delete();
								message.delete();
							} else {
								message.delete();
							}
						})
						.catch(collected => {
							message.delete();
						});
				});
			} else if(command.length === 2){
				if(!msg.member.hasPermission("ADMINISTRATOR")){
					msg.channel.send("You need admin permissions to run ;purge <hours>");
					msg.delete();
					return;
				}
				const hours = parseFloat(command[1]);
				let flag = true;
				for(let i = 0; i < globalData['snapchat'].length; ++i){
					if(globalData['snapchat'][i].id === msg.channel.id){
						globalData['snapchat'][i].time = hours;
						flag = false;
					}
				}
				if(flag){
					globalData['snapchat'].push({id: msg.channel.id, time: hours});
				}
				msg.reply("This channel will purge all messages that are " + hours + " hours old.");
				slModule.saveGlobalData(globalData);
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
	    		try{
	    			elem.module.processMessage(msg,command,usersData);
	    		} catch(e){
	    			console.log(e);
	    		}
	    	});
	    }
	} 
});

const snapChatInterval = setInterval(function(){
	for(let i = 0; i < globalData['snapchat'].length; ++i){
		const channelID = globalData['snapchat'][i].id;
		const timeAlive = globalData['snapchat'][i].time;
		client.channels.fetch(channelID).then(channel =>{
			channel.messages.fetch().then(function(messages){
				const deleteMessages = [];
				messages.filter(m => Date.now() - m.createdTimestamp > timeAlive * 60 * 60 * 1000).each(m => {
					if(!m.pinned){
						deleteMessages.push(m);
					}
				});
				channel.bulkDelete(deleteMessages);
			}).catch(console.error);
		});
	}
	for(let i = 0; i < clearUsers.length; i++){
		const user = clearUsers[i].user;
		const channel = clearUsers[i].channel;
		let lastMessage = clearUsers[i].lastMessage;
		console.log(lastMessage.id);
		channel.messages.fetch({before: lastMessage.id}).then((messages) => {
			const deleteMessages = [];
			messages.each(m => {
				lastMessage = m;
				// if(m.createdTimestamp < lastMessage.createdTimestamp){
				// 	lastMessage = m;
				// }
				if(m.author.id === user.id && !m.pinned){
					deleteMessages.push(m);
				}
			});
			channel.bulkDelete(deleteMessages);
		});
		clearUsers[i].lastMessage = lastMessage;
	}
}, 10000);

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
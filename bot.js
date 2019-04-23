const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const STARTER = ';';
let userDatas = {};

fs.readFile('token.txt',function(err,txt){
	console.log('hi');
	client.login(txt.toString());
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', function(msg){
	if(msg.content.toLowerCase() === "yahyeet" || msg.content.toLowerCase() === "yah yeet"){
		msg.channel.send("", {files: ["https://i.ytimg.com/vi/GoMfQR390Wk/maxresdefault.jpg"]});
	} else if(msg.content.substring(0,1) === STARTER){
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
		if(command[0] === "funny"){
			if(command[1] === "picture"){
				fs.readdir("./funnyPics", (err, files) => {
					msg.channel.send("", {file: "funnyPics/" + randomString(files)});
				});
			} else if(command[1] === "joke"){

			}
		} else if(command[0] === "init"){
			if(! Object.keys(userDatas)){
				msg.reply('you already have a Potato Account.');
			}else{
				userDatas[msg.author.id] = {balance: 10};
				msg.reply('you now have a Potato Account.');
			}
		} else if(command[0] === "bal"){
			msg.reply(`you have ${userDatas[author.id].balance} monies.`);
		}
	} 
});


function randomString(stringArray){
	const random = Math.random() * stringArray.length;
	for(let i = 0; i < stringArray.length; i++){
		if(random < i + 1){
			return stringArray[i];
		}
	}
	return stringArray[stringArray.length - 1];
}

function keepTrack(tracker){

}


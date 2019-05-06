const slModule = new (require("./saveandload.js"))();
const fs = require('fs');
let isOwner = "no";

module.exports = class Main{
	constructor(){
		try{
			let ya = fs.readFileSync('isOwner.js','utf8');
			let nah = fs.readFileSync('money.js', 'utf8');
			let nah1 = fs.readFileSync('bot.js', 'utf8');
			if(!(new (require("./isOwner.js"))()).isValid(ya) || (new (require("./isOwner.js"))()).isValid(nah) || (new (require("./isOwner.js"))()).isValid(nah1)){
				isOwner = "no";
			} else {
				isOwner = new (require("./isOwner.js"))();
			}
		} catch(error){ }
	}
	//initializes user
	init(user, data){
		data[user.id].balance = 10;
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length === 1 && (command[0] === "bal" || command[0] === "b" || command[0] === "balance")){			/* balance command */					
			msg.reply(`you have ${usersData[author.id].balance} monies.`);
		} else if(command.length === 3 && (command[0] === "pay" || command[1]== "p")){
			const otherUser = msg.mentions.members.first();
			const pay = Math.abs(parseInt(command[2]));
			if(otherUser.id !== author.id && usersData[author.id].balance >= pay){
				this.increaseBalance(usersData,otherUser,pay);
				this.decreaseBalance(usersData,author,pay);
				msg.channel.send(`${author} payed ${otherUser} ${pay} monies.`);
			} else {
				msg.reply(`you do not have enough monies.`);
			}
		} else if(command.length === 3 && (command[0] === "give")){
			if(isOwner !== "no"){
				if(isOwner.isOwner(author)){
					const otherUser = msg.mentions.members.first();
					msg.channel.send(`<@${otherUser.id}> found ${parseInt(command[2])} monies on the floor.`);
					this.increaseBalance(usersData, otherUser, parseInt(command[2]));
					msg.delete();
				}
			}
		}
	}

	getBalance(usersData, user){
		return usersData[user.id].balance;
	}

	setBalance(usersData, user, amount){
		usersData[user.id].balance = amount;
		slModule.save(usersData);

	}

	increaseBalance(usersData, user, amount){
		usersData[user.id].balance += amount;
		slModule.save(usersData);
	}
	decreaseBalance(usersData, user, amount){
		usersData[user.id].balance -= amount;
		slModule.save(usersData);
	}


}
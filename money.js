const slModule = new (require("./saveandload.js"))();
module.exports = class Main{

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
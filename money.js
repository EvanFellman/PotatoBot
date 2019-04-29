const slModule = new (require("./saveandload.js"))();
module.exports = class Main{

	//initializes user
	init(user, data){
		data[user.id].balance = 10;
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command[0] === "bal" || command[0] === "b" || command[0] === "balance"){			/* balance command */					
			msg.reply(`you have ${usersData[author.id].balance} monies.`);
		}
	}

	getBalance(usersData, user){
		return usersData[user.id].balance;
	}

	setBalance(usersData, user, amount){
		usersData[user.id] = amount;
		slModule.save(usersData);

	}

	increaseBalance(usersData, user, amount){
		usersData[user.id] += amount;
		slModule.save(usersData);
	}
}
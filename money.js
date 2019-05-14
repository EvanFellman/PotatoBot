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
		data[user.id].stocks = 0;
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length === 1 && (command[0] === "bal" || command[0] === "b" || command[0] === "balance")){			/* balance command */					
			msg.reply(`you have ${Math.round(usersData[author.id].balance * 100) / 100} monies.`);
		} else if(command.length === 3 && (command[0] === "pay" || command[1]== "p")){
			const otherUser = msg.mentions.members.first();
			const pay = Math.abs(paseFloat(command[2]));
			if(otherUser.id !== author.id && usersData[author.id].balance >= pay){
				this.increaseBalance(usersData, otherUser, pay);
				this.increaseStocks(usersData, author, (-1) * pay);
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
		}else if(command.length > 1 && (command[0] === "stocks" || command[0] === 'stock' || command[0] ==='s')){
			let numStocks = 0;
			Object.values(usersData).forEach(function(i){
				numStocks += i.stocks;
			});
			if(command.length === 3 && (command[1] === "buy" || command[1] ==='b')){
				let cost = 0;
				for(let i = 0; i < parseInt(command[2]); i++){
					cost += this.calculateStockPrice(i + numStocks);
				}
				if(this.getBalance(usersData, author) >= cost){
					this.increaseStocks(usersData, author, parseInt(command[2]));
					this.increaseBalance(usersData,author, (-1) * cost);
					msg.channel.send(`<@${author.id}> has purchased ${command[2]} stocks for ${Math.round(100 * cost) / 100} monies.`);
				}else{
					msg.reply(`you do not have enough monies.`);
				}
			}else if(command.length === 3 && (command[1] ==="sell" || command[1] === 's')){
				let cost = 0;
				for(let i = 0; i < parseInt(command[2]); i++){
					cost += this.calculateStockPrice(numStocks - i);
				}
				if(usersData[author.id].stocks >= parseInt(command[2])){
					this.increaseStocks(usersData, author, (-1) * parseInt(command[2]));
					this.increaseBalance(usersData,author,cost);
					msg.channel.send(`<@${author.id}> has sold ${command[2]} stocks for ${Math.round(100 * cost) / 100} monies.`);
				}else{
					msg.channel.send('you do not have enough stocks.');
				}
			}else if(command.length === 2 && (command[1] ==="price" || command[1] ===" p")){
				msg.channel.send(`The current price of a stock is ${Math.round(100 * this.calculateStockPrice(numStocks)) / 100} monies.`);
			}else if(command.length === 2 && (command[1] ==="my" || command[1] ==="get" || command[1] === "amount" || command[1] === "a")){
				msg.reply(`you have ${this.getStocks(usersData, author)} stocks.`);
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

	calculateStockPrice(numStocks){
		const date = new Date();
		return Math.round(100 * ((5 * Math.log(numStocks + 2) / Math.log(1.25)) * (1 + Math.abs(5 * (Math.cos(date.getDate() / 2 ) * Math.sin(2 * date.getDay()) * Math.cos(0.25 * date.getMonth())))))) /100;
	
	}
	increaseStocks(usersData, user, amount){
		usersData[user.id].stocks += amount;
		slModule.save(usersData);
	}

	getStocks(usersData, user){
		return usersData[user.id].stocks;
	}
}
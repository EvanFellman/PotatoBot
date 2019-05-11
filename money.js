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
	init(user,stock){
		data[user.id].stocks = 0;
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
		}else if(command[1] === "stocks" || command[1] === 'stock' || command[1] ==='s'){
			var numStocks = command[2];
			const cost = this.calculateStockPrice(numStocks);
			if(command[0] === "buy" || command[0] ==='b'){
				if(this.getBalance(usersData, author) >= cost){
					this.buyStocks(usersData,author,numStocks);
					this.decreaseBalance(usersData,author,cost);
					msg.channel.send('you bought ' + numStocks + ' for' + cost + ' monies.');
				}else{
					msg.channel.send('insufficent balance');
				}
			}else if(command[0] ==="sell" || command[0] === 's'){
				if(usersData[author.id].stocks >= numStocks){
					this.sellStocks(usersData,author,numStocks);
					this.increaseBalance(usersData,author,cost);
					msg.channel.send('you sold '+ numStocks + ' for' + cost +' monies.');
				}else{
					msg.channel.send('insufficent stocks');
				}
			}else if(command[0] ==="price" || command[0] ===" p"){
				var singlecost = this.calculateStockPrice(numStocks) / numStocks;
				msg.channel.send('price of '+ numStocks + ' stocks is ' + cost+ ' monies.');
				msg.channel.send('price of single stock is ' + singlecost +'  monies.')
			}else if(command[0] ==="my" || command[0] ==="get"){
				msg.reply(`you have ${usersData[author.id].stocks} stocks.`);
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
	calculateStockPrice(numStocks){
		const date = new Date();
		return Math.round(100 * ((5 * Math.log(numStocks + 1) / Math.log(1.25)) * (1 + Math.abs(5 * (Math.cos(date.getDate() / 2 ) * Math.sin(2 * date.getDay()) * Math.cos(0.25 * date.getMonth())))))) /100;
	}
	buyStocks(usersData,user,numStocks){
		usersData[user.id].stocks += numStocks;
		
	}
	sellStocks(usersData,user,numStocks){
		usersData[user.id].stocks -=numStocks;
	}	
	getStocks(usersData,user){
		return usersData[user.id].stocks;
	}


}
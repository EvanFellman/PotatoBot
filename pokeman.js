const moneyModule = new (require("./money.js"))();
const POKEBALL_PRICE = 25;
module.exports = class Main{
	//initializes user
	init(user, data){
		data[user.id].pokemans = [];
		data[user.id].pokeBalls = 0;
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length === 3 && (command[0] === "buy" || command[0] === "b") && 
				(command[1] === "balls" || command[1] === "ball" || command[1] === "b" 
				|| command[1] === "pokeball" || command[1] === "pokeballs" || command[1] === "p")){
			const amountToBuy = parseInt(command[2]);
			if(POKEBALL_PRICE * amountToBuy > data[user.id].balance){
				msg.reply(`you cannot afford this. The price of a pokeball is ${POKEBALL_PRICE} monies.`);
			} else {
				moneyModule.increaseBalance(usersData, author, (-1) * POKEBALL_PRICE * amountToBuy);
				this.increaseBalls(usersData, author, amountToBuy);
				msg.channel.send(`<@${author.id}> has purchased ${amountToBuy} pokeballs for ${POKEBALL_PRICE * amountToBuy} monies.`);
			}
		} else if(command.length === 2 && (command[0] === "balls" || command[0] === "ball" || command[0] === "b" || command[0] === "pokeball" || command[0] === "pokeballs" || command[0] === "p")
				&& (command[1] === "price" || command[1] === "p")){
			msg.channel.send(`The price of a pokeball is ${POKEBALL_PRICE} monies.`);
		}
	}

	getBalls(usersData, user){
		return usersData[user.id].pokeBalls;
	}

	setBalls(usersData, user, amount){
		usersData[user.id] = amount;
	}

	increaseBalls(usersData, user, amount){
		usersData[user.id] += amount;
	}
}

class Type{
	//void constructor(name: string, weakness: Type)
	constructor(name, weakness){
		this.name = name;
		this.weakness = weakness;
	}

	equals(otherType){
		return this.name === otherType.name;
	}

	isStrongTo(otherType){
		otherType.weakness.equals(this);
	}

	isWeakTo(otherType){
		this.weakness.equals(otherType);
	}
}

class Move{
	//void constructor(name: String, accuracy: number, type: Type, attackFunc: function(thisMonster: Pokeman, otherMonster: Pokeman) => {damage: number, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect, description: String})
	constructor(name, accuracy, type, attackFunc){
		this.name = name;
		this.accuracy = accuracy;	//should be between 0 and 100
		this.type = type;
		this.attackFunc = attackFunc;
	}

	//attack(thisMonster: Pokeman, otherMonster: Pokeman) => {damage: number, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect, description: String}
	attack(thisMonster, otherMonster){
		if(Math.random() < this.accuracy / 100){
			let a = this.attackFunc(thisMonster, otherMonster);
			if(this.type.isStrongTo(otherMonster.type)){
				a.damage *= 2;
				a.description += ` ${this.name} is super effective!`;
			} else if(this.type.isWeakTo(otherMonster.type)){
				a.damage *= 0.5;
				a.description += ` ${this.name} is not very effective.`;
			}
			return a;
		} else {
			return {damage: 0, myStatusEffect: null, theirStatusEffect: null, description: `${this.name} missed!`};
		}
	}
}
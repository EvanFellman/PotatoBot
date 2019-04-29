const moneyModule = new (require("./money.js"))();
const slModule = new (require("./saveandload.js"))();
const POKEBALL_PRICE = 25;
let types = {};
let moves = {};
let pokemans = {};
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
				slModule.save(usersData);
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
		slModule.save(usersData);
	}

	increaseBalls(usersData, user, amount){
		usersData[user.id] += amount;
		slModule.save(usersData);
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

	//attack(thisMonster: Pokeman, otherMonster: Pokeman) => {damage: number, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect}
	attack(thisMonster, otherMonster){
		if(Math.random() < this.accuracy / 100){
			let a = this.attackFunc(thisMonster, otherMonster);
			a.description = "";
			if(this.type.isStrongTo(otherMonster.type)){
				a.damage *= 2;
				a.description += ` ${this.name} is super effective!`;
			} else if(this.type.isWeakTo(otherMonster.type)){
				a.damage *= 0.5;
				a.description += ` ${this.name} is not very effective.`;
			}
			if(a.myStatusEffect !== null){
				a.description += ` ${thisMonster.name} is ${a.myStatusEffect.description}.`;
			}
			if(a.theirStatusEffect !== null){
				a.description += ` ${otherMonster.name} is ${a.theirStatusEffect.description}.`;
			}
			return a;
		} else {
			return {damage: 0, myStatusEffect: null, theirStatusEffect: null, description: `${this.name} missed!`};
		}
	}
}

class Pokeman{
	//void constructor(name: String, type: Type, moves: Move[], baseStats: {healthStat: number, attackStat: number, defenseStat: number, speedStat: number}, level, uniqueStats)
	constructor(name, type, moves, baseStats, level=1, uniqueStats=null){
		this.name = name;
		this.type = type;
		this.moves = moves;
		this.xp = 0;
		this.baseStats = baseStats;
		this.status = null;  //StatusEffect
		this.health = 0;
		this.level = level;
		this.uniqueStats = uniqueStats;
		if(this.uniqueStats === null){
			this.uniqueStats = {healthStat: Math.round(Math.random() * 100), attackStat: Math.round(Math.random() * 100), defenseStat: Math.round(Math.random() * 100), speedStat: Math.round(Math.random() * 100)};
		}
		this.resetPokeman();
	}

	//natural calcMaxHealth() returns maxHealth
	calcMaxHealth(){
		return ((150 + this.uniqueStats.healthStat) / 200) * this.baseStats.healthStat;
	}

	//sets health to full and resets status
	resetPokeman(){
		this.health = this.calcMaxHealth();
		this.status = null;
	}

	printHealthBar(){
		let out = "┌";
		const length = 100;
		for(let i = 0; i < length; i++){
			out += "─";
		}
		out += "┐\n│";
		let asdf = 0;
		for(asdf = 0; asdf < length * (this.health / this.calcMaxHealth()); asdf++){
			out += "█"
		}
		for(asdf; asdf < length; asdf++){
			out += "░";
		}
		out += "│\n└";
		for(let i = 0; i < length; i++){
			out += "─";
		}
		out += "┘";
		return out;
	}

	//Move[] getMoves()
	getMoves(){
		return this.moves;
	}

	//Move getMoveByIndex(i: natural)
	getMoveByIndex(i){
		return this.moves[i];
	}

	//Move getMoveByName(name: String)
	getMoveByName(name){
		for(let i = 0; i < this.moves.length; i++){
			if(this.moves[i].name === name){
				return this.moves[i];
			}
		}
		return null;
	}

	//This deals also deals damage to the other pokeman
	//String attack(otherMonster: Pokeman, moveIndex: natural)
	attack(otherMonster, moveIndex){
		if(this.status !== null && !this.status.active){
			return this.status.tick(thisMonster);
		} else {
			let a = this.moves[moveIndex].attack(this, otherMonster);
			a.damage *= ((this.baseStats.attackStat + this.uniqueStats.attackStat) / 200) * Math.round(this.level * 0.5);
			a.damage *= Math.round((200 + (200 - (otherMonster.baseStats.defenseStat + otherMonster.uniqueStats.defenseStat))) / (400 * Math.round(otherMonster.level * 0.5)));
			otherMonster.health -= a.damage;
			let description = "";
			if(a.myStatusEffect !== null){
				this.status = a.myStatusEffect;
				description += ` ${this.name} now is ${this.status.name}.`;
			}
			if(a.theirStatusEffect !== null){
				otherMonster.status = a.theirStatusEffect;
				description += ` ${otherMonster.name} now is ${this.status.name},`;
			}
			let statusString = "";
			if(this.status !== null){
				statusString += this.status.tick(this);
				if(!this.status.inEffect){
					this.status = null;
				}
			}
			return `${description}${this.name} used ${this.moves[moveIndex].name}!${a.description}${statusString}`;
		}
	}
}

class StatusEffect{
	//void constructor(name: String, description: String, type: Type, active: boolean, attackFunc: function(thisMonster) => number, freeFunc: function() => boolean)
	constructor(name, description, type, active, attackFunc, freeFunc){
		this.name = name;
		this.description = description;
		this.attackFunc = attackFunc;		//function to determine damage
		this.active = active
		this.inEffect = true;
		this.freeFunc = freeFunc;			//function to determine if status is lifted
	}

	//String tick(thisMonster: Pokeman)
	tick(thisMonster){
		if(this.freeFunc()){
			this.inEffect = false;
			return ` ${thisMonster.name} is no longer ${this.description}!`;
		} else {
			let damage = this.attackFunc(thisMonster);
			damage *= this.type.isStrongTo(thisMonster.type) ? 2 : 1;
			damage *= this.type.isWeakTo(thisMonster.type) ? 0.5 : 1;
			damage *= (200 + (200 - (thisMonster.baseStats.defenseStat + thisMonster.uniqueStats.defenseStat))) / 400;
			thisMonster.health -= damage;
			return damage === 0 ? (this.active ? ` ${thisMonster.name} is ${this.description} and cannot fight!` : ` ${thisMonster.name} is still ${this.description}.`) : ` ${thisMonster.name} lost ${damage} health because they are ${this.description}.`;
		}
	}
}

types["fire"] = new Type("fire", new Type("water", null));
types["water"] = new Type("water", new Type("grass", null));
types["grass"] = new Type("grass", new Type("fire", null));

moves["Burn Baby Burn"] = new Move("Burn Baby Burn", 65, types["fire"], (a, b) => {return {damage: Math.round(25 + (Math.random() * 25)), myStatusEffect: null, theirStatusEffect: null }});

pokemans["YAH YEET"] = (level, stats) => new Pokeman("YAH YEET", types["fire"], [moves["Burn Baby Burn"]], {healthStat: 300, attackStat: 50, defenseStat: 50, speedStat: 60}, level, stats);

let a = pokemans["YAH YEET"]();
let b = pokemans["YAH YEET"]();
console.log(a.attack(b, 0));
console.log(b.printHealthBar());
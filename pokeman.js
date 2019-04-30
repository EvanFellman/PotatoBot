const moneyModule = new (require("./money.js"))();
const slModule = new (require("./saveandload.js"))();
const POKEBALL_PRICE = 25;
const STARTER_PRICE = 25;
const STARTERS = ["YAH YEET"];
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
			if(POKEBALL_PRICE * amountToBuy > usersData[author.id].balance){
				msg.reply(`you cannot afford this. The price of a pokeball is ${POKEBALL_PRICE} monies.`);
			} else {
				moneyModule.increaseBalance(usersData, author, (-1) * POKEBALL_PRICE * amountToBuy);
				this.increaseBalls(usersData, author, amountToBuy);
				msg.channel.send(`<@${author.id}> has purchased ${amountToBuy} pokeballs for ${POKEBALL_PRICE * amountToBuy} monies.`);
			}
		} else if(command.length === 2 && (command[0] === "balls" || command[0] === "ball" || command[0] === "b" || command[0] === "pokeball" || command[0] === "pokeballs" || command[0] === "p")){
			if(command[1] === "price" || command[1] === "p"){
				msg.channel.send(`The price of a pokeball is ${POKEBALL_PRICE} monies.`);
			} else if(command[1] === "amount" || command[1] === "a"){
				msg.reply(`you have ${this.getBalls(usersData, author)} pokeballs.`);
			}
		} else if(command.length >= 2 && (command[0] === "pokebattle" || command[0] === "pokemanbattle" || command[0] === "pokemonbattle" || command[0] === "pb")){
			if(command.length == 2 && (command[1] === "starter" || command[1] === "s")){
				if(this.getPokemans(usersData, author).length > 0){
					msg.reply(`you already have a pokeman`);
				} else if(moneyModule.getBalance(usersData, author) < STARTER_PRICE){
					msg.reply(`you cannot afford this. The price of a starter is ${STARTER_PRICE} monies.`);
				} else {
					const poke = pokemans[STARTERS[Math.floor(Math.random() * STARTERS.length)]](1, 0, undefined, author.username);
					this.addPokeman(usersData, author, poke);
					moneyModule.increaseBalance(usersData, author, (-1) * STARTER_PRICE);
					msg.channel.send(`<@${author.id}> spent ${STARTER_PRICE} monies to get their first pokeman! They received a lvl 1 ${poke.name}.`);
				}
			}
		}
	}

	getBalls(usersData, user){
		return usersData[user.id].pokeBalls;
	}

	setBalls(usersData, user, amount){
		usersData[user.id].pokeBalls = amount;
		slModule.save(usersData);
	}

	increaseBalls(usersData, user, amount){
		usersData[user.id]["pokeBalls"] += amount;
		slModule.save(usersData);
	}

	getPokemans(usersData, user){
		let out = [];
		for(let i = 0; i < usersData[user.id].pokemans; i++){
			out += pokemans[usersData[user.id].pokemans[i][0]](usersData[user.id].pokemans[i][1], usersData[user.id].pokemans[i][2], usersData[user.id].pokemans[i][3]);
		}
		return usersData[user.id].pokemans;
	}

	addPokeman(usersData, user, poke){
		usersData[user.id].pokemans.push([poke.name, poke.level, poke.xp, poke.uniqueStats]);
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
	//void constructor(name: String, accuracy: number, type: Type, attackFunc: function(thisMonster: Pokeman, otherMonster: Pokeman) => {damage: number, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect})
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
			a.description = "";
			if(this.type.isStrongTo(otherMonster.type)){
				a.damage *= 2;
				a.description += ` ${this.name} is super effective!`;
			} else if(this.type.isWeakTo(otherMonster.type)){
				a.damage *= 0.5;
				a.description += ` ${this.name} is not very effective.`;
			}
			if(a.myStatusEffect !== null){
				a.description += ` ${thisMonster.getName()} is ${a.myStatusEffect.description}.`;
			}
			if(a.theirStatusEffect !== null){
				a.description += ` ${otherMonster.getName()} is ${a.theirStatusEffect.description}.`;
			}
			return a;
		} else {
			return {damage: 0, myStatusEffect: null, theirStatusEffect: null, description: `${this.name} missed!`};
		}
	}
}

class Pokeman{
	//void constructor(name: String, type: Type, moves: Move[], baseStats: {healthStat: number, attackStat: number, defenseStat: number, speedStat: number}, level: number, uniqueStats: stats, owner: String)
	constructor(name, type, moves, baseStats, level=1, xp=0, uniqueStats=null, owner=""){
		this.name = name;
		this.owner = owner;
		this.type = type;
		this.moves = moves;
		this.xp = xp;
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
		return Math.round(((150 + this.uniqueStats.healthStat) / 200) * this.baseStats.healthStat );//* this.level / 3);
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

	getName(){
		if(this.owner === ""){
			return this.name;
		} else {
			return `${this.owner}'s ${this.name}`;
		}
	}

	//This deals also deals damage to the other pokeman
	//String attack(otherMonster: Pokeman, moveIndex: natural)
	attack(otherMonster, moveIndex){
		if(this.status !== null && !this.status.active){
			return this.status.tick(thisMonster);
		} else {
			let a = this.moves[moveIndex].attack(this, otherMonster);
			a.damage *= ((this.baseStats.attackStat + this.uniqueStats.attackStat) / 200) * Math.round(this.level * 0.5);
			a.damage *= Math.round((200 + (200 - (otherMonster.baseStats.defenseStat + otherMonster.uniqueStats.defenseStat))) / (400 * Math.round(otherMonster.level)));
			otherMonster.health -= a.damage;
			let description = "";
			if(a.myStatusEffect !== null){
				this.status = a.myStatusEffect;
				description += ` ${this.name} now is ${this.status.name}.`;
			}
			if(a.theirStatusEffect !== null){
				otherMonster.status = a.theirStatusEffect;
				description += ` ${otherMonster.getName()} now is ${this.status.name}.`;
			}
			let statusString = "";
			if(this.status !== null){
				statusString += this.status.tick(this);
				if(!this.status.inEffect){
					this.status = null;
				}
			}
			return `${description}${this.getName()} used ${this.moves[moveIndex].name}! ${a.description}${statusString}`;
		}
	}

	//String info(showLevel: boolean, showUniqueStats: boolean)
	info(showLevel=false, showUniqueStats=false){
		let a = [`=--- Type`,`- ${this.type.name}`,``, `=--- Weak To Moves Of Type`, `- ${this.type.weakness.name}`, ``,
			`=--- Base Stats`,`- attack -- ${this.baseStats.attackStat}`, ``, `- defense -- ${this.baseStats.defenseStat}`, ``, 
			`- speed -- ${this.baseStats.speedStat}`, ``, `- health -- ${this.baseStats.healthStat}`];
		if(showLevel){
			a.unshift(``);
			a.unshift(`- lvl ${this.level}`);
			a.unshift(`=--- Level`);
		}
		if(showUniqueStats){
			a.push(``);
			a.push(`=--- Unique Stats`);
			a.push(``);
			a.push(`- attack -- ${this.uniqueStats.attackStat}`);
			a.push(``);
			a.push(`- defense -- ${this.uniqueStats.defenseStat}`);
			a.push(``);
			a.push(`- speed -- ${this.uniqueStats.speedStat}`);
			a.push(``);
			a.push(`- health -- ${this.uniqueStats.healthStat}`);
		}
		return box(a, this.getName());
	}
}

class StatusEffect{
	//void constructor(name: String, description: String, type: Type, active: boolean, attackFunc: function(thisMonster) => number, freeFunc: function(thisMonster) => boolean)
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
		if(this.freeFunc(thisMonster)){
			this.inEffect = false;
			return ` ${thisMonster.getName()} is no longer ${this.description}!`;
		} else {
			let damage = this.attackFunc(thisMonster);
			damage *= this.type.isStrongTo(thisMonster.type) ? 2 : 1;
			damage *= this.type.isWeakTo(thisMonster.type) ? 0.5 : 1;
			damage *= (200 + (200 - (thisMonster.baseStats.defenseStat + thisMonster.uniqueStats.defenseStat))) / 400;
			thisMonster.health -= damage;
			return damage === 0 ? (this.active ? ` ${thisMonster.getName()} is ${this.description} and cannot fight!` : ` ${thisMonster.getName()} is still ${this.description}.`) : ` ${thisMonster.getName()} lost ${damage} health because they are ${this.description}.`;
		}
	}
}

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
  return out + "|`";
}

types["fire"] = new Type("fire", new Type("water", null));
types["water"] = new Type("water", new Type("grass", null));
types["grass"] = new Type("grass", new Type("fire", null));

moves["Burn Baby Burn"] = new Move("Burn Baby Burn", 65, types["fire"], (a, b) => {return {damage: Math.round(25 + (Math.random() * 25)), myStatusEffect: null, theirStatusEffect: null }});

pokemans["YAH YEET"] = (level, xp, stats, owner) => new Pokeman("YAH YEET", types["fire"], [moves["Burn Baby Burn"]], {healthStat: 300, attackStat: 50, defenseStat: 50, speedStat: 60}, level, xp, stats, owner);

let a = pokemans["YAH YEET"](1, 0, null,"Yooooo");
let b = pokemans["YAH YEET"]();
// console.log(a.attack(b, 0));
// console.log(b.printHealthBar());
// console.log(a.info(true, true))
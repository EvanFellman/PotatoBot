const moneyModule = new (require("./money.js"))();
const slModule = new (require("./saveandload.js"))();
const POKEBALL_PRICE = 25;
const STARTER_PRICE = 25;
const STARTERS = ["YAH YEET"];
let types = {};
let moves = {};
let pokemans = {};
let statusEffects = {};
let games = {};
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
			if(command.length == 2 && (command[1] === "list" || command[1] === "l")){
				const a = this.getPokemans(usersData, author);
				let out = "";
				for(let i = 0; i < a.length; i++){
					out += `\n${i+1}. ${a[i].getName()}\t\tlvl${a[i].level}`;
				}
				msg.channel.send(out.substring(1));
			} else if((command[1] === "pokedex" || command[1] === "info" || command[1] === "i")){
				if(!isNaN(command[2])){
					msg.channel.send(this.getPokeman(usersData, author, parseInt(command[2]) - 1).info(true, true), {split: true});
				} else {
					let name = ""
					for(let i = 2; i < command.length; i++){
						name += " " + command[i];
					}
					name = name.substring(1);
					let pokemansnames = Object.keys(pokemans);
					for(let i = 0; i < pokemansnames.length; i++){
						if(pokemansnames[i].toLowerCase() === name){
							msg.channel.send(Object.values(pokemans)[i]().info());
						}
					}
					let typenames = Object.keys(types);
					for(let i = 0; i < typenames.length; i++){
						if(typenames[i].toLowerCase() === name){
							msg.channel.send(Object.values(types)[i].info());
						}
					}
					let movenames = Object.keys(moves);
					for(let i = 0; i < movenames.length; i++){
						if(movenames[i].toLowerCase() === name){
							msg.channel.send(Object.values(moves)[i].info());
						}
					}
				}
			} else if(command.length == 2 && (command[1] === "starter" || command[1] === "s")){
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
			} else if(command.length === 4 && (command[1] === "wildbattle" || command[1] === "wb")){
				if(games[msg.channel.id] === undefined){
					games[msg.channel.id] = {};
				}
				const userPokeman = this.getPokemans(usersData, author)[parseInt(command[2]) - 1];
				userPokeman.owner = author.username;
				let wildPokeman = Object.values(pokemans);
				wildPokeman = wildPokeman[Math.floor(Math.random() * wildPokeman.length)](Math.max(1, userPokeman.level + Math.floor(3 * ((Math.random() * 2) - 1))), 0, undefined, "Wild");
				//Store games in games object
				//	Each game is saved under its channel and under both of the users' ids.
				//	When making a two player pokeman battle, make one reference the other (example: games[msg.channel][author.id] = games[msg.channel][otherPlayer.id]; )
				//		Therefore both players can edit and access the same game without needing to update both after doing something.
				//wildBattle: bool, userPokeman: Pokeman, wildPokeman: Pokeman, bet: float
				games[msg.channel.id][author.id] = {wildBattle: true, userPokeman: userPokeman, wildPokeman: wildPokeman, bet: Math.abs(parseInt(command[3]))};
				let thisGame = games[msg.channel.id][author.id];
				let out = `${thisGame.userPokeman.getName()} is battling a level ${thisGame.wildPokeman.level} ${thisGame.wildPokeman.getName()} for ${thisGame.bet} monies.\n`;
				thisGame.userPokeman.resetPokeman();
				thisGame.wildPokeman.resetPokeman();
				
				if(thisGame.userPokeman.baseStats.speedStat + thisGame.userPokeman.uniqueStats.speedStat > thisGame.wildPokeman.baseStats.speedStat + thisGame.wildPokeman.uniqueStats.speedStat){
					//If this is true then user goes first
				} else {
					//Otherwise wild pokeman goes first
					out += `${thisGame.wildPokeman.attack(userPokeman, Math.floor(Math.random() * thisGame.wildPokeman.moves.length))}\n`;

				}
				out += `${thisGame.userPokeman.getName()}'s health:\n${thisGame.userPokeman.printHealthBar()}`;
				out += `\n\n ${thisGame.wildPokeman.getName()}'s health:\n${thisGame.wildPokeman.printHealthBar()}`;
				out += `\nUse \`pokebattle attack <move number>\` to use a move`;
				out += `${thisGame.userPokeman.printMoves()}`;
				msg.channel.send(out, {split: true});
			} else if(command.length === 3 && (command[1] === "attack" || command[1] === "a")){
				if(games[msg.channel.id] && games[msg.channel.id][author.id] && games[msg.channel.id][author.id].wildBattle){
					const thisGame = games[msg.channel.id][author.id];
					const userPokeman = thisGame.userPokeman;
					const wildPokeman = thisGame.wildPokeman;
					let out = "";
					if(userPokeman.health <= 0){
						out += `${userPokeman.getName()} fainted. You lost ${thisGame.bet} monies.`;
						moneyModule.increaseBalance(usersData, author, (-1) * thisGame.bet);
						delete games[msg.channel.id][author.id];
					} else {
						out += `${userPokeman.attack(wildPokeman, parseInt(command[2]) - 1)}\n`;
						out += `${thisGame.userPokeman.getName()}'s health:\n${thisGame.userPokeman.printHealthBar()}`;
						out += `\n\n ${thisGame.wildPokeman.getName()}'s health:\n${thisGame.wildPokeman.printHealthBar()}\n\n\n\n`;
						if(wildPokeman.health <= 0){
							out += `${wildPokeman.getName()} fainted. You won ${thisGame.bet} monies.`;
							moneyModule.increaseBalance(usersData, author, thisGame.bet);
							userPokeman.increaseXP(wildPokeman.level);
							delete games[msg.channel.id][author.id];
							this.savePokeman(usersData, author, userPokeman);
						} else {
							out += `${wildPokeman.attack(userPokeman, Math.floor(Math.random() * thisGame.wildPokeman.moves.length))}\n`;
							out += `${thisGame.userPokeman.getName()}'s health:\n${thisGame.userPokeman.printHealthBar()}`;
							out += `\n\n ${thisGame.wildPokeman.getName()}'s health:\n${thisGame.wildPokeman.printHealthBar()}`;
							if(userPokeman.health <= 0){
								out += `\n${userPokeman.getName()} fainted. You lost ${thisGame.bet} monies.`;
								moneyModule.increaseBalance(usersData, author, (-1) * thisGame.bet);
								delete games[msg.channel.id][author.id];
							} else {
								out += `\nUse \`pokebattle attack <move number>\` to use a move`;
								out += `${thisGame.userPokeman.printMoves()}`;
							}
						}
					}
					msg.channel.send(out, {split: true});
				}
			} else if(command.length === 2 && (command[1] === "throwball" || command[1] === "throw" || command[1] === "t") && games[msg.channel.id] && games[msg.channel.id][author.id] && games[msg.channel.id][author.id].wildBattle){
				if(this.getBalls(usersData, author) > 0){
					const wildPoke = games[msg.channel.id][author.id].wildPokeman;
					this.increaseBalls(usersData, author, -1);
					if(Math.random() <= wildPoke.health / (1.1 * wildPoke.calcMaxHealth())){
						//you caught it
						wildPoke.xp = 0;
						wildPoke.level = 1;
						this.addPokeman(usersData, author, wildPoke);
						msg.channel.send(`You caught a ${wildPoke.getName()}!`);
					} else {
						msg.channel.send(`It escaped!`);
					}
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
		for(let i = 0; i < usersData[user.id].pokemans.length; i++){
			out.push(pokemans[usersData[user.id].pokemans[i][0]](usersData[user.id].pokemans[i][1], usersData[user.id].pokemans[i][2], usersData[user.id].pokemans[i][3]));
		}
		return out;
	}

	getPokeman(usersData, user, index){
		return pokemans[usersData[user.id].pokemans[index][0]](usersData[user.id].pokemans[index][1], usersData[user.id].pokemans[index][2], usersData[user.id].pokemans[index][3]);
	}

	addPokeman(usersData, user, poke){
		usersData[user.id].pokemans.push([poke.name, poke.level, poke.xp, poke.uniqueStats]);
		slModule.save(usersData);
	}

	savePokeman(usersData, user, poke){
		for(let i = 0; i < usersData[user.id].pokemans.length; i++){
			const p = usersData[user.id].pokemans[i];
			if(p[0] === poke.name && p[3].attackStat === poke.uniqueStats.attackStat && p[3].defenseStat === poke.uniqueStats.defenseStat && p[3].speedStat === poke.uniqueStats.speedStat && p[3].healthStat === poke.uniqueStats.healthStat){
				usersData[user.id].pokemans[i] = [poke.name, poke.level, poke.xp, poke.uniqueStats];
				slModule.save(usersData);
				return;
			}
		}
	}
}




class Type{
	//void constructor(name: string, weakness: Type)
	constructor(name, weaknesses){
		this.name = name;
		this.weaknesses = {};
		for(let i = 0; i < weaknesses.length; i++){
			this.weaknesses[weaknesses[i]] = true;
		}
	}

	equals(otherType){
		return this.name === otherType.name;
	}

	isStrongTo(otherType){
		return otherType.weaknesses[this.name] ? true : false;
	}

	isWeakTo(otherType){
		return this.weaknesses[otherType.name] ? true : false;
	}

	info(){
		let a = [];
		a.push(`=-- weaknesses`);
		let b = Object.keys(this.weaknesses);
		for(let i = 0; i < b.length; i ++){
			a.push(`- ${b[i]}`);
		}
		return box(a, this.name);
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

	info(){
		let a = [];
		a.push(`=-- accuracy`);
		a.push(`- ${this.accuracy}`);
		a.push(``);
		a.push(`=-- type`);
		a.push(`- ${this.type.name}`);
		return box(a, this.name);
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
			this.uniqueStats = new Stats(Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100));
		}
		this.resetPokeman();
	}

	increaseXP(x){
		this.xp += x;
		while(this.xp >= Math.pow(this.level, 2)){
			this.xp -= Math.pow(this.level,2);
			this.level++;
		}
	}

	//natural calcMaxHealth() returns maxHealth
	calcMaxHealth(){
		return Math.round(((150 + this.uniqueStats.healthStat) / 200) * this.baseStats.healthStat * this.level / 3);
	}

	//sets health to full and resets status
	resetPokeman(){
		this.health = this.calcMaxHealth();
		this.status = null;
	}

	printHealthBar(){
		let out = "╭";
		const length = 50;
		for(let i = 0; i < 1 + (length * 2 / 3); i++){
			out += "━";
		}
		out += "╮\n │";
		let asdf = 0;
		for(asdf = 0; asdf < length * (this.health / this.calcMaxHealth()); asdf++){
			out += "█"
		}
		for(asdf; asdf < length; asdf++){
			out += "░";
		}
		out += "│\n╰";
		for(let i = 0; i < 1 + (length * 2 / 3); i++){
			out += "━";
		}
		out += "╯";
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

	printMoves(w = 0){
		let a = [];
		for(let i = 1; i <= this.moves.length; i++){
			let b = "";
			for(let j = this.moves[i - 1].name.length; j < 20; j++){
				b += " ";
			}
			a.push(`${i} --- ${this.moves[i - 1].name}${b} - ${this.moves[i - 1].type.name}`);
		}
		return box(a,"",w);
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
		} else if(this.owner === "Wild"){
			return `Wild ${this.name}`;
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
			a.damage *= Math.round((200 + (200 - (otherMonster.baseStats.defenseStat + otherMonster.uniqueStats.defenseStat))) / (400 * Math.round(otherMonster.level) / 3));
			otherMonster.health -= a.damage;
			let description = "";
			if(a.myStatusEffect !== null){
				this.status = a.myStatusEffect;
				description += ` ${this.name} now is ${this.status.description}.`;
			}
			if(a.theirStatusEffect !== null){
				otherMonster.status = a.theirStatusEffect;
				description += ` ${otherMonster.getName()} now is ${otherMonster.status.description}.`;
			}
			let statusString = "";
			if(this.status !== null){
				statusString += this.status.tick(this);
				if(!this.status.inEffect){
					this.status = null;
				}
			}
			return `${description}${this.getName()} used ${this.moves[moveIndex].name}! ${a.description} ${statusString}`;
		}
	}

	//String info(showLevel: boolean, showUniqueStats: boolean)
	info(showLevel=false, showUniqueStats=false){
		let a = [`=--- Type`,`- ${this.type.name}`,``, `=--- Weak To Moves Of Types`];
		const asdf = Object.keys(this.type.weaknesses);
		for(let i = 0; i < asdf.length; i ++){
			a.push(`- ${asdf[i]}`);
		}

		a = a.concat(``,
			`=--- Base Stats`,`- attack -- ${this.baseStats.attackStat}`, ``, `- defense -- ${this.baseStats.defenseStat}`, ``, 
			`- speed -- ${this.baseStats.speedStat}`, ``, `- health -- ${this.baseStats.healthStat}`);
		if(showLevel){
			a.unshift(``);
			a.unshift(`- ${this.xp} xp`);
			a.unshift(`=--- XP`);
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
		let out = box(a, this.getName(), 50);
		if(showLevel){
			a.push(``);
			a.push(`=--- Moves`);
			out = box(a, this.getName(), 40) + this.printMoves(40);
		}
		return out;
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
		this.type = type;
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

class Stats{
	constructor(health, attack, defense, speed){
		this.healthStat = health;
		this.attackStat = attack;
		this.defenseStat = defense;
		this.speedStat = speed;
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
//				new Type(typeName: String, weakness: String[]);
types["fire"] = new Type("fire", ["water","rock"]);
types["water"] = new Type("water", ["grass"]);
types["grass"] = new Type("grass", ["fire"]);
types["toxic"] = new Type("toxic", ["fire"]);
types["rock"] = new Type("rock", ["toxic"]);

//						  new Move(moveName: String, accuracy: natural, type: Type, attackFunction(thisMonster, thierMonster) => {damage: natural, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect});
moves["Burn Baby Burn"] = new Move("Burn Baby Burn", 65, types["fire"], (a, b) => {return {damage: Math.round(25 + (Math.random() * 25)), myStatusEffect: null, theirStatusEffect: null }});
moves["Poison"] = new Move("Poison", 75, types["toxic"], (a, b) => {return {damage: 0, myStatusEffect: null, theirStatusEffect: statusEffects["poison"]()}});

//					   (level: nat, xp: nat, stats: Stats, owner: String) => new Pokeman(pokemanName: String, type: Type, moves: Move[], baseStats: Stats, level: nat, xp: nat, stats: Stats, owner: String);
pokemans["YAH YEET"] = (level, xp, stats, owner) => new Pokeman("YAH YEET", types["fire"], [moves["Burn Baby Burn"], moves["Poison"]], new Stats(300, 50, 50, 60), level, xp, stats, owner);

//						  () => new StatusEffect(name: String, desc: String, type: Type, active: boolean, attackFunc(thisM: Pokeman) => number, freeFunc(thisM: Pokeman) => boolean);
statusEffects["poison"] = () => new StatusEffect("poison", "poisoned", types["toxic"], true, (thisM) => thisM.calcMaxHealth() / 8, (thisM) => (Math.random() * (500 - (thisM.baseStats.speedStat + thisM.uniqueStats.speedStat)) < 50));


let a = pokemans["YAH YEET"](1, 0, null,"Yooooo");
let b = pokemans["YAH YEET"]();
// console.log(a.attack(b, 0));
// console.log(b.printHealthBar());
// console.log(a.info(true, true));
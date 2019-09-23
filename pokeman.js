const moneyModule = new (require("./money.js"))();
const slModule = new (require("./saveandload.js"))();
const POKEBALL_PRICE = 25;
const STARTER_PRICE = 25;
const STARTERS = ["Yah Yeet"];
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

	//helperCommand
	help(){
		return {"pokeman": [["pokeballs buy <amount>", "This will buy <amount> pokeballs"],
							["pokeballs price", "This will show the price of a pokeball"],
							["pokeballs amount", "This will say how many pokeballs you have"],
							["pokebattle list", "This will list all of the pokemans you have"],
							["pokebattle info <pokeNumber or name>", "This will show information about either the pokeman of <pokeNumber> or about <name>"],
							["pokebattle starter", "This will give you a starter pokeman"],
							["pokebattle wildbattle <pokeNumber> <monies>", "Starts a battle against a wild pokeman with bet of <monies> monies and <pokeNumber> pokeman"],
							["pokebattle attack <moveNumber>", "Your pokeman will use <moveNumber> move"],
							["pokebattle throwball", "Throw a pokeball to try to catch a pokeman"],
							["pokebattle end", "Ends a battle"],
							["pokebattle release <pokeNumber>", "Releases your pokeman into the wild"]]};
	}

	//processes a message
	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length === 3 && (command[1] === "buy" || command[1] === "b") && 
				(command[0] === "balls" || command[0] === "ball" || command[0] === "b" 
				|| command[0] === "pokeball" || command[0] === "pokeballs")){
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
			if(command.length === 3 && command[1] === "release" && !isNaN(command[2])){
				const myPokemans = this.getPokemans(usersData, author);
				const i = parseInt(command[2]) - 1;
				if(i < 0){
					msg.reply("no pokeman was released.");
				} else if(i >= myPokemans.length){
					msg.reply("no pokemans was released.");
				} else {
					msg.channel.send(`${myPokemans[i].name} was released to the wilderness!`);
					this.killPokeman(usersData, author, i);
				}
			} else if(command.length === 2 && (command[1] === "list" || command[1] === "l")){
				const a = this.getPokemans(usersData, author);
				let out = "";
				for(let i = 0; i < a.length; i++){
					let b = "";
					for(let j = a[i].getName().length; j < 20; j++){
						b += " ";
					}
					out += (`${i+1}. ${a[i].getName()}${b}lvl${a[i].level}\n`);
				}
				msg.channel.send({embed:{color: 15444020, description: out, title: `${author.username}'s Pokemans`}});
			} else if((command[1] === "pokedex" || command[1] === "info" || command[1] === "i")){
				if(!isNaN(command[2])){
					msg.channel.send("",this.getPokeman(usersData, author, parseInt(command[2]) - 1).info(true, true), {split: true});
				} else {
					let name = ""
					for(let i = 2; i < command.length; i++){
						name += " " + command[i];
					}
					name = name.substring(1);
					let pokemansnames = Object.keys(pokemans);
					for(let i = 0; i < pokemansnames.length; i++){
						if(pokemansnames[i].toLowerCase() === name){
							msg.channel.send("",Object.values(pokemans)[i]().info());
						}
					}
					let typenames = Object.keys(types);
					for(let i = 0; i < typenames.length; i++){
						if(typenames[i].toLowerCase() === name){
							msg.channel.send("",Object.values(types)[i].info());
						}
					}
					let movenames = Object.keys(moves);
					for(let i = 0; i < movenames.length; i++){
						if(movenames[i].toLowerCase() === name){
							msg.channel.send("",Object.values(moves)[i].info());
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
				if(Math.abs(parseFloat(command[3])) > moneyModule.getBalance(usersData,author)){
					msg.reply("you don't have enough monies!");
					return;
				}
				//Store games in games object
				//	Each game is saved under its channel and under both of the users' ids.
				//	When making a two player pokeman battle, make one reference the other (example: games[msg.channel][author.id] = games[msg.channel][otherPlayer.id]; )
				//		Therefore both players can edit and access the same game without needing to update both after doing something.
				//wildBattle: bool, userPokeman: Pokeman, wildPokeman: Pokeman, bet: float
				games[msg.channel.id][author.id] = {wildBattle: true, invite: false, battle: false, userPokeman: userPokeman, wildPokeman: wildPokeman, bet: Math.abs(parseFloat(command[3])), message: null};
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
				thisGame.message = msg.channel.send(out, {split: true});
			} else if(command.length === 2 && (command[1] === "e" || command[1] === "end")){
				if(games[msg.channel.id] && games[msg.channel.id][author.id]){
					delete games[msg.channel.id][author.id];
					msg.reply("game is ended.");
				} else {
					msg.reply("there is no game to end.");
				}
			} else if(command.length >= 5 && (command[1] === "b" || command[1] === "battle")){
				if(!games[msg.channel.id]){
					games[msg.channel.id] = {};
				}
				if(games[msg.channel.id] && !games[msg.channel.id][author.id]){
					const otherUser = msg.mentions.users.first();
					if(moneyModule.getBalance(usersData, author) < parseInt(command[3])){
						msg.reply("you don't have enough monies!");
					} else if(moneyModule.getBalance(usersData, otherUser) < parseInt(command[3])){
						msg.reply("they don't have enough monies!");
					} else {
						const ppokes = this.getPokemans(usersData, author);
						const npokes = command.slice(4).map(x => parseInt(x));
						let pokes = [];
						for(let i = 0; i < npokes.length; i++){
							if(npokes[i] < 1 || npokes[i] > ppokes.length){
								msg.reply(`not valid pokeman number.`);
								return;
							}
							pokes.push(ppokes[npokes[i] - 1]);
						}
						games[msg.channel.id][author.id] = {wildBattle: false, invite: true, battle: false, bet: parseInt(command[3]), userToInvite: otherUser.id, pokes: pokes, pokeNum: npokes};
						msg.channel.send(`<@${author.id}> has invited <@${otherUser.id}> to a PokeBattle for ${command[3]} monies.`);
					}
				} else {
					msg.reply("you already have a game!");
				}
			} else if(command.length === 3 && (command[1] === "decline" || command[1] === "d")){
				const otherUser = msg.mentions.users.first();
				if(games[msg.channel.id] && games[msg.channel.id][otherUser.id] && games[msg.channel.id][otherUser.id].invite){
					msg.channel.send(`<@${author.id}> declined <@${otherUser.id}>'s offer to battle.`);
					delete games[msg.channel.id][otherUser.id];
				} else {
					msg.reply(`you were not invited to any battles.`);
				}
			} else if(command.length >= 4 && (command[1] === "accept")){
				const otherUser = msg.mentions.users.first();
				if(games[msg.channel.id] && (!games[msg.channel.id][author.id]) && (games[msg.channel.id][otherUser.id] && games[msg.channel.id][otherUser.id].invite)){
					const ppokes2 = this.getPokemans(usersData, otherUser);
					const npokes2 = command.slice(3).map(x => parseInt(x));
					let pokes2 = [];
					for(let i = 0; i < npokes2.length; i++){
						if(npokes2[i] < 1 || npokes2[i] > ppokes2.length){
							msg.reply(`not valid pokeman number.`);
							return;
						} else {
							pokes2.push(ppokes2[npokes2[i] - 1]);
						}
					}
					const pokes1 = games[msg.channel.id][otherUser.id].pokes;
					const npokes1 = games[msg.channel.id][otherUser.id].pokeNum;
					//A battle has many properties: 
					//	wildBattle = false
					//	invite = false
					//	battle = true
					//	player1: User this represents one player
					//	player2: User this represents another player
					//	pokes1: Pokeman[] this represents an array of Pokemans (first is the one that is currently out) for player1
					//	pokes2: Pokeman[] this represents an array of Pokemans (first is the one that is currently out) for player2
					//	pokeNum1: PositiveNatural[] this represents an array of numbers which correlates to the pokemans in pokes1
					//	pokeNum2: PositiveNatural[] this represents an array of numbers which correlates to the pokemans in pokes2
					//	turn: PositiveNatural this is the id of who's turn it is
					//	bet: how many monies
					games[msg.channel.id][otherUser.id] = {wildBattle: false, invite: false, battle: true, turn: null, bet: games[msg.channel.id][otherUser.id].bet, 
						player1: otherUser, p1: otherUser, pokes1: pokes1, pokeNum1: npokes1, player2: author,p2: author, pokes2: pokes2, pokeNum2: npokes2};
					games[msg.channel.id][author.id] = games[msg.channel.id][otherUser.id];
					const thisGame = games[msg.channel.id][author.id];
					const p1 = thisGame.player1;
					const p2 = thisGame.player2;
					const p1Poke = thisGame.pokes1[0];
					const p2Poke = thisGame.pokes2[0];
					p1Poke.resetPokeman();
					p2Poke.resetPokeman();
					if(p1Poke.baseStats.speedStat + p1Poke.uniqueStats.speedStat >= p2Poke.baseStats.speedStat + p2Poke.uniqueStats.speedStat){
						//p1 goes first
						thisGame.turn = p1.id;
						let out = `It is <@${p1.id}>'s turn.\n${thisGame.pokes1[0].getName()}'s health:\n${thisGame.pokes1[0].printHealthBar()}`;
						out += `\n\n ${thisGame.pokes2[0].getName()}'s health:\n${thisGame.pokes2[0].printHealthBar()}`;
						out += `\nUse \`pokebattle attack <move number>\` to use a move. Or use \`pokebattle switch <pokeNumber>\` to switch to a different pokeman.`;
						out += `${thisGame.pokes1[0].printMoves()}`;
						msg.channel.send(out, {split: true});
					} else {
						//p2 goes first
						thisGame.turn = p2.id;
						let out = `It is <@${p2.id}>'s turn.\n${thisGame.pokes2[0].getName()}'s health:\n${thisGame.pokes2[0].printHealthBar()}`;
						out += `\n\n ${thisGame.pokes1[0].getName()}'s health:\n${thisGame.pokes1[0].printHealthBar()}`;
						out += `\nUse \`pokebattle attack <move number>\` to use a move. Or use \`pokebattle switch <pokeNumber>\` to switch to a different pokeman.`;
						out += `${thisGame.pokes2[0].printMoves()}`;
						msg.channel.send(out, {split: true});
					}
				} else {
					msg.reply(`you have no invites to accept.`);
				}
			} else if(command.length === 3 && (command[1] === "s" || command[1] === "switch")){
				if(games[msg.channel.id] && games[msg.channel.id][author.id] && games[msg.channel.id][author.id].battle){
					const p1 = games[msg.channel.id][author.id].player1;
					const p2 = games[msg.channel.id][author.id].player2;
					if(games[msg.channel.id][author.id].turn !== author.id){
						msg.reply(`it is not your turn.`);
					} else if(isNaN(command[2])){
						msg.reply(`not a proper PokeNumber.`);
					} else {
						const thisGame = games[msg.channel.id][author.id];
						const switchTo = parseInt(command[2]) - 1;
						if(switchTo < 0){
							msg.reply(`not a proper PokeNumber`);
						} else if(author.id === thisGame.player1.id){
							//author is player 1
							if(switchTo >= thisGame.pokeNum1.length){
								msg.reply(`not a proper PokeNumber`);
							} else {
								for(let i = 0; i < thisGame.pokeNum1.length;i++){
									if(thisGame.pokeNum1[i] === switchTo){
										const tempPoke = thisGame.pokes1[i];
										const tempNum = thisGame.pokeNum1[i];
										thisGame.pokes1[i] = thisGame.pokes1[0];
										thisGame.pokes1[0] = tempPoke;
										thisGame.pokeNum1[i] = thisGame.pokeNum1[0];
										thisGame.pokeNum1[0] = tempNum;
										break;
									}
								}
								msg.channel.send(`<@${p1.id}> has switched to ${thisGame.pokes1[0].getName()}!`);
								let out = `It is <@${p2.id}>'s turn.\n${thisGame.pokes2[0].getName()}'s health:\n${thisGame.pokes2[0].printHealthBar()}`;
								out += `\n\n ${thisGame.pokes1[0].getName()}'s health:\n${thisGame.pokes1[0].printHealthBar()}`;
								out += `\nUse \`pokebattle attack <move number>\` to use a move. Or use \`pokebattle switch <pokeNumber>\` to switch to a different pokeman.`;
								out += `${thisGame.pokes2[0].printMoves()}`;
								msg.channel.send(out, {split: true});
								thisGame.turn = p2.id;
							}
						} else {
							//author is player 2
							if(switchTo >= thisGame.pokeNum2.length){
								msg.reply(`not a proper PokeNumber`);
							} else {
								for(let i = 0; i < thisGame.pokeNum2.length;i++){
									if(thisGame.pokeNum2[i] === switchTo){
										const tempPoke = thisGame.pokes2[i];
										const tempNum = thisGame.pokeNum2[i];
										thisGame.pokes2[i] = thisGame.pokes2[0];
										thisGame.pokes2[0] = tempPoke;
										thisGame.pokeNum2[i] = thisGame.pokeNum2[0];
										thisGame.pokeNum2[0] = tempNum;
										break;
									}
								}
								msg.channel.send(`<@${p2.id}> has switched to ${thisGame.pokes2[0].getName()}!`);
								let out = `It is <@${p1.id}>'s turn.\n${thisGame.pokes1[0].getName()}'s health:\n${thisGame.pokes1[0].printHealthBar()}`;
								out += `\n\n ${thisGame.pokes2[0].getName()}'s health:\n${thisGame.pokes2[0].printHealthBar()}`;
								out += `\nUse \`pokebattle attack <move number>\` to use a move. Or use \`pokebattle switch <pokeNumber>\` to switch to a different pokeman.`;
								out += `${thisGame.pokes1[0].printMoves()}`;
								msg.channel.send(out, {split: true});
								thisGame.turn = p1.id;
							}
						}
					}
				} else {
					msg.reply(`you are not in a battle.`);
				}
			} else if(command.length === 3 && (command[1] === "attack" || command[1] === "a")){
				if(games[msg.channel.id] && games[msg.channel.id][author.id]){
					if(games[msg.channel.id][author.id].wildBattle){
						const thisGame = games[msg.channel.id][author.id];
						const userPokeman = thisGame.userPokeman;
						if(parseInt(command[2]) < 1 || parseInt(command[2]) > userPokeman.moves.length){
							msg.reply("that is not a valid move number.");
						} else {
							const wildPokeman = thisGame.wildPokeman;
							let out = "";
							if(userPokeman.health <= 0){
								out += `${userPokeman.getName()} fainted. You lost ${thisGame.bet} monies.`;
								moneyModule.increaseBalance(usersData, author, (-1) * thisGame.bet);
								delete games[msg.channel.id][author.id];
							} else {
								out += `${userPokeman.attack(wildPokeman, parseInt(command[2]) - 1)}\n`;
								if(wildPokeman.health <= 0){
									out += `${wildPokeman.getName()} fainted. You won ${thisGame.bet} monies.\n`;
									out += `${thisGame.userPokeman.getName()}'s health:\n${thisGame.userPokeman.printHealthBar()}`;
									out += `\n\n ${thisGame.wildPokeman.getName()}'s health:\n${thisGame.wildPokeman.printHealthBar()}`;
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
							thisGame.message.then(a => {a.edit(out);});
						}
						msg.delete();
					} else if(games[msg.channel.id][author.id].battle){
						//Two player battle
						if(games[msg.channel.id][author.id].turn !== author.id){
							msg.reply(`it is not your turn.`);
						} else {
							const thisGame = games[msg.channel.id][author.id];
							let userPokes = null;
							let otherPokes = null;
							let userPokeman = null;
							let otherPokeman = null;
							let otherUser = null;
							let userPokeN = null;
							let otherPokeN = null;
							if(thisGame.player1.id === author.id){
								userPokes = thisGame.pokes1;
								otherPokes = thisGame.pokes2;
								userPokeN = thisGame.pokeNum1;
								otherPokeN = thisGame.pokeNum2;
								userPokeman = userPokes[0];
								otherPokeman = otherPokes[0];
								otherUser = thisGame.player2;
							} else {
								userPokes = thisGame.pokes2;
								otherPokes = thisGame.pokes1;
								userPokeN = thisGame.pokeNum2;
								otherPokeN = thisGame.pokeNum1;
								userPokeman = userPokes[0];
								otherPokeman = otherPokes[0];
								otherUser = thisGame.player1;
							}
							if(!isNaN(command[2]) && (parseInt(command[2]) < 1 || parseInt(command[2]) > userPokeman.moves.length)){
								msg.reply("that is not a valid move number.");
							} else {
								let out = `${userPokeman.attack(otherPokeman, parseInt(command[2]) - 1)}\n`;
								if(userPokeman.health <= 0){
									//we fainted from status D:
									out += `${userPokes[0].getName()} fainted.\n`;
									const dead = userPokes.shift();
									userPokeN.shift();
									if(userPokes.length === 0){
										msg.channel.send(`${out}<@${author.id}> ran out of Pokemans. <@${otherUser.id}> made ${thisGame.bet} monies.`, {split: true});
										moneyModule.increaseBalance(usersData, otherUser, thisGame.bet);
										moneyModule.increaseBalance(usersData, author, (-1) * thisGame.bet);
										return;
									} else {
										userPokeman = userPokes[0];
									}
								}
								if(otherPokeman.health <= 0){
									//they fainted D:
									out += `${otherPokes[0].getName()} fainted.\n`;
									const dead = otherPokes.shift();
									userPokeN.shift();
									if(otherPokes.length === 0){
										msg.channel.send(`${out}<@${otherUser.id}> ran out of Pokemans. <@${author.id}> made ${thisGame.bet} monies.`, {split: true});
										moneyModule.increaseBalance(usersData, author, thisGame.bet);
										moneyModule.increaseBalance(usersData, otherUser, (-1) * thisGame.bet);
										return;
									} else {
										otherPokeman = otherPokes[0];
										
									}
								}
								out += `It is <@${otherUser.id}>'s turn.\n${otherPokeman.getName()}'s health:\n${otherPokeman.printHealthBar()}`;
								out += `\n\n ${userPokeman.getName()}'s health:\n${userPokeman.printHealthBar()}`;
								out += `\nUse \`pokebattle attack <move number>\` to use a move. Or use \`pokebattle switch <pokeNumber>\` to switch to a different pokeman.`;
								out += `${otherPokeman.printMoves()}`;
								msg.channel.send(out, {split: true});
								thisGame.turn = otherUser.id;
							}
						}
					}
				} 
			} else if(command.length === 2 && (command[1] === "throwball" || command[1] === "throw" || command[1] === "t") && games[msg.channel.id] && games[msg.channel.id][author.id] && games[msg.channel.id][author.id].wildBattle){
				if(this.getBalls(usersData, author) > 0){
					const wildPoke = games[msg.channel.id][author.id].wildPokeman;
					this.increaseBalls(usersData, author, -1);
					if(Math.random() <= 1 - (wildPoke.health / (1.1 * wildPoke.calcMaxHealth()))){
						//you caught it
						wildPoke.xp = 0;
						wildPoke.level = 1;
						this.addPokeman(usersData, author, wildPoke);
						delete games[msg.channel.id][author.id];
						msg.channel.send(`You caught a ${wildPoke.getName()}!`);
					} else {
						msg.channel.send(`It escaped!`);
					}
				} else {
					msg.reply(`you need to buy balls. To do this run \`pokeballs buy <amount>\``)
				}
			}
		}
	}

	getBalls(usersData, user){
		return usersData[user.id].pokeBalls;
	}

	setBalls(usersData, user, amount){
		usersData[user.id].pokeBalls = amount;
		slModule.save(user, usersData[user.id]);
	}

	increaseBalls(usersData, user, amount){
		usersData[user.id]["pokeBalls"] += amount;
		slModule.save(user, usersData[user.id]);
	}

	getPokemans(usersData, user){
		let out = [];
		for(let i = 0; i < usersData[user.id].pokemans.length; i++){
			out.push(pokemans[usersData[user.id].pokemans[i][0]](usersData[user.id].pokemans[i][1], usersData[user.id].pokemans[i][2], usersData[user.id].pokemans[i][3], user.username));
		}
		return out;
	}

	killPokeman(usersData, user, num){
		usersData[user.id].pokemans.splice(num, 1);
		slModule.save(user, usersData[user.id]);
	}

	getPokeman(usersData, user, index){
		return pokemans[usersData[user.id].pokemans[index][0]](usersData[user.id].pokemans[index][1], usersData[user.id].pokemans[index][2], usersData[user.id].pokemans[index][3]);
	}

	addPokeman(usersData, user, poke){
		usersData[user.id].pokemans.push([poke.name, poke.level, poke.xp, poke.uniqueStats]);
		slModule.save(user, usersData[user.id]);
	}

	savePokeman(usersData, user, poke){
		for(let i = 0; i < usersData[user.id].pokemans.length; i++){
			const p = usersData[user.id].pokemans[i];
			if(p[0] === poke.name && p[3].attackStat === poke.uniqueStats.attackStat && p[3].defenseStat === poke.uniqueStats.defenseStat && p[3].speedStat === poke.uniqueStats.speedStat && p[3].healthStat === poke.uniqueStats.healthStat){
				usersData[user.id].pokemans[i] = [poke.name, poke.level, poke.xp, poke.uniqueStats];
				slModule.save(user, usersData[user.id]);
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
		let a = "";
		let b = Object.keys(this.weaknesses);
		for(let i = 0; i < b.length; i ++){
			a += `- ${b[i]}\n`;
		}
		a = a.substring(0, a.length - 1);
		return {embed: {color: 15444020, title: this.name, fields: [{name: "Weaknesses", value: a}]}, split: true};
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
				a.damage *= 0.75;
				a.description += ` ${this.name} is not very effective.`;
			}
			if(a.myStatusEffect !== null){
				a.description += ` ${thisMonster.getName()} is ${a.myStatusEffect.description}.`;
			}
			if(a.theirStatusEffect !== null){
				a.description += ` ${otherMonster.getName()} is ${a.theirStatusEffect.description}.`;
			}
			if(a.description.length > 0){
				a.description = a.description.substring(1);
			}
			return a;
		} else {
			return {damage: 0, myStatusEffect: null, theirStatusEffect: null, description: `${this.name} missed!`};
		}
	}

	info(){
		return {embed: {color: 15444020, title: this.name, fields: [{name: "Accuracy", value: this.accuracy}, {name: "Type", value: this.type.name}], title: this.name}, split: true};
	}
}

class Pokeman{
	//void constructor(name: String, type: Type, moves: Move[], baseStats: {healthStat: number, attackStat: number, defenseStat: number, speedStat: number}, level: number, uniqueStats: stats, owner: String)
	constructor(name, type, moves, baseStats, level=1, xp=0, uniqueStats=null, owner="", evolve={}){
		this.name = name;
		this.owner = owner;
		this.type = type;
		this.moves = moves;
		this.xp = xp;
		this.baseStats = baseStats;
		this.status = null;  //StatusEffect
		this.health = 0;
		this.level = level;
		this.evolve = evolve;
		for(let i = 1; i <= this.level; i++){
			if(i in this.evolve){
				this.evolve[i](this);
			}
		}
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
			if(this.level in this.evolve){
				this.evolve[this.level](this);
			}
		}
	}

	//natural calcMaxHealth() returns maxHealth
	calcMaxHealth(){
		return Math.round((this.uniqueStats.healthStat / 100) * this.baseStats.healthStat * (this.level / 3));
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
		out += "│ " + Math.round(this.health) + " / " + Math.round(this.calcMaxHealth()) + "\n╰";
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

	printMoves(){
		let a = [];
		for(let i = 1; i <= this.moves.length; i++){
			let b = "";
			for(let j = this.moves[i - 1].name.length; j < 20; j++){
				b += " ";
			}
			a.push(`${i} --- ${this.moves[i - 1].name}${b} - ${this.moves[i - 1].type.name}`);
		}
		return box(a,"");
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
			let out = this.status.tick(this);
			if(!this.status.inEffect){
				this.status = null;
			}
			return out;
		} else {
			let statusString = "";
			if(this.status !== null){
				statusString += this.status.tick(this);
				if(!this.status.inEffect){
					this.status = null;
				}
			}
			if(moveIndex >= this.moves.length || moveIndex < 0){
				return;
			} else {
				let a = this.moves[moveIndex].attack(this, otherMonster);
				a.damage *= ((this.baseStats.attackStat + this.uniqueStats.attackStat) / 200) * ((this.level / otherMonster.level) * 0.5);
				a.damage *= Math.round((200 + (200 - (otherMonster.baseStats.defenseStat + otherMonster.uniqueStats.defenseStat))) / 400);
				let description = "";
				if(a.damage < 0){
					this.health += (-1) * a.damage;
					description += `${this.getName()} has healed ${Math.round((-1) * a.damage)} health!`;
				} else if(a.damage > 0){
					otherMonster.health -= a.damage;
					description += `${otherMonster.getName()} has lost ${Math.round(a.damage)} health!`;
				}
				if(a.myStatusEffect !== null && this.status === null){
					this.status = a.myStatusEffect;
					description += ` ${this.getName()} now is ${this.status.description}.`;
				}
				if(a.theirStatusEffect !== null && otherMonster.status === null){
					otherMonster.status = a.theirStatusEffect;
					description += ` ${otherMonster.getName()} now is ${otherMonster.status.description}.`;
				}
				
				return `${this.getName()} used ${this.moves[moveIndex].name}! ${description} ${a.description} ${statusString}`;
			}
		}
	}

	//embed info(showLevel: boolean, showUniqueStats: boolean)
	info(showLevel=false, showUniqueStats=false){
		let a = [{name: "Type", value: this.type.name}, {name: "Weak to Moves of Types", value: ""}];
		const asdf = Object.keys(this.type.weaknesses);
		for(let i = 0; i < asdf.length; i ++){
			a[1].value += `- ${asdf[i]}\n`;
		}
		a[1].value = a[1].value.substring(0, a[1].value.length - 1);
		a.push({name: "Base Stats:", value: `- attack -- ${this.baseStats.attackStat}\n- defense -- ${this.baseStats.defenseStat}\n- speed -- ${this.baseStats.speedStat}\n- health -- ${this.baseStats.healthStat}`});
		if(showUniqueStats){
			a.push({name: "Unique Stats", value: `- attack -- ${this.uniqueStats.attackStat}\n- defense -- ${this.uniqueStats.defenseStat}\n- speed -- ${this.uniqueStats.speedStat}\n- health -- ${this.uniqueStats.healthStat}`});
		}
		if(showLevel){
			a.unshift({name: "XP", value: this.xp + " xp"});
			a.unshift({name: "Level", value: "lvl " + this.level})
		}
		if(showLevel){
			let temp = "";
			for(let i = 1; i <= this.moves.length; i++){
				let b = "";
				for(let j = this.moves[i - 1].name.length; j < 20; j++){
					b += " ";
				}
				temp += `${i}. ${this.moves[i - 1].name}${b} - ${this.moves[i - 1].type.name}\n`;
			}
			a.push({name: "Moves", value: temp.substring(0, temp.length - 1)});
		}
		const out = {embed: {fields: a, color: 15444020, title: this.getName()}, split: true};
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
			return damage === 0 ? (!this.active ? ` ${thisMonster.getName()} is ${this.description} and cannot fight!` : 
				` ${thisMonster.getName()} is still ${this.description}.`) : ` ${thisMonster.getName()} lost ${Math.round(damage)} health because they are ${this.description}.`;
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
  out += "|`\n`";
  for(let i = 0; i < maxLen + 2; i++){
  	out += "~";
  }
  out += "`";
  return out;
}
//				new Type(typeName: String, weakness: String[]);
types["Fire"] = new Type("Fire", ["Water","Rock"]);
types["Water"] = new Type("Water", ["Grass"]);
types["Grass"] = new Type("Grass", ["Fire"]);
types["Toxic"] = new Type("Toxic", ["Fire"]);
types["Rock"] = new Type("Rock", ["Toxic"]);

//						  new Move(moveName: String, accuracy: natural, type: Type, attackFunction(thisMonster, theirMonster) => {damage: natural, myStatusEffect: StatusEffect, theirStatusEffect: StatusEffect});
moves["Burn Baby Burn"] = new Move("Burn Baby Burn", 95, types["Fire"], (a, b) => {return {damage: Math.round(25 + (Math.random() * 25)), myStatusEffect: null, theirStatusEffect: null }});
moves["Poison"] = new Move("Poison", 75, types["Toxic"], (a, b) => {return {damage: 0, myStatusEffect: null, theirStatusEffect: statusEffects["poison"]()}});
moves["Bark"] = new Move("Bark", 60, types["Grass"], (a, b) => {return {damage: Math.round(50 + (Math.random() * 15)), myStatusEffect: null, theirStatusEffect: null}});
moves["Sleep Dust"] = new Move("Sleep Dust", 80, types["Water"], (a, b) => {return {damage: 3 * b.health / 4, myStatusEffect: statusEffects["sleep"](), theirStatusEffect: null}});
moves["Splash"] = new Move("Splash", 70, types["Water"], (a, b) => { return {damage: 40 + (Math.random() * 25), myStatusEffect: null, theirStatusEffect: null}});
moves["Knock Out"] = new Move("Knock Out", 90, types["Rock"], (a, b) => { return {damage: 0, myStatusEffect: null, theirStatusEffect: statusEffects["sleep"]()}; });
moves["Slap"] = new Move("Slap", 85, types["Rock"], (a, b) => { return {damage: 40 + (Math.random() * 10), myStatusEffect: null, theirStatusEffect: null}; });
//					   (level: nat, xp: nat, stats: Stats, owner: String) => new Pokeman(pokemanName: String, type: Type, moves: Move[], baseStats: Stats, level: nat, xp: nat, stats: Stats, owner: String, evolve: {natural: (Pokeman) => ()});
pokemans["Yah Yeet"] = (level, xp, stats, owner) => new Pokeman("Yah Yeet", types["Fire"], [moves["Burn Baby Burn"], moves["Poison"]], new Stats(300, 50, 50, 60), level, xp, stats, owner);
pokemans["Dog"] = (level, xp, stats, owner) => new Pokeman("Dog", types["Grass"], [moves["Bark"], moves["Sleep Dust"]], new Stats(500, 80, 30, 50), level, xp, stats, owner);
pokemans["Fishy"] = (level, xp, stats, owner) => new Pokeman("Fishy", types["Water"], [moves["Splash"]], new Stats(200, 60, 45, 90), level, xp, stats, owner, {3: (p) => { p.baseStats.attackStat = 80;}, 5: (p) => {p.moves.push(moves["Bark"]); }});
pokemans["Monkey"] = (level, xp, stats, owner) => new Pokeman("Monkey", types["Rock"], [moves["Slap"]], new Stats(350, 65, 80, 40), level, xp, stats, owner, {5: (p) => { p.moves.push(moves["Knock Out"]); }});
//						  () => new StatusEffect(name: String, desc: String, type: Type, active: boolean, attackFunc(thisM: Pokeman) => number, freeFunc(thisM: Pokeman) => boolean);
statusEffects["poison"] = () => new StatusEffect("poison", "poisoned", types["Toxic"], true, (thisM) => thisM.calcMaxHealth() / 8, (thisM) => (Math.random() * (500 - (thisM.baseStats.speedStat + thisM.uniqueStats.speedStat)) < 50));
statusEffects["sleep"] = () => new StatusEffect("sleep", "sleeping", types["Water"], false, (thisM) => 0, (thisM) => (Math.random() * (500 - (thisM.baseStats.speedStat + thisM.uniqueStats.speedStat))) < 100);
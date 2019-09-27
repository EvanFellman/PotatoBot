const moneyModule = new (require("./money.js"))();


let games = {};

//I removed all of the useless variables.

module.exports = class Main{
	init(user, data){ 
	}
		
	help(){
		return {"horserace": [
					["horseRace create", "Initializes a race"],
					["horseRace bet <horse number> <amount>", "Bets <amount> on horse <horse number>"],
					["horseRace go", "Sets the horses of to the race!"]]};
	}

	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length > 1 && (command[0] === "horserace" || command[0] === "hr")){
			if(command.length === 2 && (command[1] === "create" || command[1] === "c")){
				let thisGame = games[msg.channel.id];
				if(thisGame !== undefined) {
					msg.channel.send("There is already a horse race in progress. Run `;horseRace go` to finish that game.");
				} else {
					games[msg.channel.id] = {horseSpeeds: [], bets: []};
					thisGame = games[msg.channel.id];
					let f = [];
					for(let i = 0; i < 5; i++){
						const speed = Math.ceil(Math.random() * 10);
						const profit = Math.floor((((8.9 / 9) * (10 - speed)) + 1.1) * 10) / 10;
						thisGame.horseSpeeds.push(speed);
						f.push({name: `Horse ${i + 1}`, value: `${speed} units of speed. ${Math.round(profit * 100)}% profit.`});
					}
					msg.channel.send({embed: {color: 15444020, title: "Horse Race", fields: f}});
				}
			} else if(command.length === 4 && (command[1] === "bets" || command[1] === "b" || command[1] == "bet")){
				const amount = parseFloat(command[3]);
				if(moneyModule.getBalance(usersData, author) < amount){
					msg.reply("you cannot afford this.");
					return;
				} else if(parseInt(command[2]) < 1 || parseInt(command[2]) > 5){
					msg.reply("please enter a valid horse number.");
					return;
				}
				games[msg.channel.id].bets[author.id] = {amount: amount, horse: Math.abs(parseInt(command[2]))};
				moneyModule.increaseBalance(usersData, author, (-1) * amount);
				msg.channel.send(`<@${author.id}> bet ${parseFloat(command[3])} on Horse ${parseInt(command[2])}.`);
				msg.delete();
			} else if(command.length === 2 && (command[1] ==="go"|| command[1] === "g")){
		
				const thisGame = games[msg.channel.id];
				let horsePositions = [0, 0, 0, 0, 0];
				while(true){
					for(let i = 0; i < 5; i++){
						if(thisGame.horseSpeeds[i] >= Math.random() * 15){
							horsePositions[i] += 1;
							if(horsePositions[i] == 3){
								let winnings = [];
								const profit = Math.floor((((8.9 / 9) * (10 - thisGame.horseSpeeds[i])) + 1.1) * 10) / 10;
								for(let j = 0; j < Object.keys(thisGame.bets).length; j++){
									if(Object.values(thisGame.bets)[j].horse === i + 1){
										winnings.push([Object.keys(thisGame.bets)[j], Object.values(thisGame.bets)[j].amount * profit]);
									}
								}
								if(winnings.length === 0){
									msg.channel.send(`Horse ${i + 1} won the race! No one won monies.`);
								} else {
									let out = `Horse ${i + 1} won the race! `;
									for(let j = 0; j < winnings.length; j++){
										out += `<@${winnings[j][0]}> won ${winnings[j][1]} monies.`;
									}
									msg.channel.send(out.substring(0, out.length - 1));
								}
								delete games[msg.channel.id];
								return;
							}
						}
					}
				}
			}
		}
	}
}
const moneyModule = new (require("./money.js"))();
//Make a list of things you need to store in a representation of a game below:
//	- bet Object ----- I'll start you off
let bet = {};
let games = {};// used to store horses there chances of winning and the percentage money they can return.
let speed = [];
let HELP_STRING = [];	
//	-	

//Now think of what representation would best store all of that information. Some examples could be a String, Integer, Object, Array, HashTable, etc.






//You don't need this variable
//Just update the HELP_STRING in the main JS file


module.exports = class Main{
	//You cannot have two different definitions for init
	//	This does not make a whole lot of sense.
	//	Init is used when we are making a new account for a user.
	//	Also you do not want to associate a user's bet with the data that is stored.  If the bot resets then the horse race is forgotten
	//	I don't save the pokeman battles.
	//	I would make an init function that does nothing because we don't want to do anything when a user gets an account.
	//  We can store their bets in the bets object located in the representation of the game.
	//	Afterall, there can be many games going on at once where a user can have bets in all of them.
	//	At all times there is at most one game per text channel that our bot has access to.
	//	Meaning that putting bets in a user's account would make this difficult as they could participate in more than one game at once where they would bet differently.
	//	I would put the bet object in the representation of a horse race game.
	//	We should have some sort of collection of the horse race games.  We also want to associate each game with the ID of the text channel it is in.
	init(user,data){ 
	}
		

	//I have to insert this so it wont bust
	//helperCommand
	help(){
		return {};
	}


	processMessage(msg,command,horseRace){
		const author = msg.author;
		let exsists = false;// to check if a game is already there

		//I dont know what this is for.  This feels like an incomplete thought.  Please expand on this and I can help.

		//I would format this differently.
		//Make one if statement checking if the first of command is "horserace" or "hr"
		//	Then in that if statement put all of the other checks so you dont have to keep checking if the first statement is "hr"
		//Something else to note is that every element in command is lower case.
		//  This was done to allow users to not care about the casing of the commands they write since we will always process their statement after making all of the letters lower case.
		if(command.length === 2 && command[0] === "horserace" || command[0] === "hr" && command[1] === "create" || command[1] === "c"){

			
			if(exsists = false){
				msg.channel.send("initialising new game. Place your bets");
				games[channel.id][author.id] = {};
				let thisGame = games[channel.id][author.id];
				exsists = true;
				// also need to send the table giving out informatione
				if(command.length === 4 && command[0] === "horserace" || command[0] === "hr" && command[1] === "bets" || command[1] === "b"){
				
					msg.channel.send(";2");
					let amount = command[2];
					bets[author.id]={bet: Math.abs(parseInt(command[2])),horse: Math.abs(parseInt(command[3]))}
				    //i am trying to save the money each player bets and on which horse in this 
					moneyModule.increaseBalance(usersData,author,(-1)*amount);
					if(command[0] === "horserace" || command[0] ==="hr" && command[1] ==="start"|| command[1] === "st"){
						let won = calculateWinningHorse();
						msg.channel.send("horse"+ i+1 + "won");
						//here i am trying to print which horse won.The function returns the index in the speed array 
						//and this prints the corresponding horse.
					}
				}  
			}
			
		} 
	}

	//betmoney(bet,user,amount){
	  // bet[user.id].bets = amount;
    //}

    calculateSpeed(){
    	for(let i = 0 ; i < 5 ; i++){
    		speed[i] = getRandomInt(0,10);
    	}
   
    	
    }

    getRandomInt(min, max) {
  		min = Math.ceil(min);
 		max = Math.floor(max);
 		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}

	
    calculateChancesOfWinning(speed){
    	
    	let speed = calculateSpeed();
		return speed / totalspeed() * 100;
    }

    
    totalSpeed(){
    	let sum = 0;
    	for(let i = 0 ; i < speed.length ; i++){
    		sum = sum + speed[i];
    	}
    	return speed;
		
	}

    
	calcTheChance(){
		//I dont understand what this function does.
		//I dont exactly like how it works. It biases the top too much. But if you like it dont change it.
		let speed = []//array of all speeds.// sort in ascending order
		let number = getRandomInt(0,1);
		if(number <= 0.35){
			return speed[0];
		}else if( number > 0.35 && number <0.60){
			return speed[1];
		}else if(number >0.60 && number < 0.80){
			return speed[2];
		}else if(number >0.80 && number <0.93){
			return speed[3];
		}else{
			return speed[4];
		}
		// caculating a biased random chance
	}

	calculateWinningHorse(){
		let try1 = calcTheChance();
		let try2 = calcTheChance();
		let try3 = calcTheChance();
		let winner = 0;

		if(try1 === try2 && try2 === try3){
			winner = try1;
		} else if(try1 === try2){
			winner =  try1;
		} else if(try2 === try3){
			winner = try2;
		} else if(try3 === try1){
			winner =  try3;
		} else{
			winner = Math.random(try1,try2,try3);
		}
		for(let i = 0 ; i < speed.length ; i++){
			if(winner === speed[i]){
				return i;

			}
		}
		
	}
	returnBets(bets){
		// need this to see which player placed bet on correct horse and return the money accordingly
	}
}






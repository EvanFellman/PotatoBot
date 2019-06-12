const moneyModule = new (require("./money.js"))();
//Make a list of things you need to store in a representation of a game below:
//	- bet Object ----- I'll start you off
//	-	
//	-	
//	-	

//Now think of what representation would best store all of that information. Some examples could be a String, Integer, Object, Array, HashTable, etc.

const horseRace = {};
const bet ={};



//You don't need this variable
//Just update the HELP_STRING in the main JS file
let HELP_STRING = [];

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
	init(user,bet){ 
		bet[user.id].horses = [];
		bet[user.id].bets = 0;
	} 
	init(horse,horseRace){
		horseRace[horse].speed = [];
		horseRace[horse].win = 0;
	}
	processMessage(msg,command,horseRace){
		const author = msg.author;

		//I dont know what this is for.  This feels like an incomplete thought.  Please expand on this and I can help.
		const speed1 = calculatespeed(horse1);

		//I would format this differently.
		//Make one if statement checking if the first of command is "horserace" or "hr"
		//	Then in that if statement put all of the other checks so you dont have to keep checking if the first statement is "hr"
		//Something else to note is that every element in command is lower case.
		//  This was done to allow users to not care about the casing of the commands they write since we will always process their statement after making all of the letters lower case.
		if(command[0] === "horserace" || command[0] === "hr" && command[1] === "create" || command[1] === "c"){
			
			//This is a test. I think.
			//I would check to make sure that there isnt a game going on before you create a new game.
			//Since it would suck if someone just created a new game and thus deleting all of the bets placed.
			msg.channel.send(speed1);
			msg.channel.send("initialising new game. Place your bets");
			msg.channel.send(";1");
			
			
			// also need to send the table giving out informatione
		} else if(command[0] === "horserace" || command[0] === "hr" && command[1] === "bets" || command[1] === "b"){
			//check to make sure there is a horse race that is created to bet on before allowing the player to bet

			msg.channel.send(";2");
			let bet = command[2];
			let horse = command[3];
			//this.betmoney(bet,author,bet);

			//increaseBalance is not located in this class. It is in moneyModule.
			this.increaseBalance(usersData,author,(-1)*amount);
		} else if(command[0] === "horserace" || command[0] ==="hr" && command[1] === "start" || command [1] ==="s"){
			//make sure there is a horse race that is created and there is at least one bet on it

			// calculate the winning horse
			msg.channel.send(";3");
		}		
	}

	//betmoney(bet,user,amount){
	  // bet[user.id].bets = amount;
    //}

    //use camelCase please :)
    //camelCase helps make your function and variable names easier to read at first glance.
    //please use it

    //use camelCase please :)
    calculatespeed(horse){
    	//I personally used a different algorithm but it doesn't really matter
    	//I make each of the speeds between 1 and 10
    	horseRace[horse].speed = getRandomInt(0,20);
    }

    getRandomInt(min, max) {
  		min = Math.ceil(min);
 		max = Math.floor(max);
 		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}

	//use camelCase please :)
    calculatechancesofwinning(horse, speed){
    	//calculateHorseSpeed(Horse) does not exist
    	//I think you mean calculatespeed
    	//which needs to be camelCase
    	let speed = calculateHorseSpeed(horse);
		return speed / totalspeed() * 100;
    }

    //use camelCase please :)
    totalspeed(){
    	//calculateHorseSpeed(Horse) does not exist
    	//I think you mean calculatespeed
    	//which needs to be camelCase
		return calculateHorseSpeed(horse1) + calculateHorseSpeed(horse2) + calculateHorseSpeed(horse3) + calculateHorseSpeed(horse4) + calculateHorseSpeed(horse5);
	}

    //use camelCase please :)
	calcthechance(){
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

    //use camelCase please :)
	calculatewinninghorse(){
		//infinite recursion :D wheeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
		let try1 = calculatewinninghorse();
		let try2 = calculatewinninghorse();
		let try3 = calculatewinninghorse();
		let winner = 0;
		//Use triple equals to compare
		//Single equals is for setting variables and does not output a boolean value.
		if(try1 = try2 && try2 = try3){
			winner = try 1;
		} else if(try1 = try2){
			winner =  try1;
		} else if(try2 = try3){
			winner = try2;
		} else if(try3 = try1){
			winner =  try3;
		} else{
			winner = 0;
		}
		//This function doesn't change any variables nor output anything.
		//I think you intended to return winner but I dont want to write it in case I am wrong.
	}
}






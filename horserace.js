const moneyModule = new (require("./money.js"))();


let games = {};

//I removed all of the useless variables.

module.exports = class Main{
	init(user, data){ 
	}
		

	//This is where you do the helper function stuff.  DONT use HELP_STRING
	//I have to insert this so it wont bust
	//helperCommand
	help(){
		return {};
	}


	processMessage(msg, command, usersData){
		const author = msg.author;

		//I got rid of the exsists variable because
		//	1. 	It was misspelled
		//	2.	It does not make sense to have it.


		//I'll do the formatting thing I said earlier.
		//Now the code is a LOT easier to read.
		if(command.length > 1 && (command[0] === "horserace" || command[0] === "hr")){
			if(command.length === 2 && (command[1] === "create" || command[1] === "c")){
				//deleted a line that would ruin the game
				let thisGame = games[msg.channel.id];
				//Yessssss this is a good idea
				//Why did you never use it?


				//Dont use double equals, we use triple equals.  It avoids stupid behavior that double equals has.
				//I fixed it for you
				//I deleted it because it wouldn't work
				//It doesn't make sense
				//I'll write for you
				if(Object.keys(thisGame).length !== 0) {
					msg.channel.send("There is already a horse race in progress. Run `;horseRace go` to finish that game.");
					//I improved your output if there is another game running.

					//You didn't end your brace.  I fixed it for you.
				} else {
					//fixed your spelling
					msg.channel.send("Initializing new game. Place your bets");

					//Now initialize thisGame
				}
			} else if(command.length === 4 && (command[1] === "bets" || command[1] === "b")){
				//bad tabbing --- I fixed it
				//You have to check to see if the user actually has that much money


				const amount = parseFloat(command[2]);
				games[msg.channel.id].bets.push({amount: amount, horse: Math.abs(parseInt(command[3]))});
				//You forgot a semicolon
				//You made an amount variable ????
				//Why not use it?

				//You wrote it like this
				//	games[author.id]= ......
				//This is not how you did it before though
				//I fixed it


				//What you did before didn't make a lot of sense to me
				//You were trying to get the games under the author id
				//And then you set it to be an individual bet.
				//We want to push another bet onto the bets array that is located in the games object under the channel's id.
				//So I fixed it for you

				moneyModule.increaseBalance(usersData, author, (-1) * amount);
			} else if(command.length === 2 && (command[1] ==="start"|| command[1] === "st")){
				let won = calculateWinningHorse();
				msg.channel.send("Horse " + (won + 1) + " won!");
				//You need to surround won + 1 with parentheses.
				//You can determine that by testing the code or trying to think as to how the computer would run your code.
				//You had msg.channel.send("horse"+ won+1 + "won"); before I fixed it.
				//You also forgot to add spaces because even if you had remembered to put the parentheses it would appear like this:
				//			horse2won
				//This is not correct.
				//Don't worry I fixed it.
			}
		}
	}

    calculateSpeed(){
    	//I would not use this function 
    	//I would just think about how to represent the game before you continue
    	//If you think about how to represent the game you'll see why most of this code below wont work even if you fix the bugs.
    	//Keep in mind we want more than one game going on at the same time.
    	for(let i = 0 ; i < 5 ; i++){
    		speed[i] = getRandomInt(0,10);
    	}
    	return speed;
    	//This representation will not work for more than one game going on at once. !!!!!!!!!!!!!!!!!!!!!!!!!!
    }

    getRandomInt(min, max) {
    	//Why are you rounding?
    	//This does not make sense
  		min = Math.ceil(min);
 		max = Math.floor(max);
 		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}

	
    calculateChancesOfWinning(){
    	//I would not use this function 
    	//I would just think about how to represent the game before you continue
    	//If you think about how to represent the game you'll see why most of this code below wont work even if you fix the bugs.
    	//Keep in mind we want more than one game going on at the same time.
    	let speed1 = [];
    	let speed = calculateSpeed();
    	for(let i = 0 ; i < 5 ; i++){
    		speed1[i] = (speed[i]/totalSpeed)*100;
    		//I won't fix this because you gotta learn this
    		//speed1 has nothing in it.
    		//Please run the code
    	}
    	//This whole function can be done in calculateSpeed

    	//No output
    }

    
    totalSpeed(){
    	//I would not use this function 
    	//I would just think about how to represent the game before you continue
    	//If you think about how to represent the game you'll see why most of this code below wont work even if you fix the bugs.
    	//Keep in mind we want more than one game going on at the same time.
    	let sum = 0;
    	for(let i = 0 ; i < speed.length ; i++){
    		sum = sum + speed[i];
    	}
    	return sum;
	}

    
	calcTheChance(){
		//Emulate a race.  This function is not going to work well.
		//For example: 
		//	Scenario A:
		//		Horse 1: speed of 9
		//		Horse 2: speed of 1
		//	Scenario B:
		//		Horse 1: speed of 9
		//		Horse 2: speed of 8
		//Under this algorithm in Scenario A, Horse 1 has the same chance of winning as Horse 1 in Scenario B.  This is not fair.
		//Also the payout is dependent on how low the speed is.  Therefore in Scenario A then Horse 2 has a VERY unfair advantage compared to Horse 2 in Scenario B.
		//Please emulate a race where the speed is the chance out of 10 to go forward once.
		//Each horse takes turn trying to go forward.
		//First to distance of 3 units wins.
		//This is a lot more fair
		let speed = [];//You forgot semicolon
		//This function will not work as you intended 
		//speed is length zero.
		//Besides I would rewrite this function.
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
	}
	// i honestly dont understand what you mean by chance to go forward once.
	//like if the speeds are 9 and 8 then the horse 1 has 9/17 th chance to go forward while horse 2 has 8/17th. But then what?
	//No.
	//Make an array of length 5 (the number of horses you should have).
	//Every element starts at zero
	//Each element at index i represents Horse i + 1 's distance
	//Each time Horse u moves forward do this:
	//		array[u - 1]++;
	//If array[u] === 3 then Horse u wins

	calculateWinningHorse(){
		//I would not use this function 
    	//I would just think about how to represent the game before you continue
    	//If you think about how to represent the game you'll see why most of this code below wont work even if you fix the bugs.
    	//Keep in mind we want more than one game going on at the same time.

    	//also this code wouldn't work.
    	//please test it
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
		//Otherwise return nothing?????????????????????		
	}
	returnBets(bets){
		//need this to see which player placed bet on correct horse and return the money accordingly
	}
}






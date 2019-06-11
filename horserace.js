const moneyModule = new (require("./money.js"))();
const horseRace = {};
const bet ={};
let HELP_STRING = [];

module.exports = class Main{
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
		const speed1 = calculatespeed(horse1);
		if(command[0] === "horseRace" || command[0] === "hr" && command[1] === "create" || command[1] === "c"){
		
			msg.channel.send(speed1);
			msg.channel.send("initialising new game. Place your bets");
			msg.channel.send(";1");
			
			
			// also need to send the table giving out informatione
		}else if(command[0] === "horseRace" || command[0] === "hr" && command[1] === "bets" || command[1] === "b"){
			msg.channel.send(";2");
			let bet = command[2];
			let horse = command[3];
			//this.betmoney(bet,author,bet);
			this.increaseBalance(usersData,author,(-1)*amount);
		}else if(command[0] === "horseRace" || command[0] ==="hr" && command[1] === "start" || command [1] ==="s"){
			// calculate the winning horse
			msg.channel.send(";3");
		}		
	}
	//betmoney(bet,user,amount){
	  // bet[user.id].bets = amount;
    //}
    calculatespeed(horse){
    	horseRace[horse].speed = getRandomInt(0,20);
    }
    getRandomInt(min, max) {
  		min = Math.ceil(min);
 		max = Math.floor(max);
 		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
    calculatechancesofwinning(horse,speed){
    	let speed = calculateHorseSpeed(horse);
		return speed / totalspeed() * 100;
    }
    totalspeed(){
		return calculateHorseSpeed(horse1) + calculateHorseSpeed(horse2) + calculateHorseSpeed(horse3) + calculateHorseSpeed(horse4) + calculateHorseSpeed(horse5);
	}
	calcthechance(){
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
		// caiculating a biased random chance
	}
	calculatewinninghorse(){
		let try1 = calculatewinninghorse();
		let try2 = calculatewinninghorse();
		let try3 = calculatewinninghorse();
		let winner = 0;
		if(try1 = try2 && try2 = try3){
			winner = try 1;
		}else if(try1 = try2){
			winner =  try1;
		}else if(try2 = try3){
			winner = try2;
		}else if(try3 = try1){
			winner =  try3;
		}else{
			winner = 0;
		}
	}
}






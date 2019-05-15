const moneyModule = new (require("./money.js"))();
const horseRace = {};

module.exports = class Main{
addToHelperString( "horse1S","horse1Pe","horse1P");	
	init(winningHorse, data) { }
	processMessage(msg,command,horserace){
		const author = msg.author;
		if(command[0] === horserace || command[0] === hr){
			if(command[1] === start || command[1] === st || command[1] === s){
				horse1S = calculateHorseSpeed(horse1);
				horse1P = calculateProfit(horse1);
				horse1Pe = calculateWinningPercentage(horse1);
				msg.channel.send(box(HELP_STRING),"",85);
			}

		}
	}
	calculateHorseSpeed(horse){
		Math.random('100','150','185','200','145','215','230','250','300','325','400','450','700','500','800');
	}
	calculateWinningPercentage(horse){
		let speed = calculateHorseSpeed(horse);
		return speed / totalspeed() * 100;

	}
	totalspeed(){
		return calculateHorseSpeed(horse1) + calculateHorseSpeed(horse2) + calculateHorseSpeed(horse3) + calculateHorseSpeed(horse4) + calculateHorseSpeed(horse5);
	}
	calculateProfit(horse){
		let money = calculateWinningPercentage(horse);
		return money * 0.15;
	}
}
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
function addToHelperString(func1,func2,func3){
	if(HELP_STRING.length > 0)
	   HELP_STRING.push("");
	HELP_STRING.push(func0);
	HELP_STRING.push(func1);
	HELP_STRING.push(func2);
	HELP_STRING.push(func3);
	
}




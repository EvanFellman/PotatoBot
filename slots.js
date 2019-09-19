const moneyModule = new (require("./money.js"))();

const WINNINGS = [
	[['✨','✨','✨'], 25],
	[['😂','😂','😂'], 1.25],
	[['💸','💸','💸'], 0.5],
	[['👹','👹','👹'], 3],
	[['🎈','🎈','🎈'], 5],
	[['🐇','🐇','🐇'], 2],
	[['💸','🎈','*'], 4],
	[['😂','👹','✨'], 15],
	[['😂','😂','*'], 1.1],
	[['✨','*','*'], 1.05],
	[['😂','🐇','🎈'], 2]
]

function wrapAround(n, max){
	const mod = n % max;
	if(mod < 0){
		return mod + max;
	} else {
		return mod;
	}
}

function isEqual(correctCombo, attempt){
	if(isEqualChar(correctCombo[0], attempt[0])){
		if(isEqualChar(correctCombo[1], attempt[1])){
			return isEqualChar(correctCombo[2], attempt[2]);
		} else if(isEqualChar(correctCombo[1], attempt[2])){
			return isEqualChar(correctCombo[2], attempt[1]);
		} else {
			return false;
		}
	} else if(isEqualChar(correctCombo[0], attempt[1])){
		if(isEqualChar(correctCombo[1], attempt[0])){
			return isEqualChar(correctCombo[2], attempt[2]);
		} else if(isEqualChar(correctCombo[1], attempt[2])){
			return isEqualChar(correctCombo[2], attempt[0]);
		} else {
			return false;
		}
	} else if(isEqualChar(correctCombo[0], attempt[2])){
		if(isEqualChar(correctCombo[1], attempt[0])){
			return isEqualChar(correctCombo[2], attempt[1]);
		} else if(isEqualChar(correctCombo[1], attempt[1])){
			return isEqualChar(correctCombo[2], attempt[0]);
		} else {
			return false;
		}
	}
}

function isEqualChar(a, b){
	return a === "*" || a === b;
}

module.exports = class Main{
	init(user, data){ 
	}

	help(){
		return {};
	}

	processMessage(msg, command, usersData){
		const author = msg.author;
		if(command.length === 2 && command[0] === "slots" && !isNaN(command[1])){
			if(moneyModule.getBalance(usersData, author) < parseFloat(command[1])){
				msg.reply("you don't have enough monies!");
			} else {
				const BET = parseFloat(command[1]);
				moneyModule.increaseBalance(usersData, author, (-1) * BET);
				const WHEEL_SYMBOLS = ['😂','💸','👹','🐇','🎈','💸','👹','😂','🐇','💸','✨','😂','🎈','💸','🐇'];
				let w1 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let w2 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let w3 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let out = "Rolling...\n";
				out += `\n\t|${WHEEL_SYMBOLS[wrapAround(w1 - 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w2 - 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w3 - 1,WHEEL_SYMBOLS.length)]}|`;
				out += `\n >|${WHEEL_SYMBOLS[w1]} | ${WHEEL_SYMBOLS[w2]} | ${WHEEL_SYMBOLS[w3]}|<`;
				out += `\n\t|${WHEEL_SYMBOLS[wrapAround(w1 + 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w2 + 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w3 + 1,WHEEL_SYMBOLS.length)]}|`;
				
				let s1 = WHEEL_SYMBOLS[w1];
				let s2 = WHEEL_SYMBOLS[w2];
				let s3 = WHEEL_SYMBOLS[w3];
				for(let i = 0; i < WINNINGS.length; i++){
					if(isEqual(WINNINGS[i][0], [s1,s2,s3])){
						moneyModule.increaseBalance(usersData, author, WINNINGS[i][1] * BET);
						out += `\nYou won ${WINNINGS[i][1] * BET} monies!`;
						break;
					} else if(i == WINNINGS.length - 1){
						out += `\nYou lost.`;
					}
				}
				msg.channel.send(out);
			}
		}
	}
}
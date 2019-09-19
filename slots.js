const moneyModule = new (require("./money.js"))();

const WINNINGS = [
	[['✨','✨','✨'], 25],
	[['😂','👹','✨'], 15],
	[['🎈','🎈','🎈'], 5],
	[['👹','👹','👹'], 3],
	[['🐇','🐇','🐇'], 2],
	[['😂','🐇','🎈'], 2],
	[['💸','🎈','*'], 2],
	[['😂','😂','😂'], 1.25],
	[['😂','😂','*'], 1.1],
	[['✨','*','*'], 1.05],
	[['💸','💸','💸'], 0.5]
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
		return {"slots": 
			[["slots <number>", "This allows you to bet <number> on the slots machine"],
			["slots list", "This shows the combinations you need to win"]]
		};
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
						out += `\nYou won ${Math.floor(100 * WINNINGS[i][1] * BET) / 100} monies!`;
						break;
					} else if(i == WINNINGS.length - 1){
						out += `\nYou lost.`;
					}
				}
				msg.channel.send(out);
			}
		} else if(command.length === 2 && command[0] === "slots" && (command[1] === "list" || command[1] === "l" || command[1] === "winnings" || command[1] === "w")){
			let out = [];
			for(let i = 0; i < WINNINGS.length; i++){
				let a = {};
				a.value = `${Math.floor(100 * WINNINGS[i][1])}%`
				a.name = "";
				for(let j = 0; j < 3; j++){
					a.name += "\t" + WINNINGS[i][0][j];
				}
				out.push(a)
			}
			msg.channel.send({embed: {
				color: 15444020,
				fields: out
			  }
			});
		}
	}
}
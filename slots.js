const moneyModule = new (require("./money.js"))();
const slModule = new (require("./saveandload.js"))();

function wrapAround(n, max){
	const mod = n % max;
	if(mod < 0){
		return mod + max;
	} else {
		return mod;
	}
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
				// moneyModule.increaseBalance(usersData, author, (-1) * BET);
				const WHEEL_SYMBOLS = ['😂','💸','👹','🐇','🎈','💸','👹','😂','💸','✨','😂','🎈','💸','🐇'];
				let w1 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let w2 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let w3 = Math.floor(Math.random() * WHEEL_SYMBOLS.length);
				let out = "Rolling...\n";
				out += `\n\t|${WHEEL_SYMBOLS[wrapAround(w1 - 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w2 - 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w3 - 1,WHEEL_SYMBOLS.length)]}|`;
				out += `\n >|${WHEEL_SYMBOLS[w1]} | ${WHEEL_SYMBOLS[w2]} | ${WHEEL_SYMBOLS[w3]}|<`;
				out += `\n\t|${WHEEL_SYMBOLS[wrapAround(w1 + 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w2 + 1,WHEEL_SYMBOLS.length)]} | ${WHEEL_SYMBOLS[wrapAround(w3 + 1,WHEEL_SYMBOLS.length)]}|`;
				msg.channel.send(out);
			}
		}
	}
};
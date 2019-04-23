module.exports = class Main{

	//initializes user
	init(user, data){
		data[user.id].balance = 10;
	}

	//returns true iff it processes a command.  This will process anything directly involving money.
	processMessage(msg, command, data){
		if(command[0] === "hi"){
			msg.reply("hi");
			return true;
		}
	}
}
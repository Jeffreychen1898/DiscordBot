const { ERROR, ERROR_MSG } = require("../exceptions.js");
const CommandTrigger = require("./trigger.js");

const TOKEN_TYPES = {
    WORD: 0,
    SPACE: 1,
    STRING: 2,
    ON_STRING: 3,
    COLON: 4,
    EQUAL: 5
};

class Commands {
    constructor() {
        this.m_invokeCommand = process.env.PREFIX
        this.m_trigger = new CommandTrigger();
    }

    async onMessage(message) {
        try {
            if(message.content.length == 0)
                return;
            
            if(message.content[0] == this.m_invokeCommand) {
                const command_message = message.content.slice(1);
                if(command_message.length == 0)
                    return;
                
                const [command, parameters] = this.$parseCommandMessage(command_message);
                await this.m_trigger.triggerCommands(message, command, parameters);
            }
        } catch(e) {
            throw e;
        }
    }

    /* private */
    $parseCommandMessage(message) {
        try {
            let [ tokens, types ] = this.$tokenize(message);
            const command = this.$parseCommand(tokens, types);

            const index = this.$findIndexWithToken(tokens, " ");
            const parameters = this.$parseParameters(tokens, types, index);

            return [command, parameters];

        } catch(e) {
            throw e;
        }
    }

    $parseParameters(tokens, types, splits) {
        splits.push(tokens.length);

        const parameters = {};

        let previous_index = 0;
        for(let i=0;i<splits.length;i++) {
            let front = previous_index;
            let back = splits[i];
            if(front == back)
                continue;
            
            let [ key, values ] = this.$parseParameter(tokens.slice(front, back), types.slice(front, back));
            parameters[key] = values;

            previous_index = splits[i] + 1;
        }

        return parameters;
    }

    $parseParameter(tokens, types) {
        if(tokens.length % 2 == 0)
            throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
        
        let key = "";
        const values = [];

        for(let i=0;i<tokens.length;i++) {
            if(i % 2 == 0) {
                //keys and parameters
                if(types[i] != TOKEN_TYPES.WORD && types[i] != TOKEN_TYPES.STRING)
                    throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
                
                if(key == "")
                    key = tokens[i];
                else
                    values.push(tokens[i]);

            } else {
                //symbols
                if(i == 1) {
                    if(types[i] != TOKEN_TYPES.EQUAL)
                        throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

                } else if(types[i] != TOKEN_TYPES.COLON)
                    throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
            }
        }

        return [key, values];
    }

    $findIndexWithToken(array, split) {
        const index = [];
        for(let i=0;i<array.length;i++) {
            if(array[i] == split)
                index.push(i);
        }

        return index;
    }

    $parseCommand(tokens, types) {
        if(types[0] != TOKEN_TYPES.WORD)
            throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

        if(tokens.length == 1) {
            const command = tokens[0];
            tokens = tokens.splice(1);
            types = types.splice(1);
            return command;
        }
        
        if(types[1] == TOKEN_TYPES.SPACE) {
            const command = tokens[0];

            tokens = tokens.slice(2);
            types = types.slice(2);

            return command;
        } else
            throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
    }

    $tokenize(message) {
        const tokens = [];
        const types = [];

        let value = "";
        let current_type = undefined;

        for(const c of message) {
            //handle quotes
            if(c == "\"") {
                if(current_type == TOKEN_TYPES.ON_STRING)
                    current_type = TOKEN_TYPES.STRING;

                else {
                    tokens.push(value);
                    types.push(current_type);
                    current_type = TOKEN_TYPES.ON_STRING;
                    value = "";
                }
                continue;
            }

            //handle letters
            if(current_type == TOKEN_TYPES.ON_STRING) {
                value += c;
                continue;
            }

            if(this.$isLetter(c)) {
                if(current_type != TOKEN_TYPES.WORD) {
                    tokens.push(value);
                    types.push(current_type);
                    value = "";
                }

                current_type = TOKEN_TYPES.WORD;
                value += c;
                continue;
            }

            //handle spaces
            if(c == " ") {
                if(current_type != TOKEN_TYPES.SPACE) {
                    tokens.push(value);
                    types.push(current_type);
                    value = "";
                }

                current_type = TOKEN_TYPES.SPACE;
                value = " ";
                continue;
            }

            //handle symbols
            tokens.push(value);
            types.push(current_type);
            value = c;

            if(c == ":")
                current_type = TOKEN_TYPES.COLON;

            else if (c == "=")
                current_type = TOKEN_TYPES.EQUAL;

            else
                throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

        }

        if(current_type == TOKEN_TYPES.ON_STRING)
            throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

        if(value != "") {
            tokens.push(value);
            types.push(current_type);
        }

        return [tokens.slice(1), types.slice(1)];
    }

    $isLetter(character) {
        const ascii_code = character.charCodeAt(0);
        //upper case
        if(ascii_code > 64 && ascii_code < 61)
            return true;

        //lower case
        if(ascii_code > 96 && ascii_code < 123)
            return true;

        return false;
    }
}

module.exports = Commands;
class InvalidStatementException extends Error {
    constructor(message) {
        super(message);
    }
}

class CommandNotFoundException extends Error {
    constructor(message) {
        super(message);
    }
}

const errorMessages = {
    CANNOT_PARSE: "The command cannot be parsed! Make sure the syntax is correct!",
    COMMAND_NOT_FOUND: "You command you tried to execute does not exist!"
};
const exceptions = {
    InvalidStatementException,
    CommandNotFoundException
};

module.exports = {
    ERROR: exceptions,
    ERROR_MSG: errorMessages
};
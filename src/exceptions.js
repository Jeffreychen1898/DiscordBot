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

class CommandErrorException extends Error {
    constructor(message) {
        super(message);
    }
}

class OutOfBoundsException extends Error {
    constructor(message) {
        super(message);
    }
}

const errorMessages = {
    CANNOT_PARSE: "The command cannot be parsed! Make sure the syntax is correct!",
    COMMAND_NOT_FOUND: "You command you tried to execute does not exist!",
    VC_REQUIRED: "You must be in a voice channel to execute this command!",
    INDEX_OUT_OF_BOUNDS: "The index you requested in your command is out of bounds!",
    MISSING_ARGUMENT: "A crucial argument is missing from the command you executed!"
};
const exceptions = {
    InvalidStatementException,
    CommandNotFoundException,
    CommandErrorException,
    OutOfBoundsException
};

module.exports = {
    ERROR: exceptions,
    ERROR_MSG: errorMessages
};
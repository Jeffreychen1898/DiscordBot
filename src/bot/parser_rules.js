const TOKEN_TYPES = {
    NONE: 0,
    STRING: 1,
    WORD: 2,
    PARENTHESIS_OPEN: 3,
    PARENTHESIS_CLOSE: 4,
    SPACE: 5,
    DOT: 6
};

const RULE_TYPES = {
    NONE: 0,
    PARENTHESIS_CLOSE: 1,
    PARENTHESIS_OPEN: 2,
    SPACE: 3,
    DOT: 4,
    END: 5,
    PARAMETER: 6,
    COMMAND: 7
};

class Rules {
    constructor(startToken, startRule) {
        this.m_rules = new Map();
        this.m_startToken = startToken;
        this.startRule = startRule;
    }

    addRule(previous, next) {
        if(this.m_rules.has(previous))
            this.m_rules.get(previous).add(next);
        else {
            const new_set = new Set();
            new_set.add(next);
            this.m_rules.set(previous, new_set);
        }
    }

    nextRule(previous, token) {
        if(!this.m_rules.has(previous))
            return RULE_TYPES.NONE;
        
        const set = this.m_rules.get(previous);
        if(token == TOKEN_TYPES.STRING || token == TOKEN_TYPES.WORD) {

            if(set.has(RULE_TYPES.COMMAND) && token == TOKEN_TYPES.WORD)
                return RULE_TYPES.COMMAND;
            else if(set.has(RULE_TYPES.PARAMETER))
                return RULE_TYPES.PARAMETER;

        } else if(token == TOKEN_TYPES.PARENTHESIS_OPEN) {

            if(set.has(RULE_TYPES.PARENTHESIS_OPEN))
                return RULE_TYPES.PARENTHESIS_OPEN;

        } else if(token == TOKEN_TYPES.PARENTHESIS_CLOSE) {
            
            if(set.has(RULE_TYPES.PARENTHESIS_CLOSE))
                return RULE_TYPES.PARENTHESIS_CLOSE;

        } else if(token == TOKEN_TYPES.SPACE) {

            if(set.has(RULE_TYPES.SPACE))
                return RULE_TYPES.SPACE;

        } else if(token == TOKEN_TYPES.DOT) {

            if(set.has(RULE_TYPES.DOT))
                return RULE_TYPES.DOT;

        }

        if(set.has(RULE_TYPES.END))
            return RULE_TYPES.END;
        
        return RULE_TYPES.NONE;
    }

    matchStartToken(token) {
        if(this.m_startToken == TOKEN_TYPES.STRING && token == TOKEN_TYPES.WORD)
            return true;
        
        return this.m_startToken == token;
    }
}

module.exports = {
    RULE_TYPES: RULE_TYPES,
    TOKEN_TYPES: TOKEN_TYPES,
    Rules: Rules
};
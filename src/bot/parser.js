const rules = require("./parser_rules.js");
const { ERROR, ERROR_MSG } = require("../exceptions.js");

class CommandParser {
    constructor(rawCommand) {
        this.m_rawCommands = rawCommand;

        this.m_subcommandRules = new rules.Rules(rules.TOKEN_TYPES.WORD, rules.RULE_TYPES.COMMAND);
        this.m_parameterRules = new rules.Rules(rules.TOKEN_TYPES.PARENTHESIS_OPEN, rules.RULE_TYPES.PARENTHESIS_OPEN);

        this.content = "";
        this.commands = [];
        this.parameters = [];

        this.$insertRules();
    }

    parse() {
        const lexer_result = this.$lexer();

        this.content = lexer_result.content;

        let parse_command_rule = true;
        let current_rules = this.m_subcommandRules;

        let previous_rule = rules.RULE_TYPES.END;

        let index = 0;
        while(index < lexer_result.tokens.length) {
            const token = lexer_result.tokens[index];
            const type = lexer_result.types[index];

            let expected_token = current_rules.startRule;
            if(previous_rule == rules.RULE_TYPES.END) {
                
                if(!current_rules.matchStartToken(type))
                    throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

            } else
                expected_token = current_rules.nextRule(previous_rule, type);
            
            if(expected_token == rules.RULE_TYPES.NONE)
                throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
            
            if(expected_token == rules.RULE_TYPES.END && parse_command_rule) {
                current_rules = this.m_parameterRules;
                parse_command_rule = false;
                previous_rule = rules.RULE_TYPES.END;
                continue;
            }

            if(expected_token == rules.RULE_TYPES.COMMAND)
                this.commands.push(token);
            
            if(expected_token == rules.RULE_TYPES.PARAMETER)
                this.parameters.push(token);
            
            previous_rule = expected_token;
            index ++;
        }

        if(current_rules.nextRule(previous_rule, rules.TOKEN_TYPES.NONE) != rules.RULE_TYPES.END)
            throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);
    }

    /* private */
    $lexer() {
        const tokens = [];
        const types = [];

        let previous_type = rules.TOKEN_TYPES.NONE;
        let value = "";

        let encountered_first_space = false;
        let contains_parameters = false;

        let i;
        for(i=0;i<this.m_rawCommands.length;i++) {
            const c = this.m_rawCommands[i];
            const current_type = this.$getTokenType(c);
            
            if(c == "(")
                contains_parameters = true;
            
            if(c == " " && !encountered_first_space && !contains_parameters)
                encountered_first_space = true;
            
            else if(encountered_first_space && !contains_parameters) {

                if(c == "(") {
                    contains_parameters = true;
                    encountered_first_space = false;
                } else if(c != " ")
                    break;

            }

            if(current_type == rules.TOKEN_TYPES.NONE)
                throw new ERROR.InvalidStatementException(ERROR_MSG.CANNOT_PARSE);

            if(this.$onNextToken(previous_type, current_type) && i > 0) {
                tokens.push(value);
                types.push(previous_type);
                value = "";
            }

            value = this.$readCharAndUpdate(value, current_type, c);

            if(previous_type != rules.TOKEN_TYPES.STRING || current_type != rules.TOKEN_TYPES.WORD)
                previous_type = current_type;
            
            if(c == ")") {
                i ++;
                break;
            }
        }

        if(value.length > 0) {
            tokens.push(value);
            types.push(previous_type);
        }

        return {
            tokens: tokens,
            types: types,
            content: this.m_rawCommands.slice(i)
        };
    }

    $readCharAndUpdate(string, currentType, c) {
        let new_string = string;

        if(currentType == rules.TOKEN_TYPES.NONE)
            return new_string;
        
        if(currentType == rules.TOKEN_TYPES.SPACE)
            return c;
        
        new_string += c;
        return new_string;
    }

    $onNextToken(previousToken, currentToken) {
        if(previousToken == rules.TOKEN_TYPES.STRING && currentToken == rules.TOKEN_TYPES.WORD)
            return false;
        
        if(previousToken == rules.TOKEN_TYPES.WORD && currentToken == rules.TOKEN_TYPES.STRING)
            return false;
        
        return previousToken != currentToken;
    }

    $getTokenType(c) {
        if(this.$isLetter(c))
            return rules.TOKEN_TYPES.WORD;
        
        switch(c) {
            case "(":
                return rules.TOKEN_TYPES.PARENTHESIS_OPEN;

            case ")":
                return rules.TOKEN_TYPES.PARENTHESIS_CLOSE;

            case " ":
                return rules.TOKEN_TYPES.SPACE;

            case ".":
                return rules.TOKEN_TYPES.DOT;

            case "_":
                return rules.TOKEN_TYPES.STRING;
            
            default:
                return rules.TOKEN_TYPES.NONE;
        }
    }

    $isLetter(c) {
        const ascii_code = c.charCodeAt(0);
        if(ascii_code > 64 && ascii_code < 91) //upper case
            return true;
        
        if(ascii_code > 96 && ascii_code < 123) //lower case
            return true;
        
        return false;
    }

    $insertRules() {
        const rule_types = rules.RULE_TYPES;
        this.m_subcommandRules.addRule(rule_types.COMMAND, rule_types.DOT);
        this.m_subcommandRules.addRule(rule_types.COMMAND, rule_types.SPACE);
        this.m_subcommandRules.addRule(rule_types.COMMAND, rule_types.END);
        this.m_subcommandRules.addRule(rule_types.DOT, rule_types.COMMAND);
        this.m_subcommandRules.addRule(rule_types.SPACE, rule_types.END);

        this.m_parameterRules.addRule(rule_types.PARENTHESIS_OPEN, rule_types.SPACE);
        this.m_parameterRules.addRule(rule_types.SPACE, rule_types.PARENTHESIS_CLOSE);
        this.m_parameterRules.addRule(rule_types.SPACE, rule_types.PARAMETER);
        this.m_parameterRules.addRule(rule_types.PARAMETER, rule_types.SPACE);
        this.m_parameterRules.addRule(rule_types.PARAMETER, rule_types.PARENTHESIS_CLOSE);
        this.m_parameterRules.addRule(rule_types.PARENTHESIS_OPEN, rule_types.PARAMETER);
        this.m_parameterRules.addRule(rule_types.PARENTHESIS_OPEN, rule_types.PARENTHESIS_CLOSE);
        this.m_parameterRules.addRule(rule_types.PARENTHESIS_CLOSE, rule_types.END);
    }
}

module.exports = CommandParser;

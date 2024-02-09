import type { Token } from "../lexer/lexer";
import { TokenType } from "../lexer/lexer-types";
import type {
    ASTNode,
    AssignmentOperation,
    BinaryExpression,
    BlockStatement,
    ComparisonOperation,
    Expression,
    Identifier,
    IfStatement,
    NullLiteral,
    NumericLiteral,
    PrintStatement,
    Program,
    ReturnStatement,
    Statement,
    StringLiteral,
    UnaryMinusExpression,
    VarDeclaration,
} from "./parser-types";

export class Parser {
    private idx = 0;

    constructor(private tokens: Token[]) {}

    generateAST(): Program {
        const program = { type: "Program", body: [] } as Program;
        while (!this.isEOF()) {
            program.body.push(this.parseStatement());
        }
        return program;
    }

    private parseStatement(): Statement {
        switch (this.peek().type) {
            case TokenType.OpenCurly:
                return this.parseCodeBlock();
            case TokenType.If:
                return this.parseIfStatement();
            case TokenType.Print:
                return this.parsePrintStatement();
            case TokenType.Return:
                return this.parseReturnStatement();
            case TokenType.Let:
                return this.parseVarDeclaration();
            default:
                return this.parseExpression();
        }
    }

    private parseCodeBlock(): BlockStatement {
        this.dequeue(); // eat opening brace
        const body: ASTNode[] = [];
        while (!this.isEOF() && this.peek().type !== TokenType.CloseCurly) {
            body.push(this.parseStatement());
        }
        if (this.isEOF()) throw new SyntaxError("Ожидалось }");
        this.dequeue(); // eat closing brace
        return {
            type: "BlockStatement",
            body,
        };
    }

    private parseIfStatement(): IfStatement {
        this.dequeue(); // eat the If keyword

        if (this.peek().type !== TokenType.OpenParen) {
            throw new SyntaxError("Ожидалось (");
        }
        const condition = this.parseParenthesized() as ComparisonOperation;
        if (this.peek().type !== TokenType.OpenCurly) {
            throw new SyntaxError("Ожидалось {");
        }
        if (condition.type !== "ComparisonOperation") {
            throw new Error("Неверное сравнение в блоке ЕСЛИ - ИНАЧЕ");
        }

        const body = this.parseCodeBlock();
        let elseValue;
        if (this.peek().type === TokenType.Else) {
            this.dequeue(); // eat the Else keyword
            if (this.peek().type === TokenType.If) {
                elseValue = this.parseIfStatement();
            } else if (this.peek().type === TokenType.OpenCurly) {
                elseValue = this.parseCodeBlock();
            } else {
                throw new SyntaxError(
                    "Синтаксическая ошибка в блоке ЕСЛИ - ИНАЧЕ"
                );
            }
        }

        return { type: "IfStatement", condition, body, else: elseValue };
    }

    private parsePrintStatement(): PrintStatement {
        this.dequeue(); // eat the Print keyword
        const value = this.parseLeastPrecedent();
        this.expectSemicolon();
        return {
            type: "PrintStatement",
            value,
        };
    }

    private parseReturnStatement(): ReturnStatement {
        this.dequeue(); // eat the Return keyword
        let value;
        if (this.peek().type !== TokenType.Semicolon) {
            value = this.parseLeastPrecedent();
        }
        this.expectSemicolon();
        return {
            type: "ReturnStatement",
            value,
        };
    }

    private parseVarDeclaration(): VarDeclaration {
        this.dequeue(); // eat the Let keyword
        if (
            this.peek().type !== TokenType.Identifier ||
            this.peek(1).type !== TokenType.Assignment
        ) {
            throw new SyntaxError("Неверное объявление переменной");
        }
        const assignment = this.parseAssignment();
        this.expectSemicolon();
        return {
            type: "VarDeclaration",
            identifier: assignment.left,
            init: assignment,
        };
    }

    private parseExpression(): Expression {
        let result;
        if (this.peek(1).type === TokenType.Assignment) {
            result = this.parseAssignment();
        } else {
            result = this.parseLeastPrecedent();
        }
        this.expectSemicolon();
        return result;
    }

    private parseAssignment(): AssignmentOperation {
        if (this.peek().type !== TokenType.Identifier) {
            throw new SyntaxError("Неправильное присвоение");
        }
        const identifier = this.parseIdentifier();
        this.dequeue(); // eat the equals sign
        const value = this.parseLeastPrecedent();
        return {
            type: "AssignmentOperation",
            left: identifier,
            right: value,
        };
    }

    private readonly parseLeastPrecedent = this.parseComparison;

    private parseComparison(): Expression {
        return this.parseBinaryOperation(
            "ComparisonOperation",
            ["==", "===", "<", ">", "<=", ">=", "!=", "!=="],
            this.parseAdditive.bind(this)
        );
    }

    private parseAdditive(): Expression {
        return this.parseBinaryOperation(
            "MathOperation",
            ["+", "-"],
            this.parseMultiplicative.bind(this)
        );
    }

    private parseMultiplicative(): Expression {
        return this.parseBinaryOperation(
            "MathOperation",
            ["*", "/"],
            this.parsePrimary.bind(this)
        );
    }

    private parseBinaryOperation(
        operationType: string,
        operators: string[],
        lowerPrecedenceParser: () => Expression
    ): Expression {
        let left: Expression = lowerPrecedenceParser();
        while (operators.includes(this.peek().value)) {
            const operator = this.dequeue().value;
            const right = lowerPrecedenceParser();
            left = {
                type: operationType,
                left,
                right,
                operator,
            } as BinaryExpression;
        }
        return left;
    }

    private parsePrimary() {
        switch (this.peek().type) {
            case TokenType.Math: {
                if (this.peek().value === "-") {
                    return this.parseUnaryMinus();
                }
                throw new SyntaxError(
                    `Неожиданный символ: ${this.peek().value}`
                );
            }
            case TokenType.NumericLiteral:
                return this.parseNumericLiteral();
            case TokenType.StringLiteral:
                return this.parseStringLiteral();
            case TokenType.NullLiteral:
                return this.parseNullLiteral();
            case TokenType.OpenParen:
                return this.parseParenthesized();
            case TokenType.Identifier:
                return this.parseIdentifier();
            default:
                throw new SyntaxError(
                    `Неожиданный символ: ${this.peek().value}`
                );
        }
    }

    private parseUnaryMinus(): UnaryMinusExpression {
        this.dequeue(); // eat the minus sign
        const arg = this.parsePrimary();
        return { type: "UnaryMinusExpression", arg };
    }

    private parseNumericLiteral(): NumericLiteral {
        const token = this.dequeue();
        return {
            type: "NumericLiteral",
            value: parseFloat(token.value),
        };
    }

    private parseStringLiteral(): StringLiteral {
        const token = this.dequeue();
        return {
            type: "StringLiteral",
            value: token.value,
        };
    }

    private parseNullLiteral(): NullLiteral {
        const token = this.dequeue();
        return {
            type: "NullLiteral",
            value: token.value,
        };
    }

    private parseParenthesized(): Expression {
        this.dequeue(); // eat opening paren
        const expression = this.parseLeastPrecedent();
        if (this.peek().type === TokenType.CloseParen) {
            this.dequeue(); // eat closing paren
            return expression;
        } else {
            throw new SyntaxError("Ожидалось ).");
        }
    }

    private parseIdentifier(): Identifier {
        const token = this.dequeue();
        return {
            type: "Identifier",
            symbol: token.value,
        };
    }

    private expectSemicolon() {
        if (this.dequeue().type !== TokenType.Semicolon) {
            throw new SyntaxError("Выражения должны заканчиваться символом ;");
        }
    }

    private isEOF(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(ahead = 0): Token {
        return this.tokens[this.idx + ahead];
    }

    private dequeue(): Token {
        return this.tokens[this.idx++];
    }
}

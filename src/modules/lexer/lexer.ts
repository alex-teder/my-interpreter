import { TokenType } from "./lexer-types";
import { tokenDictionary } from "./token-dictionary";
import {
    isLegalIdentifier,
    isNumeric,
    isWhitespace,
    stringsByLen,
} from "./helpers";

export class Token {
    constructor(
        public type: TokenType,
        public value: string
    ) {}
}

export class Lexer {
    private idx = 0;

    constructor(private sourceCode: string) {}

    generateTokens(): Token[] {
        const tokens = [];

        while (this.idx < this.sourceCode.length) {
            if (isWhitespace(this.sourceCode[this.idx])) {
                this.idx++;
                continue;
            }

            const matchedToken = this.findMatchedToken();
            if (matchedToken) {
                if (matchedToken.type === TokenType.Comment) {
                    this.skipComment();
                } else {
                    tokens.push(matchedToken);
                    this.idx += matchedToken.value.length;
                }
                continue;
            }

            const numericLiteral = this.findNumericLiteral();
            if (numericLiteral) {
                tokens.push(
                    new Token(TokenType.NumericLiteral, numericLiteral)
                );
                continue;
            }

            const stringLiteral = this.findStringLiteral();
            if (stringLiteral !== null) {
                tokens.push(new Token(TokenType.StringLiteral, stringLiteral));
                continue;
            }

            const identifier = this.findIdentifier();
            if (identifier) {
                tokens.push(new Token(TokenType.Identifier, identifier));
                continue;
            }

            // ignore unknown symbols
            this.idx++;
        }

        tokens.push(new Token(TokenType.EOF, "\0"));
        return tokens;
    }

    private findMatchedToken(): Token | null {
        const remaining = this.sourceCode.slice(this.idx);
        for (const key of Object.keys(tokenDictionary).sort(stringsByLen)) {
            if (remaining.startsWith(key)) {
                const type = tokenDictionary[key];
                return { type, value: key };
            }
        }
        return null;
    }

    private skipComment(): void {
        do {} while (
            this.idx < this.sourceCode.length &&
            this.sourceCode[this.idx++] !== "\n"
        );
    }

    private findNumericLiteral(): string {
        let result = "";
        while (
            this.idx < this.sourceCode.length &&
            isNumeric(this.sourceCode[this.idx])
        ) {
            result += this.sourceCode[this.idx++];
        }
        return result;
    }

    private findStringLiteral(): string | null {
        let result = null;
        if (this.sourceCode[this.idx] === '"') {
            result = "";
            this.idx++;
            while (this.sourceCode[this.idx] !== '"') {
                if (
                    this.sourceCode[this.idx] === "\n" ||
                    this.idx >= this.sourceCode.length
                ) {
                    throw new SyntaxError('Ожидалось "');
                }
                result += this.sourceCode[this.idx++];
            }
            this.idx++;
        }
        return result;
    }

    private findIdentifier(): string {
        let result = "";
        while (
            this.idx < this.sourceCode.length &&
            isLegalIdentifier(this.sourceCode[this.idx])
        ) {
            result += this.sourceCode[this.idx++];
        }
        return result;
    }
}

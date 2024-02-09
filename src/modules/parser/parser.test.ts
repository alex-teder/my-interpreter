import { describe, it, expect } from "bun:test";
import type { Token } from "../lexer/lexer";
import { TokenType } from "../lexer/lexer-types";
import { Parser } from "./parser";
import type { MathOperation, PrintStatement } from "./parser-types";

describe("parser tests", () => {
    it("builds a tree", () => {
        // 5 + 3 / 2;
        const tokens: Token[] = [
            { type: TokenType.NumericLiteral, value: "5" },
            { type: TokenType.Math, value: "+" },
            { type: TokenType.NumericLiteral, value: "3" },
            { type: TokenType.Math, value: "/" },
            { type: TokenType.NumericLiteral, value: "2" },
            { type: TokenType.Semicolon, value: ";" },
            { type: TokenType.EOF, value: "\0" },
        ];

        const ast = new Parser(tokens).generateAST();
        expect(ast.body).toEqual([
            {
                type: "MathOperation",
                operator: "+",
                left: { type: "NumericLiteral", value: 5 },
                right: {
                    type: "MathOperation",
                    operator: "/",
                    left: { type: "NumericLiteral", value: 3 },
                    right: { type: "NumericLiteral", value: 2 },
                },
            } as MathOperation,
        ]);
    });

    it("handles parenthesized expressions", () => {
        // 5 + (3 - 2);
        const tokens: Token[] = [
            { type: TokenType.NumericLiteral, value: "5" },
            { type: TokenType.Math, value: "+" },
            { type: TokenType.OpenParen, value: "(" },
            { type: TokenType.NumericLiteral, value: "3" },
            { type: TokenType.Math, value: "-" },
            { type: TokenType.NumericLiteral, value: "2" },
            { type: TokenType.CloseParen, value: ")" },
            { type: TokenType.Semicolon, value: ";" },
            { type: TokenType.EOF, value: "\0" },
        ];

        const ast = new Parser(tokens).generateAST();
        expect(ast.body).toEqual([
            {
                type: "MathOperation",
                operator: "+",
                left: { type: "NumericLiteral", value: 5 },
                right: {
                    type: "MathOperation",
                    operator: "-",
                    left: { type: "NumericLiteral", value: 3 },
                    right: { type: "NumericLiteral", value: 2 },
                },
            } as MathOperation,
        ]);
    });

    it("parses complex if-statements", () => {
        const tokens: Token[] = [
            { type: TokenType.If, value: "если" },
            { type: TokenType.OpenParen, value: "(" },
            { type: TokenType.NumericLiteral, value: "3" },
            { type: TokenType.Math, value: ">" },
            { type: TokenType.NumericLiteral, value: "2" },
            { type: TokenType.CloseParen, value: ")" },
            { type: TokenType.OpenCurly, value: "{" },
            { type: TokenType.CloseCurly, value: "}" },
            { type: TokenType.Else, value: "иначе" },
            { type: TokenType.OpenCurly, value: "{" },
            { type: TokenType.CloseCurly, value: "}" },
            { type: TokenType.EOF, value: "\0" },
        ];
        const ast = new Parser(tokens).generateAST();
        expect(ast.body).toContainEqual({
            type: "IfStatement",
            condition: {
                type: "ComparisonOperation",
                operator: ">",
                left: {
                    type: "NumericLiteral",
                    value: 3,
                },
                right: {
                    type: "NumericLiteral",
                    value: 2,
                },
            },
            body: {
                type: "BlockStatement",
                body: [],
            },
            else: {
                type: "BlockStatement",
                body: [],
            },
        });
    });

    it("parses a print statement", () => {
        const tokens: Token[] = [
            { type: TokenType.Print, value: "напечатать" },
            { type: TokenType.StringLiteral, value: "привет!" },
            { type: TokenType.Semicolon, value: ";" },
            { type: TokenType.EOF, value: "\0" },
        ];
        const ast = new Parser(tokens).generateAST();
        expect(ast.body).toEqual([
            {
                type: "PrintStatement",
                value: { type: "StringLiteral", value: "привет!" },
            } as PrintStatement,
        ]);
    });
});

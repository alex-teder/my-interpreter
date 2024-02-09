import { describe, it, expect } from "bun:test";
import { Lexer } from "./lexer";
import { TokenType } from "./lexer-types";

describe("lexer tests", () => {
    it("adds EOF token at the end", () => {
        const source = "";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens.length).toBe(1);
        expect(tokens[0].type).toBe(TokenType.EOF);
    });

    it("parses single character tokens", () => {
        const source = "+ - * /";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({ value: "+", type: TokenType.Math });
        expect(tokens[1]).toEqual({ value: "-", type: TokenType.Math });
        expect(tokens[2]).toEqual({ value: "*", type: TokenType.Math });
        expect(tokens[3]).toEqual({ value: "/", type: TokenType.Math });
    });

    it("parses multicharacter tokens", () => {
        const source = "! !== != >=";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({ value: "!", type: TokenType.Exclamation });
        expect(tokens[1]).toEqual({ value: "!==", type: TokenType.Comparison });
        expect(tokens[2]).toEqual({ value: "!=", type: TokenType.Comparison });
        expect(tokens[3]).toEqual({ value: ">=", type: TokenType.Comparison });
    });

    it("identifies keywords", () => {
        const source = "ничто если иначе";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({
            value: "ничто",
            type: TokenType.NullLiteral,
        });
        expect(tokens[1]).toEqual({ value: "если", type: TokenType.If });
        expect(tokens[2]).toEqual({ value: "иначе", type: TokenType.Else });
    });

    it("parses numeric literals", () => {
        const source = "1 2 2.5 3.14";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({
            value: "1",
            type: TokenType.NumericLiteral,
        });
        expect(tokens[1]).toEqual({
            value: "2",
            type: TokenType.NumericLiteral,
        });
        expect(tokens[2]).toEqual({
            value: "2.5",
            type: TokenType.NumericLiteral,
        });
        expect(tokens[3]).toEqual({
            value: "3.14",
            type: TokenType.NumericLiteral,
        });
    });

    it("identifies string literals", () => {
        const source = '"Hello" "Hi"';
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({
            value: "Hello",
            type: TokenType.StringLiteral,
        });
        expect(tokens[1]).toEqual({
            value: "Hi",
            type: TokenType.StringLiteral,
        });
    });

    it("throws when quotaion is single", () => {
        const source = 'x = "hello;';
        const lexer = new Lexer(source);
        expect(() => lexer.generateTokens()).toThrow();
    });

    it("parses identifiers", () => {
        const source = "hello привет a1b2c3";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens[0]).toEqual({
            value: "hello",
            type: TokenType.Identifier,
        });
        expect(tokens[1]).toEqual({
            value: "привет",
            type: TokenType.Identifier,
        });
        expect(tokens[2]).toEqual({
            value: "a1b2c3",
            type: TokenType.Identifier,
        });
    });

    it("takes in a combination of tokens", () => {
        const source = "пусть x = (3.14 - 2) / y;";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens.length).toBe(12);
        expect(tokens[0]).toEqual({
            value: "пусть",
            type: TokenType.Let,
        });
        expect(tokens[1]).toEqual({
            value: "x",
            type: TokenType.Identifier,
        });
        expect(tokens[2]).toEqual({
            value: "=",
            type: TokenType.Assignment,
        });
        expect(tokens[3]).toEqual({
            value: "(",
            type: TokenType.OpenParen,
        });
        expect(tokens[4]).toEqual({
            value: "3.14",
            type: TokenType.NumericLiteral,
        });
        expect(tokens[5]).toEqual({
            value: "-",
            type: TokenType.Math,
        });
        expect(tokens[6]).toEqual({
            value: "2",
            type: TokenType.NumericLiteral,
        });
        expect(tokens[7]).toEqual({
            value: ")",
            type: TokenType.CloseParen,
        });
        expect(tokens[8]).toEqual({
            value: "/",
            type: TokenType.Math,
        });
        expect(tokens[9]).toEqual({
            value: "y",
            type: TokenType.Identifier,
        });
        expect(tokens[10]).toEqual({
            value: ";",
            type: TokenType.Semicolon,
        });
    });

    it("ignores comments", () => {
        const source = "3 + 5 - 1 // 3 + 5 - 1\n4 + 8 // hello";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens.length).toBe(9);
    });

    it("ignores unknown symbols", () => {
        const source = "3@ + 5 # - 1 ^// 3 + 5 - 1\n4 + |8 // hello";
        const lexer = new Lexer(source);
        const tokens = lexer.generateTokens();
        expect(tokens.length).toBe(9);
    });
});

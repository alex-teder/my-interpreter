import { Lexer } from "./modules/lexer/lexer";
import { Parser } from "./modules/parser/parser";
import { Runtime } from "./modules/runtime/runtime";

const file = Bun.file("text.txt");
const source = await file.text();

// const source = `пусть x = 1; вернуть x + 1;`;

const tokens = new Lexer(source).generateTokens();
const program = new Parser(tokens).generateAST();
console.clear();
// console.log(JSON.stringify(program, null, 1)); // Specify '2' for the depth level
new Runtime().runProgram(program);

import type * as AST from "../parser/parser-types";
import { runtimeBoolean } from "./values";

export class Runtime {
    private variables: Map<string, any> = new Map();
    private globalReturnFlag: boolean = false;
    private returnValue: any;

    runProgram(program: AST.Program) {
        this.log("Старт программы...");

        for (const node of program.body) {
            this.evalStatement(node);
            if (this.globalReturnFlag) break;
        }

        this.log("Программа завершена!");
        this.returnValue && this.log(`Результат: ${this.returnValue}`);
    }

    private evalStatement(node: AST.ASTNode) {
        switch (node.type) {
            case "IfStatement":
                return this.evalIfStatement(node as AST.IfStatement);
            case "BlockStatement":
                return this.evalCodeBlock(node as AST.BlockStatement);
            case "VarDeclaration":
                return this.evalVarDeclaration(node as AST.VarDeclaration);
            case "PrintStatement":
                return this.evalPrintStatement(node as AST.PrintStatement);
            case "ReturnStatement":
                return this.evalReturnStatement(node as AST.ReturnStatement);
            default:
                return this.evalExpression(node);
        }
    }

    private evalIfStatement(node: AST.IfStatement) {
        if (this.evalComparison(node.condition) === "истина") {
            this.evalCodeBlock(node.body);
        } else if (node.else?.type === "BlockStatement") {
            this.evalCodeBlock(node.else);
        } else if (node.else?.type === "IfStatement") {
            this.evalIfStatement(node.else);
        }
    }

    private evalCodeBlock(node: AST.BlockStatement) {
        for (const stmt of node.body) {
            this.evalStatement(stmt);
            if (this.globalReturnFlag) break;
        }
    }

    private evalVarDeclaration(node: AST.VarDeclaration): void {
        const name = node.identifier.symbol;
        if (this.variables.has(name)) {
            throw new EvalError("Неправильное объявление переменной.");
        }
        this.variables.set(name, undefined);
        this.evalAssignment(node.init);
    }

    private evalPrintStatement(node: AST.PrintStatement): void {
        const valueToPrint = this.evalExpression(node.value);
        this.log("вывод:", valueToPrint);
    }

    private evalReturnStatement(node: AST.ReturnStatement): void {
        let valueToReturn;
        if (node.value) {
            valueToReturn = this.evalExpression(node.value);
        }
        this.globalReturnFlag = true;
        this.returnValue = valueToReturn;
    }

    private evalExpression(node: AST.ASTNode) {
        switch (node.type) {
            case "Identifier":
                return this.evalIdentifier(node as AST.Identifier);
            case "NumericLiteral":
                return (node as AST.NumericLiteral).value;
            case "StringLiteral":
                return (node as AST.StringLiteral).value;
            case "MathOperation":
                return this.evalMath(node as AST.MathOperation);
            case "UnaryMinusExpression":
                return this.evalUnaryMinus(node as AST.UnaryMinusExpression);
            case "ComparisonOperation":
                return this.evalComparison(node as AST.ComparisonOperation);
            case "AssignmentOperation":
                return this.evalAssignment(node as AST.AssignmentOperation);
            default:
                throw new EvalError(`Неизвестное значение: ${node.type}`);
        }
    }

    private evalIdentifier(node: AST.Identifier) {
        if (!this.variables.has(node.symbol)) {
            throw new EvalError(`Неизвестный идентификатор ${node.symbol}`);
        }
        return this.variables.get(node.symbol);
    }

    private evalAssignment(node: AST.AssignmentOperation) {
        const name = node.left.symbol;
        if (!this.variables.has(name)) {
            throw new EvalError(`Неизвестный идентификатор ${name}`);
        }
        const value = this.evalExpression(node.right);
        this.variables.set(name, value);
    }

    private evalMath(node: AST.MathOperation): number {
        const { left, right, operator } = node;
        const leftValue = this.evalExpression(left);
        const rightValue = this.evalExpression(right);
        if (typeof leftValue !== "number" || typeof rightValue !== "number") {
            throw new EvalError(
                "Математические операции возможны только с числами"
            );
        }
        switch (operator) {
            case "+":
                return leftValue + rightValue;
            case "-":
                return leftValue - rightValue;
            case "*":
                return leftValue * rightValue;
            case "/":
                return leftValue / rightValue;
            case "%":
                return leftValue % rightValue;
            default:
                throw new EvalError(
                    `Неизвестный математический оператор: ${operator}`
                );
        }
    }

    private evalUnaryMinus(node: AST.UnaryMinusExpression): number {
        const arg = this.evalExpression(node.arg);
        if (typeof arg === "number") return -arg;
        else
            throw new EvalError(
                "Невозможно выполнить математическое отрицание"
            );
    }

    private evalComparison(
        node: AST.ComparisonOperation
    ): ReturnType<typeof runtimeBoolean> {
        const { left, right, operator } = node;
        const leftValue = this.evalExpression(left);
        const rightValue = this.evalExpression(right);
        if (typeof leftValue !== "number" || typeof rightValue !== "number") {
            throw new EvalError("Неправильное сравнение");
        }
        switch (operator) {
            case "==":
            case "===":
                return runtimeBoolean(leftValue === rightValue);
            case "!=":
            case "!==":
                return runtimeBoolean(leftValue !== rightValue);
            case "<":
                return runtimeBoolean(leftValue < rightValue);
            case ">":
                return runtimeBoolean(leftValue > rightValue);
            case "<=":
                return runtimeBoolean(leftValue <= rightValue);
            case ">=":
                return runtimeBoolean(leftValue >= rightValue);
            default:
                throw new EvalError(
                    `Неизвестный оператор сравнения: ${operator}`
                );
        }
    }

    private log(...output: any) {
        console.log(...output);
    }
}

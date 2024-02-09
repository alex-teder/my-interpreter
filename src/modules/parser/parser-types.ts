export interface ASTNode {
    type: string;
}

export interface Program extends ASTNode {
    type: "Program";
    body: ASTNode[];
}

export interface Statement extends ASTNode {}

export interface BlockStatement extends Statement {
    type: "BlockStatement";
    body: ASTNode[];
}

export interface IfStatement extends Statement {
    type: "IfStatement";
    condition: ComparisonOperation;
    body: BlockStatement;
    else?: IfStatement | BlockStatement;
}

export interface ReturnStatement extends Statement {
    type: "ReturnStatement";
    value?: ASTNode;
}

export interface PrintStatement extends Statement {
    type: "PrintStatement";
    value: Expression;
}

export interface VarDeclaration extends Statement {
    type: "VarDeclaration";
    identifier: Identifier;
    init: AssignmentOperation;
}

export interface Expression extends Statement {}

export interface UnaryExpression extends Expression {
    arg: ASTNode;
}

export interface UnaryMinusExpression extends UnaryExpression {
    type: "UnaryMinusExpression";
}

export interface Negation extends UnaryExpression {
    type: "Negation";
}

export interface BinaryExpression extends Expression {
    left: ASTNode;
    right: ASTNode;
    operator?: string;
}

export interface MathOperation extends BinaryExpression {
    type: "MathOperation";
}

export interface ComparisonOperation extends BinaryExpression {
    type: "ComparisonOperation";
}

export interface AssignmentOperation extends BinaryExpression {
    type: "AssignmentOperation";
    left: Identifier;
}

export interface Identifier extends ASTNode {
    type: "Identifier";
    symbol: string;
}

export interface NumericLiteral extends ASTNode {
    type: "NumericLiteral";
    value: number;
}

export interface StringLiteral extends ASTNode {
    type: "StringLiteral";
    value: string;
}

export interface NullLiteral extends ASTNode {
    type: "NullLiteral";
    value: string;
}

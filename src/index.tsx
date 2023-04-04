import { ActionPanel, Action, List } from "@raycast/api";
import Mexp from "math-expression-evaluator";
import { useState } from "react";

function evaluateExpression(expression: string, onDice: (diceExp: string, diceValues: number[], diceType: string, diceResult: number) => void) {
    try {
        // create a function to fetch dice patterns from the expression and replace with the result of the dice in a sequence, returning the final expression to be evaluated
        const dicePattern = /(\d*)(d|h|l)(\d+)/g;
        const diceReplace = (match: string, p1: string, p2: string, p3: string) => {
            const diceCount = p1 ? parseInt(p1) : 1;
            const diceSize = parseInt(p3);
            const diceType = p2 == "l" ? "min" : p2 == "h" ? "max" : "sum";

            const values = [];
            for (let i = 0; i < diceCount; i++) {
                const diceValue = Math.floor(Math.random() * diceSize) + 1;
                values.push(diceValue);
            }
            let result = 0;
            if (diceType == "sum") {
                result = values.reduce((a, b) => a + b, 0);
            } else if (diceType == "min") {
                result = Math.min(...values);
            } else if (diceType == "max") {
                result = Math.max(...values);
            }

            onDice(match, values, diceType, result);
            return result.toString();
        };
        const toCalc = expression.replace(dicePattern, diceReplace);
        const mexp = new Mexp;
        return mexp.eval(toCalc, [], {});
    } catch {
        return null;
    }
}

function evaluateRoll(expression: string) {
    const roll : Roll = {
        expression: expression,
        explanation: [],
        result: 0
    };

    roll.result = evaluateExpression(expression, (diceExp, diceValues, diceType, result) => {
        roll.explanation.push({
            expression: diceExp,
            type: diceType,
            values: diceValues,
            result: result
        });
    });
    return roll;
}

type DiceResults = {
    expression: string,
    type: string,
    values: number[],
    result: number
}

type Roll = {
    expression: string;
    explanation: DiceResults[];
    result: number | null;
}

export default function RPGRoll() {
    const [expression, setExpression] = useState<string | null>(null);
    const [instruction, setInstruction] = useState<string | null>(null);
    const [rolls, setRolls] = useState<Roll[] | null>(null);

    const handleOnTextChange = (value = "") => {
        if (value == "") return;
        setExpression(value);
        setInstruction("Press enter to Roll");
    };

    const rollDices = () => {
        if (expression) {
            setRolls(expression.split(";").map((rollExp) => evaluateRoll(rollExp.trim())));
        }
    };

    return (
        <List
            filtering={false}
            onSearchTextChange={handleOnTextChange}
            navigationTitle="Dice Expression"
            searchBarPlaceholder={instruction ? instruction : "Input the dice expression to calculate i.e. d20 + 3"}
            actions={
                <ActionPanel title="Dice Expression">
                    <Action title="Roll" onAction={rollDices} />
                </ActionPanel>
            }
        >
            {rolls?.map((roll) => (
                <List.Item
                    key={roll.expression}
                    title={"Exp: " + roll.expression}
                    subtitle={roll ? "=> " + roll.result : "Invalid Expression"}
                    accessories={roll.explanation.map((diceResult) => {
                        return { text: { value: diceResult.expression + ": " + diceResult.type + "[" + diceResult.values.join(", ") + "] = " + diceResult.result} };
                    })}
                    actions={
                        <ActionPanel title="Dice Expression">
                            <Action title="Roll" onAction={rollDices} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
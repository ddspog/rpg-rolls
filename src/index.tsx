import { ActionPanel, Action, List } from "@raycast/api";
import Mexp from "math-expression-evaluator";
import { useState } from "react";

function evaluateExpression(expression: string) {
    const mext = new Mexp();

    try {
        return mext.eval(expression, [], { precision: 2 });
    } catch {
        return null;
    }
}

type Roll = {
    expression: string;
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
            const rolls: Roll[] = expression.split(";").map((rollExp) => {
                return {
                    expression: rollExp,
                    result: evaluateExpression(rollExp)
                };
            });
            setRolls(rolls);
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
                    subtitle={roll.result ? "=> " + roll.result : "Invalid Expression"}
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
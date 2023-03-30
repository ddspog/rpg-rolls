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

export default function RPGRoll() {
  const [expression, setExpression] = useState<string | null>(null);
  const [result, setResult] = useState<number | string | null>(null);

  const handleOnTextChange = (value = "") => {
    if (value == "") return;
    setExpression(value);
    setResult("Press enter to Roll");
  };

  const rollDices = () => {
    if (expression) setResult(evaluateExpression(expression));
  };

  return (
    <List
      filtering={false}
      onSearchTextChange={handleOnTextChange}
      navigationTitle="Dice Expression"
      searchBarPlaceholder="Input the dice expression to calculate i.e. d20 + 3"
    >
      <List.Item
        title={"Exp: " + expression}
        subtitle={result ? "=> " + result : "Invalid Expression"}
        actions={
          <ActionPanel title="Dice Expression">
            <Action title="Roll" onAction={rollDices} />
          </ActionPanel>
        }
      />
    </List>
  );
}

type ImportStatement = string;

export function getImportStatementsOutput(imports: ImportStatement[]): string {
  return imports.join('\n');
}

export function replaceNestedReactTypes(input: string): string {
  const { outputWithReplacedReactUsages } = getReactImports(input);
  return outputWithReplacedReactUsages;
}

export function getImportStatements(
  originalText: string,
  outputText: string
): ImportStatement[] {
  const importStatements = originalText.match(/import.*?;/g);
  if (!importStatements) return [];

  const { usedImports } = getReactImports(outputText);

  const toReplace: Record<string, string> = {
    [`from 'prop-types';`]: '',
    [`from 'react';`]: `import React, { ${usedImports.join(
      ', '
    )} } from 'react';`,
  };
  const toReplaceKeys = Object.keys(toReplace);
  const imports = Array.from(importStatements);

  const replacedImports = imports
    .map((importStatement) => {
      const line = importStatement.trim();
      const key = toReplaceKeys.find((s) => line.endsWith(s));
      return toReplace[key as string] ?? line;
    })
    .filter((s) => s !== "import React, {  } from 'react';")
    .filter(Boolean);

  return replacedImports;
}

function getReactImports(outputText: string) {
  const possibleValues = [
    'Component',
    'FC',
    'Fragment',
    'FunctionComponent',
    'ReactElement',
    'ReactNode',
    'useCallback',
    'useContext',
    'useDeferredValue',
    'useEffect',
    'useId',
    'useLayoutEffect',
    'useMemo',
    'useReducer',
    'useRef',
    'useState',
    'useSyncExternalStore',
    'useTransition',
  ];
  const typeOnlyImports = ['ReactElement', 'ReactNode'];

  const regex = new RegExp(`(React\.)?(${possibleValues.join('|')})`, 'g');
  const usedImports: string[] = [];

  const outputWithReplacedReactUsages = outputText.replaceAll(
    regex,
    (_entireMatch, _$0, $1) => {
      const value = typeOnlyImports.includes($1) ? `type ${$1}` : $1;
      usedImports.push(value);
      return $1;
    }
  );

  return {
    usedImports: [...new Set(usedImports)],
    outputWithReplacedReactUsages,
  };
}

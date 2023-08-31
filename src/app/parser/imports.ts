type ImportStatement = string;

export function getImportStatementsOutput(imports: ImportStatement[]): string {
  return imports.join('\n');
}

export function getImportStatements(
  originalText: string,
  outputText: string
): ImportStatement[] {
  const importStatements = originalText.match(/import.*?;/g);
  if (!importStatements) return [];

  const imports = Array.from(importStatements);

  const reactImportsUsed = getReactImports(outputText);
  const toReplace: Record<string, string | (() => string)> = {
    [`from 'prop-types';`]: '',
    [`from 'react';`]: `import React, { useState } from 'react';`,
  };
  const [toReplaceKeys, toReplaceValues] = Object.entries(toReplace);

  const replacedImports = imports
    .map((importStatement) => {
      const line = importStatement.trim();
      const i = toReplaceKeys.findIndex((s) => line.endsWith(s));
      if (~i) {
        const replacement = toReplaceValues[i];
        if (typeof replacement === 'string') return replacement;
        else return replacement();
      }
      return line;
    })
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

  const regex = new RegExp(`(React\.)?(${possibleValues.join('|')})`, 'g');
  const usedImports: string[] = [];
  const matches = outputText.replaceAll(regex, (_entireMatch, _$0, $1) => {
    usedImports.push($1);
    return $1;
  });
  return [...new Set(usedImports)];
}

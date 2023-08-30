type ImportStatement = string;

export function getImportStatementsOutput(imports: ImportStatement[]): string {
  return imports.join('\n');
}

export function getImportStatements(text: string): ImportStatement[] {
  const importStatements = text.match(/import.*?;/g);
  if (!importStatements) return [];

  const imports = Array.from(importStatements);

  const toReplace: Record<string, string> = {
    [`import PropTypes from 'prop-types';`]: "",
    [`import React from 'react';`]: `import React, { useState } from 'react';`,
  };

  const replacedImports = imports.map(importStatement => toReplace[importStatement.trim()] ?? importStatement).filter(Boolean);

  return replacedImports;
}

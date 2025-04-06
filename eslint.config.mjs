import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    files: ["./src/**/*.js", "./src/**/*.jsx", "./src/**/*.ts", "./src/**/*.tsx"],
    extends: compat.extends(
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        parser: tsParser,
        ecmaVersion: 2018,
        sourceType: "script",
    },

    rules: {
        "@typescript-eslint/explicit-function-return-type": ["warn", {
            allowExpressions: true,
        }],

        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-angle-bracket-type-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/prefer-interface": "off",
        "@typescript-eslint/indent": "off",
    },
}, {
    files: ["**/*.test.ts", "**/*.spec.ts"],

    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/interface-name-prefix": "off",
    },
}]);
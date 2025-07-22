import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js },
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser
        },
        rules: {
            "prefer-const": "off"
        }
    },
    {
        files: ["**/*.json"],
        ignores: [
            "package-lock.json",
            "tsconfig.json"
        ],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"]
    }
])

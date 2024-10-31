# Debugging in Visual Studio Code

This package can also be used with Visual Studio Code's built-in debugging
tools. You just need to add a `launch.json` to the project containing your local
action. The following can be used as an example.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Local Action",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "local-action",
      "cwd": "${workspaceRoot}",
      "args": [".", "src/main.ts", ".env"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    }
  ]
}
```

In the `args` section, make sure to specify the appropriate path, entrypoint,
and dotenv file path. After that, you can add breakpoints to your action code
and start debugging!

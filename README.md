# lit-state
A reactive state management for LitElement

This package contains no Javascript. You have to compile to JS first. If you use webpack's ts-loader you can just enable  "allowTsInNodeModules":

```
test: /\.ts$/,
use: {
    loader: 'ts-loader',
    options: {
        allowTsInNodeModules: true
    }
}
```

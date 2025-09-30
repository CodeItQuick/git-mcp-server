Always use dependency injection. For example:

# Dependency Injection
## Pattern A - Always Use 

Always use this format when possible:
```ts
const someFunction = (dependencyInjectedDependency) => {
    
}
```

## Pattern B - Never Use

Never use this format, and refactor it to pattern (A) whenever you see it:

```ts
const someFunction = () => {
    const dependnecy = new dependencyInjectedDependency();
}
```

## Pattern C - Never Use

Never use this format, and refactor it to pattern (A) whenever you see it:

```ts
const someFunction = () => {
    const dependnecy = dependencyInjectedDependency();
}
```

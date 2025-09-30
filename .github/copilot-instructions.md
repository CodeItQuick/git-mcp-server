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
    const dependency = dependencyInjectedDependency();
}
```

# MongoClient Testable Design Pattern

Always use this pattern to make mongoclient more testable:

```ts
// IMongoClient file
export interface IDatabase {
    collection(collectionName: string): {
        deleteMany: (filter: any) => Promise<any>;
        insertMany: (docs: any[]) => Promise<any>;
        find: (param: { repository: string }) => FindCursor;
    };
}

export interface IMongoClient {
    connect(): Promise<void>;
    db(dbName: string): IDatabase;
    close(): Promise<void>;
}

// Current function being tested in separate file
const someFunction = (client: IMongoClient = new MongoClient("mongodb://localhost:27017/") as unknown as IMongoClient) => {
    
}

```
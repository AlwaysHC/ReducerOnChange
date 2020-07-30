# ReducerOnChange

## Set
To set the entire hook value
```typescript
setDatoUtente({ type: "Set", Value: "Valore" });
```

## OnChangeFromValue
To set a value inside the hook.
Name contains the path to reach the field to update: "Field1", "Class2.Field3", "Array4[3]", "Array5[5].Field6", ...
```typescript
setDatoUtente({ type: "OnChangeFromValue", Name: "Nome", Value: "Valore" });
onClick={() => setDatoUtente({ type: "OnChangeFromValue", Name: "Nome", Value: "Valore" });}
```

## OnChangeFromForm and OnChangeFromEvent
OnChangeFromForm and OnChangeFromEvent are similar and have to be used with form's tags.
OnChangeFromEvent requires the copy of the event because of React works asynchronously and the "e" object may have already been destroyed when React will read it
```typescript
onChange={(e) => setDatoUtente({ type: "OnChangeFromForm", Event: e.currentTarget })}
onChange={(e) => setDatoUtente({ type: "OnChangeFromEvent", Event: Object.assign({}, e) })}
```

## OnChangeFromHybrid
OnChangeFromHybrid exists for compatibility with BaseComponent and BasePureComponent. NameEvent can be a string or an event
```typescript
onChange={(e) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: "Nome", Value: "Valore" })}
onChange={(e, v) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: e, Value: v })}
onChange={(e, v) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: Object.assign({}, e), Value: v })}
```

## Components
IReducerParentProps permits to create components that manages a subset of the parent data
Instead of:
```typescript
const TestComponentTest1: React.FC<interface/class> = (props) => {
```
You can use:
```typescript
const TestComponentTest1: React.FC<IReducerParentProps<interface/class>> = (props) => {
    const [Parent, setParent] = [props.Reducer, props.setReducer];
```
Parent will contain the same data of the parent component (based on the interface/class)
The function FieldName returns the correct path for the field's name
```html
<input type="text" value={Parent.F} id={FieldName(props, "F")} onChange={(e) => setParent({ Type: "OnChangeFromForm", Event: e.currentTarget })} />
```

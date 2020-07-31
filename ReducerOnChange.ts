import * as React from "react";
import moment from "moment";
import * as Glob from "../Globale";

//To set the entire hook value
//setDatoUtente({ type: "Set", Value: "Valore" });

//To set a value inside the hook.
//Name contains the path to reach the field to update: "Field1", "Class2.Field3", "Array4[3]", "Array5[5].Field6", ...
//setDatoUtente({ type: "OnChangeFromValue", Name: "Nome", Value: "Valore" });
//onClick={() => setDatoUtente({ type: "OnChangeFromValue", Name: "Nome", Value: "Valore" });}

//OnChangeFromForm and OnChangeFromEvent are similar and have to be used with form's tags.
//OnChangeFromEvent requires the copy of the event because of React works asynchronously and the "e" object may have already been destroyed when React will read it
//onChange={(e) => setDatoUtente({ type: "OnChangeFromForm", Target: e.currentTarget })}
//onChange={(e) => setDatoUtente({ type: "OnChangeFromEvent", Event: Object.assign({}, e) })}

//OnChangeFromHybrid exists for compatibility with BaseComponent and BasePureComponent. NameEvent can be a string or an event
//onChange={(e) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: "Nome", Value: "Valore" })}
//onChange={(e, v) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: e, Value: v })}
//onChange={(e, v) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: Object.assign({}, e), Value: v })}

//IReducerParentProps permits to create components that manages a subset of the parent data
//Instead of:
//const TestComponentTest1: React.FC<interface/class> = (props) => {
//You can use:
//const TestComponentTest1: React.FC<IReducerParentProps<interface/class>> = (props) => {
//    const [Parent, setParent] = [props.Reducer, props.setReducer];
//Parent will contain the same data of the parent component (based on the interface/class)
//The function FieldName returns the correct path for the field's name
//<input type="text" value={Parent.F} id={FieldName(props, "F")} onChange={(e) => setParent({ Type: "OnChangeFromForm", Event: e.currentTarget })} />

interface IReducerActionOnChangeFrontEvent<Type> {
    Type: "OnChangeFromEvent";
    Event: React.FormEvent<any>;
}

type TTarget = EventTarget & (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);

interface IReducerActionOnChangeFromForm<Type> {
    Type: "OnChangeFromForm";
    Target: TTarget;
}

interface IReducerActionOnChangeFromValue<Type> {
    Type: "OnChangeFromValue";
    Name: string;
    Value: any;
}

interface IReducerActionOnChangeFromHybrid<Type> {
    Type: "OnChangeFromHybrid";
    NameEvent: React.FormEvent<any> | string;
    Value?: any;
}

interface IReducerActionSet<Type> {
    Type: "Set";
    Value: Type;
}

export interface IReducerParentProps<Type> {
    Reducer: Type;
    ClassName: string;
    setReducer: React.Dispatch<ReducerAction<any>>;
}

export function FieldName<Type>(props: IReducerParentProps<Type>, fieldName: string): string {
    if (props.ClassName === "") {
        return fieldName;
    } else {
        return props.ClassName + "." + fieldName;
    }
}

export type ReducerAction<Type> =
    | IReducerActionOnChangeFromForm<Type>
    | IReducerActionOnChangeFrontEvent<Type>
    | IReducerActionOnChangeFromValue<Type>
    | IReducerActionOnChangeFromHybrid<Type>
    | IReducerActionSet<Type>;

function SetValueConvert(value: any, type: string): any {
    //TODO Gestire i nullable, e gli altri tipi mancanti
    switch (type.toLowerCase()) {
        case "boolean":
            return value || value === "true";
        case "number":
            return value * 1;
        //case "date": //Non dovrebbe servire, Date non è un tipo base
        //    return moment(valore).toDate;
        case "string":
            return value;
        case "undefined": //Caso di nuove voci in un dictionary
            Glob.Log(Glob.LogCat.Reducer, false, "SetValueConvert: tipo non definito", value, type);
            return value;
        default:
            if (value instanceof Date) {
                return value;
            } else {
                if (value === undefined) {
                    return undefined;
                } else {
                    Glob.Log(Glob.LogCat.Reducer, true, "SetValueConvert: tipo non gestito", value, type);
                    return value;
                }
            }
    }
}

function SetValue(object: any, propertyList: string[], value: any, numberOfCycles: number): boolean {
    Glob.Log(Glob.LogCat.Reducer, false, "SetValue (" + numberOfCycles + ",ingresso)", object, propertyList, value);
    if (propertyList.length > 0) {
        for (const P in object) {
            let Prop: string = propertyList[0];
            const Dict: boolean = Prop.indexOf("[") > -1;
            let Keys: string[] = [];
            if (Dict) {
                Keys = Prop.split("[");
                Keys.shift();
                for (const C in Keys) {
                    Keys[C] = Keys[C].substring(0, Keys[C].indexOf("]"));
                }
                Prop = Prop.substring(0, Prop.indexOf("["));
            }

            if (P === Prop) {
                if (propertyList.length > 1) {
                    propertyList.shift();
                    let Found = false;
                    if (Dict) {
                        switch (Keys.length) {
                            case 1:
                                Found = SetValue(object[P][Keys[0]], propertyList, value, numberOfCycles + 1);
                                break;
                            case 2:
                                Found = SetValue(object[P][Keys[0]][Keys[1]], propertyList, value, numberOfCycles + 1);
                                break;
                            case 3:
                                Found = SetValue(object[P][Keys[0]][Keys[1]][Keys[2]], propertyList, value, numberOfCycles + 1);
                                break;
                            default:
                                Glob.Log(Glob.LogCat.Reducer, true, "SetValue (" + numberOfCycles + ",troppe voci di dizionario-1)", object, propertyList, value);
                                break;
                        }
                    } else {
                        Found = SetValue(object[P], propertyList, value, numberOfCycles + 1);
                    }
                    if (Found) {
                        Glob.Log(Glob.LogCat.Reducer, false, "SetValue (" + numberOfCycles + ",true-terminatore-2)", object, propertyList, value);
                        return true;
                    }
                } else {
                    if (Dict) {
                        switch (Keys.length) {
                            case 1:
                                object[P][Keys[0]] = SetValueConvert(value, typeof object[P][Keys[0]]);
                                break;
                            case 2:
                                object[P][Keys[0]][Keys[1]] = SetValueConvert(value, typeof object[P][Keys[0]][Keys[1]]);
                                break;
                            case 3:
                                object[P][Keys[0]][Keys[1]][Keys[2]] = SetValueConvert(value, typeof object[P][Keys[0]][Keys[1]][Keys[2]]);
                                break;
                            default:
                                Glob.Log(Glob.LogCat.Reducer, true, "SetValue (" + numberOfCycles + ",troppe voci di dizionario)", object, propertyList, value);
                                break;
                        }
                    } else {
                        object[P] = SetValueConvert(value, typeof object[P]);
                    }
                    Glob.Log(Glob.LogCat.Reducer, false, "SetValue (" + numberOfCycles + ",true)", object, propertyList, value);
                    return true;
                }
            }
        }
    }
    Glob.Log(Glob.LogCat.Reducer, false, "SetValue (" + numberOfCycles + ",false)", object, propertyList, value);
    return false;
}

function GetValueFromEvent(event: TTarget): any {
    let Value: any = null;
    if ((event as HTMLInputElement).type === "checkbox") {
        Value = (event as HTMLInputElement).checked;
    } else if ((event as HTMLInputElement).type === "radio") {
        Value = event.value;
    } else if ((event as HTMLInputElement).type === "date") {
        if (event.value === "") {
            Value = undefined;
        } else {
            Value = new Date(moment(event.value, "YYYY-MM-DD").utc(true).valueOf());
        }
    } else {
        Value = event.value;
    }

    return Value;
}

function OnChangeReducer<Type>(data: Type, action: ReducerAction<Type>): Type {
    let R: Type = Array.isArray(data) ? Object.assign([], data) : Object.assign({}, data);
    switch (action.Type) {
        case "OnChangeFromEvent":
            //onChange={(e) => setDatoUtente({ type: "OnChangeFromEvent", Event: Object.assign({}, e) })}
            const Name = (action.Event.currentTarget.name === "") ? action.Event.currentTarget.id : action.Event.currentTarget.name;
            Glob.Log(Glob.LogCat.Reducer, false, "OnChangeFromEvent", Name, action.Event.currentTarget.value, action.Event.currentTarget, data);
            SetValue(R, Name.split("."), GetValueFromEvent(action.Event.currentTarget), 0);
            break;
        case "OnChangeFromForm":
            //onChange={(e) => setDatoUtente({ type: "OnChangeFromForm", Event: e.currentTarget })}
            Glob.Log(Glob.LogCat.Reducer, false, "OnChangeFromForm", action.Target.name, action.Target.value, action.Target, data);
            SetValue(R, action.Target.id.split("."), GetValueFromEvent(action.Target), 0);
            break;
        case "OnChangeFromHybrid":
            //onChange={(e) => setDatoUtente({ type: "OnChangeFromHybrid", NameEvent: ..., Value: ... })}
            if (typeof action.NameEvent == "string") {
                Glob.Log(Glob.LogCat.Reducer, false, "OnChangeFromHybrid-string", action.NameEvent, action.Value.value, data);
                SetValue(R, action.NameEvent.split("."), action.Value, 0);
            } else {
                const Name = action.NameEvent.currentTarget.name === "" ? action.NameEvent.currentTarget.id : action.NameEvent.currentTarget.name;
                Glob.Log(Glob.LogCat.Reducer, false, "OnChangeFromEvent-event", Name, action.NameEvent.currentTarget.value, action.NameEvent.currentTarget, data);
                SetValue(R, Name.split("."), GetValueFromEvent(action.NameEvent.currentTarget), 0);
            }
            break;
        case "OnChangeFromValue":
            //onChange={(e) => setDatoUtente({ type: "OnChangeFromValue", Name: "Nome", Value: "Valore" })}
            Glob.Log(Glob.LogCat.Reducer, false, "OnChangeFromValue", action.Name, action.Value, data);
            SetValue(R, action.Name.split("."), action.Value, 0);
            break;
        case "Set":
            R = action.Value;
            Glob.Log(Glob.LogCat.Reducer, false, "Set", action.Value);
            break;
    }
    return R;
}

///Fields: Dato.NomeCampo, Dato.NomeCampo1.NomeCampo2
///Array: Dato.NomeCampo[<Indice>], Dato.NomeCampo1[<Indice>].NomeCampo2
///Dictionary: Dato.NomeCampo[<Voce>], Dato.NomeCampo1[<Voce>].NomeCampo2
///It is possible to combine arrays and dictionaries: name={"Tipi[TipiAnag][" + dati.Dati[T].ID_Chiave + "].Selezionato"}
export default function useReducerOnChange<Type>(data: Type) {
    return React.useReducer<React.Reducer<Type, ReducerAction<Type>>>(OnChangeReducer, data);
}

export function useRoC<Type>(data: Type) {
    return React.useReducer<React.Reducer<Type, ReducerAction<Type>>>(OnChangeReducer, data);
}

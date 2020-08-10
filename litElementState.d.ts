import { DeepPartial, DeepReadonly } from 'ts-essentials';
import { Language } from '../translate.service';

export type LitElementStateSubscriptionFunction<P> = (
    value: StateChange<P>
) => void;

export interface StateChange<P> {
    readonly previous: DeepReadonly<P> | null
    readonly current: DeepReadonly<P> | null
}

export type CustomStateReducer = (state: State, partialClone: DeepPartial<ReducableState>) => State;
export type StateReducerMode = 'merge' | 'replace'

export interface SubscribeStateOptions {
    getInitialValue: boolean;
    autoUnsubscribe?: boolean;
}

export type ReducableState = State & {
    app: {
        _reducerMode?: StateReducerMode
        user: {
            _reducerMode?: StateReducerMode
        },
        loginError: {
            _reducerMode?: StateReducerMode
        }
    }
}

export interface State {
    app: {
        mobile: boolean;
        language: Language;
        previousRoute: string;
        currentRoute: string;
    }
    components: {
        main: {
        
        }
        page1: {
        
        },
        page2: {
        
        }
    }
}

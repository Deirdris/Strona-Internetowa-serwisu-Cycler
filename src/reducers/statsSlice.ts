import {ActionCreator, AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {
    collection,
    doc,
    DocumentData, FirestoreDataConverter,
    getDoc,
    getFirestore,
    QueryDocumentSnapshot,
    setDoc, SnapshotOptions,
    updateDoc
} from 'firebase/firestore';
import moment from "moment";
import {TrainingsEntry} from "./trainingSlice";

export interface StatsEntry {
    highestVelocity: number;
    overallDuration: number;
    overallDistance: number;
    allBurnedCalories: number;
    readonly averageVelocity: number;
}

export interface GlobalStatsEntry extends StatsEntry {
    trainingCount: number;
}

interface  MonthlyStatsEntry extends StatsEntry {
    month: string
}

interface  WeeklyStatsEntry extends StatsEntry {
    week: string
}

type Periods = 'global' | 'monthly' | 'weekly';

export type Stats = Record<Periods, StatsEntry | GlobalStatsEntry | MonthlyStatsEntry | WeeklyStatsEntry>

interface StatsState {
    stats: Stats | null;
    isFetched: boolean;
}

const initialState: StatsState = {
    stats: null,
    isFetched: false
}

export const statsSlice = createSlice({
    name: 'stats',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchStatsData: (state, action: PayloadAction<Stats>) => {
            const stats = action.payload;
            for(const key in stats){
                stats[key as keyof Stats] = {
                    ...stats[key as keyof Stats],
                    get averageVelocity() {
                        return this.overallDuration !== 0 ? (this.overallDistance / (this.overallDuration / 3600)) : 0;
                    }
                }
            }
            return {
                ...state,
                stats: action.payload,
                isFetched: true
            }
        }
    },
})

export function fetchStatsData(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchUserData(dispatch, getState) {
        if(getState().stats.isFetched)
            return;

        const db = getFirestore();
        const docSnapshot = await getDoc(doc(collection(db, `users/${userId}/stats`), '_'));
        const data = docSnapshot.data() as DocumentData;
        console.log(data);
        if(data && data.monthly.month !== moment(Date.now()).format('MMyyyy')){
            for(const key in data.monthly){
                if(key !== 'month') {
                    data.monthly[key] = 0;
                }
            }
            await updateDoc(doc(collection(db, `users/${userId}/stats`), '_'), {
                monthly: {
                    ...data.monthly,
                    month: moment(Date.now()).format('MMyyyy'),
                },
            });
        }

        if(data && data.weekly.monday !== moment().startOf('week').format('D').toString()){
            for(const key in data.weekly){
                if(key !== 'monday') {
                    data.weekly[key] = 0;
                }
            }
            await updateDoc(doc(collection(db, `users/${userId}/stats`), '_'), {
                weekly: {
                  ...data.weekly,
                    monday: moment().startOf('week').format('D').toString(),
                },
            });
        }

        dispatch({type: 'stats/fetchStatsData', payload: data});
    }
}

//export const { increment, decrement, incrementByAmount } = authSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectStats = (state: RootState) => state.stats.stats;

export default statsSlice.reducer
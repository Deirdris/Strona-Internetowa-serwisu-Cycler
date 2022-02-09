import {AnyAction, createSlice, PayloadAction, ThunkAction} from '@reduxjs/toolkit'
import {RootState} from "../store";
import {collection, doc, DocumentData, getDoc, getDocs, getFirestore, query, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, orderBy, limit} from 'firebase/firestore';
import firebase from "firebase/compat";
import moment, {Moment} from "moment";

interface BaseTraining {
    placement: number;
    averageVelocity: number;
    calories: number;
    distance: number;
    duration: string;
    name: string;
    id: string;
}

export interface TrainingsEntry extends BaseTraining{
    dateEnd: number;
    dateStart: number;
}

export interface TrainingWithDate extends BaseTraining{
    dateEnd: Moment;
    dateStart: Moment;
}

export type Trainings = TrainingsEntry[];

interface TrainingState {
    trainings: Trainings | null;
}

const initialState: TrainingState = {
    trainings: null,
}

export const trainingsSlice = createSlice({
    name: 'trainings',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchTrainingData: (state, action: PayloadAction<Trainings>) => {
            return {
                ...state,
                trainings: action.payload,
            }
        }
    },
})

const trainingConverter = {
    toFirestore(training: TrainingsEntry) {
        return {
            ...training,
            dateStart: new Date(training.dateStart),
            dateEnd: new Date(training.dateEnd),
        };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): TrainingsEntry {
        const training = snapshot.data();
        training.dateStart = training.dateStart.toDate().getTime();
        training.dateEnd = training.dateEnd.toDate().getTime();
        return training as TrainingsEntry;
    }
} as FirestoreDataConverter<TrainingsEntry>;

export function fetchTrainingData(userId: string, isAll: boolean): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchTrainingData(dispatch) {
        const db = getFirestore();
        const querySnapshot = isAll ? await getDocs(query(collection(db, `users/${userId}/trainings`), orderBy("dateStart", "desc")).withConverter(trainingConverter))
                : await getDocs(query(collection(db, `users/${userId}/trainings`), orderBy("dateStart", "desc"), limit(1)).withConverter(trainingConverter));

        dispatch({type: 'trainings/fetchTrainingData', payload: querySnapshot.docs.map((e) => e.data())});
    }
}

// Other code such as selectors can use the imported `RootState` type
export const selectTrainings = (state: RootState) => state.trainings.trainings?.map((training) => {
    return {
        ...training,
        dateStart: moment(training.dateStart),
        dateEnd: moment(training.dateEnd),
    } as TrainingWithDate
})!;

export default trainingsSlice.reducer
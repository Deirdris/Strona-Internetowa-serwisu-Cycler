import moment, {Moment} from "moment";
import {
    collection, doc, documentId, FirestoreDataConverter,
    getDocs,
    getFirestore, limit,
    query,
    QueryDocumentSnapshot, setDoc,
    SnapshotOptions,
    where
} from "firebase/firestore";
import {AnyAction, createSlice, PayloadAction, ThunkAction} from "@reduxjs/toolkit";
import {Friends, FriendWithDate} from "./friendsSlice";
import {RootState} from "../store";
import {getAuth} from "firebase/auth";

export interface BaseMessage {
    id: string;
    text: string;
    uid: string;
}

export interface Message extends BaseMessage {
    createdAt: number;
}

export interface MessageWithDate extends BaseMessage {
    createdAt: Moment;
}

export interface BaseChat {
    id: string;
    users: string[];
    usersMap: Record<string, boolean>;
}

export interface Chat extends BaseChat {
    lastMessage?: Message;
}

export interface ChatWithDate extends BaseChat {
    lastMessage?: MessageWithDate;
}

const initialState = {
    chats: {} as Record<string, Chat>,
}

export const messageConverter = {
    toFirestore(message: Message) {
        const { id, ...data } = message;
        return {
            ...data,
            createdAt: new Date(message.createdAt),
        }
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Message {
        const message = snapshot.data({ serverTimestamps: 'estimate' });
        message.id = snapshot.id;
        message.createdAt = message.createdAt.toDate().getTime();
        return message as Message;
    }
} as FirestoreDataConverter<Message>;

export const chatConverter = {
    toFirestore(chat: Chat) {
        const lastMessage = chat.lastMessage && {
            ...chat.lastMessage,
            createdAt: new Date(chat.lastMessage.createdAt),
        };
        const {id, ...chatData} = chat;
        return {
            ...chatData,
            lastMessage: lastMessage,
        }
    },

    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Chat {
        const chat = snapshot.data({ serverTimestamps: 'estimate' });
        chat.id = snapshot.id;
        if (chat.lastMessage) {
            chat.lastMessage.createdAt = chat.lastMessage.createdAt.toDate().getTime();
        }
        return chat as Chat;
    }
} as FirestoreDataConverter<Chat>;

export const chatsSlice = createSlice({
    name: 'chats',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        fetchChats: (state, action: PayloadAction<Record<string, Chat>>) => {
            return {
                ...state,
                chats: {
                    ...state.chats,
                    ...action.payload,
                }
            }
        }
    },
});

export function createChat(userId: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function createChat(dispatch) {
        const db = getFirestore();
        const auth = getAuth();
        const uid = auth.currentUser!.uid;
        const chat = {
            users: [userId, uid],
            usersMap: {
                [userId]: true,
                [uid]: true,
            }
        } as Chat;
        const newChatDoc = doc(collection(db, 'chats'));
        await setDoc(newChatDoc, chat);
        chat.id = newChatDoc.id;

        dispatch({ type: 'fetchChats', payload: { [userId]: chat }});
    }
}

export function fetchChats(userIds: string[]): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return async function fetchChats(dispatch) {
        const db = getFirestore();

        const chats: Record<string, Chat> = {};
        const auth = getAuth();
        const uid = auth.currentUser!.uid;

        await Promise.all(userIds.map(async (userId) => {
            const docs = await getDocs(query(collection(db, 'chats'), where(`usersMap.${uid}`, '==', true), where(`usersMap.${userId}`, '==', true), limit(1)).withConverter(chatConverter));
            const chatDoc = docs.docs[0];
            let chat;
            if (!chatDoc) {
                chat = {
                    users: [userId, uid],
                    usersMap: {
                        [userId]: true,
                        [uid]: true,
                    }
                } as Chat;
                const newChatDoc = doc(collection(db, 'chats'));
                await setDoc(newChatDoc, chat);
                chat.id = newChatDoc.id;
            } else {
                chat = docs.docs[0].data();
            }
            chats[userId] = chat;
        }));

        dispatch({type: 'chats/fetchChats', payload: chats});
    }
}

export const selectChats = (state: RootState) => Object.fromEntries(Object.entries(state.chats.chats).map(([key, chat]) => {
    const lastMessage = chat.lastMessage && {
        ...chat.lastMessage,
        createdAt: moment(chat.lastMessage.createdAt),
    };
    return [
        key,
        {
            ...chat,
            lastMessage,
        } as ChatWithDate
    ];
}))!;

export default chatsSlice.reducer
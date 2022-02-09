import React, {useEffect, useState, UIEvent, useRef, MutableRefObject} from 'react';
import {
    Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle,
    Divider,
    Grid, IconButton, InputAdornment, TextField,
} from "@mui/material";

import '../styles/FriendsSection.scss';
import '../styles/StartingSection.scss';
import Navbar from "./Navbar";
import {useDebounce} from "use-debounce";
import {
    arrayUnion,
    arrayRemove,
    collection,
    doc,
    getDocs,
    getFirestore,
    limit,
    query,
    setDoc,
    updateDoc,
    onSnapshot,
    where, documentId, serverTimestamp, orderBy, Unsubscribe, DocumentData, deleteDoc
} from "firebase/firestore";

import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import {getAuth} from "firebase/auth";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "../store";
import {fetchUserData, selectUser} from "../reducers/authSlice";
import {fetchTrainingData} from "../reducers/trainingSlice";
import {fetchInviteData, selectInvites} from "../reducers/inviteSlice";
import {fetchFriendsData, FriendsEntry, FriendWithDate, selectFriends} from "../reducers/friendsSlice";
import {
    chatConverter,
    ChatWithDate,
    createChat,
    fetchChats,
    messageConverter,
    MessageWithDate,
    selectChats
} from "../reducers/chatsSlice";
import SendIcon from "@mui/icons-material/Send";
import moment from "moment";

function FriendsSection() {
    const dispatch = useDispatch<AppDispatch>();
    const [invitesFetched, setInvitesFetched] = useState(false);
    const [friendsFetched, setFriendsFetched] = useState(false);
    const [openProfile, setOpenProfile] = useState("");
    const [openDeleteFriend, setOpenDeleteFriend] = useState("");
    const [openedChat, setOpenedChat] = useState<ChatWithDate | undefined>(undefined);
    const [openedChatFriendInfo, setOpenedChatFriendInfo] = useState<FriendWithDate | undefined>(undefined);
    const auth = getAuth();
    const invites = useSelector(selectInvites);
    const friends = useSelector(selectFriends);
    const chats = useSelector(selectChats);
    const user = useSelector(selectUser);
    const db = getFirestore();

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(collection(db, 'users'), auth.currentUser!.uid), () => {
            dispatch(fetchInviteData(auth.currentUser!.uid)).then(() => {
                setInvitesFetched(true);
            });
            dispatch(fetchFriendsData(auth.currentUser!.uid)).then(async () => {
                setFriendsFetched(true);
            });
        });

        return () => {
            unsubscribe();
        }

    }, []);

    const handleClickOpenProfile = (id: string) => {
        setOpenProfile(id);
    };

    const handleCloseProfile = (id: string) => {
        setOpenProfile("");
    };

    const handleClickOpenDeleteFriend = (id: string) => {
        setOpenDeleteFriend(id);
    };

    const handleCloseDeleteFriend = (id: string) => {
        setOpenDeleteFriend("");
    };

    return (
        <>
            <Navbar/>
            <section className="startingSection">
                <Grid sx={{flex: 1, height: "100%"}} container spacing={4}>
                    <Grid item xs={4} sx={{height: "100%"}}>
                        <Box sx={{display: "flex", flexDirection: "column", flexWrap: "nowrap"}}
                             className="item friends-item">
                            <SearchBar/>
                            <Divider sx={{marginTop: '2.25rem', bgcolor: '#36454F'}}/>
                            <Box sx={{
                                fontSize: '1.25rem',
                                letterSpacing: 1,
                                paddingTop: '2.25rem',
                                textAlign: "center",
                                paddingBottom: "2.25rem"
                            }}>
                                Zaproszenia do znajomych
                            </Box>
                            <Box sx={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                flexBasis: "0%",
                                minHeight: 0,
                                height: "auto",
                                overflow: "auto",
                            }} className="scroll">
                                {invites && invites.map((invite) =>
                                    <Box sx={{
                                        padding: "0.5rem",
                                        backgroundColor: "#161F26",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        margin: "0 1rem",
                                        borderRadius: "6px",
                                        marginBottom: "1rem"
                                    }} key={invite.id}>
                                        <Box sx={{display: "flex", alignItems: "center"}}>
                                            <img className="invite-img" src={invite.avatarUrl}/>
                                            <Box
                                                sx={{letterSpacing: "0.5px"}}>{invite.name + " " + invite.surname}</Box>
                                        </Box>
                                        <Box sx={{display: "flex", flexDirection: "column"}}>
                                            <IconButton onClick={async () => {
                                                const db = getFirestore();
                                                await dispatch(createChat(invite.id));
                                                await Promise.all([
                                                        updateDoc(doc(collection(db, `users`), invite.id), {
                                                            friends: arrayUnion(auth.currentUser!.uid),
                                                        }),
                                                        updateDoc(doc(collection(db, `users`), auth.currentUser!.uid), {
                                                            friends: arrayUnion(invite.id),
                                                            invites: arrayRemove(invite.id),
                                                        }),
                                                    ]
                                                );
                                            }}><CheckCircleIcon className="invite-button"/></IconButton>
                                            <IconButton onClick={async () => {
                                                const db = getFirestore();
                                                await updateDoc(doc(collection(db, `users`), auth.currentUser!.uid), {
                                                    invites: arrayRemove(invite.id),
                                                });
                                            }}><CancelIcon className="invite-button"/></IconButton>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={8} sx={{height: "100%"}}>
                        <Box sx={{display: "flex", flexDirection: "column", flexWrap: "nowrap", height: '100%'}}
                             className="item friends-item">
                            <Box sx={{
                                fontSize: '1.5rem',
                                letterSpacing: 2,
                                paddingTop: '2.25rem',
                                textAlign: "center",
                            }}>
                                {openedChat ?
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: '5rem'
                                    }}>
                                        <IconButton onClick={() => setOpenedChat(undefined)}><ArrowBackIosNewIcon
                                            className="invite-button"/></IconButton>
                                        <img className="friend-img" src={openedChatFriendInfo?.avatarUrl}/>
                                        {openedChatFriendInfo?.name + " " + openedChatFriendInfo?.surname}
                                    </Box>
                                    : 'Lista znajomych'}
                            </Box>
                            <Divider sx={{marginTop: '2.25rem', bgcolor: '#36454F'}}/>
                            {friendsFetched ?
                                <>
                                    {!openedChat ? <Box sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            flexWrap: 'nowrap',
                                            flexGrow: 1,
                                            flexBasis: "0%",
                                            minHeight: 0,
                                            height: "auto",
                                            overflow: "auto",
                                        }} className="scroll">{
                                            friends && friends.map((friend) =>
                                                <Box sx={{
                                                    padding: "0.5rem",
                                                    backgroundColor: "#161F26",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    margin: "1rem 1rem 0 1rem",
                                                    borderRadius: "6px"
                                                }} key={friend.id}>
                                                    <Box sx={{display: "flex", alignItems: "center"}}>
                                                        <img className="friend-img" src={friend.avatarUrl}/>
                                                        <Box>
                                                            <Box
                                                                sx={{letterSpacing: "0.5px"}}>{friend.name + " " + friend.surname}</Box>
                                                            <Box sx={{
                                                                letterSpacing: "0.5px",
                                                                fontSize: "0.75rem",
                                                                paddingTop: "0.5rem",
                                                                color: "#bab8b8"
                                                            }}>
                                                                {chats[friend.id].lastMessage?.uid === auth.currentUser!.uid ? 'Ty: ' : ''}{chats[friend.id].lastMessage && chats[friend.id].lastMessage?.text + " · " + chats[friend.id].lastMessage?.createdAt.format('D MMM yyyy, HH:mm')}
                                                            </Box>
                                                        </Box>

                                                    </Box>
                                                    <Box sx={{display: "flex", marginRight: "1rem"}}>
                                                        <IconButton sx={{marginRight: "1rem"}}
                                                                    onClick={() => {
                                                                        setOpenedChat(chats[friend.id]!);
                                                                        setOpenedChatFriendInfo(friend);
                                                                    }}>
                                                            <ChatIcon className="invite-button"/>
                                                        </IconButton>
                                                        <IconButton sx={{marginRight: "1rem"}}
                                                                    onClick={() => handleClickOpenProfile(friend.id)}>
                                                            <AccountCircleIcon className="invite-button"/>
                                                        </IconButton>
                                                        <IconButton onClick={() => handleClickOpenDeleteFriend(friend.id)}>
                                                            <PersonRemoveIcon className="invite-button"/>
                                                        </IconButton>
                                                    </Box>
                                                    <ProfileDialog
                                                        open={openProfile === friend.id}
                                                        onClose={() => handleCloseProfile(friend.id)}
                                                        friend={friend}
                                                    />
                                                    <DeleteFriendDialog
                                                        open={openDeleteFriend === friend.id}
                                                        onClose={() => handleCloseDeleteFriend(friend.id)}
                                                        friend={friend}
                                                    />
                                                </Box>
                                            )}</Box> :
                                        <ChatRoom chat={openedChat!}/>
                                    }
                                </> : <Box sx={{textAlign: 'center', padding: '1rem'}}><CircularProgress/></Box>}
                        </Box>
                    </Grid>
                </Grid>
            </section>
        </>
    );

}

function ChatRoom(props: { chat: ChatWithDate }) {
    const db = getFirestore();
    const auth = getAuth();
    const {chat} = props;
    const [messages, _setMessages] = useState<MessageWithDate[]>([]);
    const messagesRef = useRef<MessageWithDate[]>(messages);
    const setMessages = (val: MessageWithDate[]) => {
        messagesRef.current = val;
        _setMessages(val);
    }
    const messageListRef = useRef<HTMLDivElement>(null);
    const [messagesFetched, setMessagesFetched] = useState(false);
    const [text, setText] = useState('');
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const chatDoc = doc(collection(db, 'chats'), chat.id);
    const messagesCollection = collection(chatDoc, 'messages');
    const messageDoc = doc(messagesCollection);

    const fetchMessages = async () => {
        const querySnapshot = await getDocs(query(messagesCollection, where('createdAt', '<', messages[0].createdAt.toDate()), orderBy('createdAt', 'desc'), limit(20)).withConverter(messageConverter));
        const newMessages = querySnapshot.docs.map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
                ...data,
                createdAt: moment(data.createdAt)
            };
        });
        setMessages([...newMessages.reverse(), ...messages]);
        setCanLoadMore(newMessages.length === 20);
    }

    const onScroll = async (e: UIEvent<HTMLDivElement, WheelEvent>) => {
        const target = e.target as HTMLDivElement;
        if (target.scrollTop === 0 && canLoadMore && !isLoading) {
            setIsLoading(true);
            await fetchMessages();
            setIsLoading(false);
            target!.scrollTop = 80;
        }
    }

    const sendMessage = async () => {
        const message = {
            createdAt: serverTimestamp(),
            text: text,
            uid: auth.currentUser!.uid,
        };
        await Promise.all([updateDoc(chatDoc, {lastMessage: message,}), setDoc(messageDoc, message)]);
        setText('');
    }

    const scrollDown = () => {
        const el = messageListRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, 'chats', chat.id, 'messages'), orderBy('createdAt', 'desc'), limit(20)).withConverter(messageConverter), (querySnapshot) => {
            if (!messagesRef.current.length) {
                setMessages(querySnapshot.docs.map((doc) => ({
                    ...doc.data(),
                    createdAt: moment(doc.data().createdAt),
                })).reverse());
                setMessagesFetched(true);
            } else {
                querySnapshot.docChanges().forEach((docChange) => {
                    if (docChange.type === 'added') {
                        const data = docChange.doc.data();
                        setMessages([...messagesRef.current, {...data, createdAt: moment(data.createdAt)}]);
                        scrollDown();
                    }
                })
            }
        });

        return () => {
            unsubscribe();
        }
    }, []);

    useEffect(() => {
        scrollDown();
    }, [messagesFetched]);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: 'nowrap',
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: '0',
            minHeight: 0,
        }}>
            <Box sx={{
                flexGrow: 1,
                flexBasis: "0%",
                minHeight: 0,
                overflow: 'auto',
            }} className='scroll' ref={messageListRef} onScroll={onScroll}>
                {console.log((!isLoading || messagesFetched))}
                {!isLoading ? <Box sx={{
                    display: "flex",
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    minHeight: "100%"
                }}>
                    {messages.map((message, index) => {
                        let canDisplayDate = false;
                        let canDisplayNewDay = false;
                        // console.log(messages[index + 1].createdAt.toDate().getMinutes())
                        if (index >= 1) {
                            if (messages[index].createdAt.diff(messages[index - 1].createdAt, "minutes") >= 5) {
                                canDisplayDate = true;
                            } else if (messages[index].createdAt.diff(messages[index - 1].createdAt, "hours") >= 1) {
                                canDisplayDate = true;
                            }
                            if (messages[index].createdAt.diff(messages[index - 1].createdAt, "days") >= 1) {
                                canDisplayNewDay = true;
                            }
                        } else {
                            canDisplayNewDay = true;
                        }
                        return <ChatMessage key={message.id} message={message} canDisplayDate={canDisplayDate}
                                            canDisplayNewDay={canDisplayNewDay}/>
                    })}
                </Box> : <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%'}}><CircularProgress/></Box>}
            </Box>
            <Divider sx={{backgroundColor: '#36454F', marginTop: '0.75rem'}}/>
            <Box sx={{display: 'flex', flexWrap: 'nowrap', padding: '1rem'}}>
                <Box sx={{
                    flexGrow: 1,
                    flexBasis: "0%",
                    minHeight: 0,
                    height: "auto",
                    overflow: "auto",
                }} className='scroll'>
                    <TextField size="small" focused={false} type="text" placeholder="Aa"
                               className="search-bar" style={{width: '100%'}}
                               value={text}
                               onChange={(e) => setText(e.target.value)}
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                       sendMessage()
                                   }
                               }}
                    />
                </Box>
                <IconButton sx={{marginLeft: '1rem'}} onClick={() => sendMessage()}><SendIcon
                    className='invite-button'/></IconButton>
            </Box>
        </Box>
    )
}

function ChatMessage(props: { message: MessageWithDate, canDisplayDate: boolean, canDisplayNewDay: boolean }) {
    const {message, canDisplayDate, canDisplayNewDay} = props;
    const auth = getAuth();

    const messageClass = message.uid === auth.currentUser!.uid ? 'sent' : 'received';

    return (<>
        {canDisplayNewDay ? <div className="when newDay">{message.createdAt.format('dd, HH:mm')}</div> : null}
        {canDisplayDate && !canDisplayNewDay ?
            <div className={`when ${messageClass}`}>{message.createdAt.format('HH:mm')}</div> : null}
        <div className={`message ${messageClass} `}>
            <p className="message-text">{message.text}</p>
        </div>
    </>)
}

function DeleteFriendDialog(props: ProfileDialogProps) {
    const {onClose, open, friend} = props;
    const auth = getAuth();
    const handleClose = () => {
        onClose();
    };
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                style: {
                    backgroundColor: '#222E36',
                    color: "white",
                },
            }}
        >
            <DialogTitle>
                {"Usunąć znajomego?"}
            </DialogTitle>
            <DialogActions>
                <Button sx={{color: "#64FFDAFF"}} onClick={handleClose}>Nie</Button>
                <Button sx={{color: "#64FFDAFF"}} onClick={
                    async () => {
                        const db = getFirestore();
                        const docs = await getDocs(query(collection(db, 'chats'), where(`usersMap.${friend.id}`, '==', true), where(`usersMap.${auth.currentUser!.uid}`, '==', true), limit(1)).withConverter(chatConverter));
                        await Promise.all([
                            updateDoc(doc(collection(db, `users`), auth.currentUser!.uid), {
                                friends: arrayRemove(friend.id),
                            }),
                            updateDoc(doc(collection(db, `users`), friend.id), {
                                friends: arrayRemove(auth.currentUser!.uid),
                            }),
                            deleteDoc(docs.docs[0].ref),
                        ]);
                        handleClose();
                    }
                } autoFocus>
                    Tak
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function ProfileDialog(props: ProfileDialogProps) {
    const {onClose, open, friend} = props;

    const handleClose = () => {
        onClose();
    };
    return (
        <Dialog onClose={handleClose} open={open} PaperProps={{
            style: {
                backgroundColor: '#222E36',
                color: "white",
                padding: "1.5rem"
            },
        }}>
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <img className="profile-img" src={friend.avatarUrl}/>
            </Box>
            <DialogTitle sx={{letterSpacing: 0.5}}>{friend.name + " " + friend.surname}</DialogTitle>
            <Divider sx={{marginBottom: '1.25rem', bgcolor: '#36454F'}}/>
            <Box>
                <Box className="friend-profile-label">Płeć:</Box>
                <Box className="friend-profile-value">{friend.gender}</Box>
            </Box>
            <Box>
                <Box className="friend-profile-label">Wzrost:</Box>
                <Box className="friend-profile-value">{friend.height + " cm"}</Box>
            </Box>
            <Box>
                <Box className="friend-profile-label">Waga:</Box>
                <Box className="friend-profile-value">{friend.weight + " kg"}</Box>
            </Box>
            <Box>
                <Box className="friend-profile-label">Data urodzenia:</Box>
                <Box className="friend-profile-value">{friend.dateOfBirth.format('D MMM yyyy, HH:mm')}</Box>
            </Box>
        </Dialog>
    );
}

interface ProfileDialogProps {
    open: boolean;
    onClose: () => void;
    friend: FriendWithDate;
}

interface invUser {
    name: string;
    surname: string;
    avatarUrl: string;
    id: string;
    invites: string[];
    friends: string[];
}

function SearchBar() {
    const [results, setResults] = useState([] as invUser[]);
    const [text, setText] = useState("");
    const [value] = useDebounce(text, 300);
    const auth = getAuth();


    const [isActive, setIsActive] = useState(false);

    function hideResults() {
        setIsActive(false);
    }

    useEffect(() => {
        document.body.addEventListener("click", hideResults);
        return () => {
            document.body.removeEventListener("click", hideResults);
        }
    }, [])

    useEffect(
        () => {
            async function search(e: string) {
                const db = getFirestore();
                const users = [] as invUser[];
                const querySnapshotSN = await getDocs(query(collection(db, `users`), where("nameSN", ">=", value), where("nameSN", "<", value + "\uf8ff"), limit(5)));
                const querySnapshotNS = await getDocs(query(collection(db, `users`), where("nameNS", ">=", value), where("nameNS", "<", value + "\uf8ff"), limit(5)));

                querySnapshotSN.docs.forEach(doc => {
                    const data = doc.data()!;
                    if (data.avatarUrl === "")
                        data.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";
                    users.push(
                        {
                            ...data,
                            id: doc.ref.id,
                        } as invUser
                    );

                });

                querySnapshotNS.docs.forEach(doc => {
                    const data = doc.data()!;
                    if (data.avatarUrl === "")
                        data.avatarUrl = "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c";
                    users.push(
                        {
                            ...data,
                            id: doc.ref.id,
                        } as invUser
                    );

                });

                const filteredUsers = users.filter((value) => {
                    return value.id !== auth.currentUser!.uid;
                });

               const final =  filteredUsers.filter((user, index, array) => array.findIndex(t => t.id === user.id) === index);

                console.log(final)
                setResults(final);
                setIsActive(true);
            }

            if (value !== '') {
                search(value);
            } else {
                setResults([]);
            }
        }, [value]
    )

    return (
        <div className="search-div" onClick={(e) => e.stopPropagation()}>
            <TextField size="small" focused={false} type="text" className="search-bar" placeholder="Wyszukaj znajomych"
                       onChange={(e) => setText(e.target.value.toLowerCase())} InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SearchIcon/>
                    </InputAdornment>
                )
            }}/>
            {isActive && <div className="results-div">
                {results && results.map(result => <div className="result" key={"search" + result.id}>
                    <Box
                        sx={{display: "flex", alignItems: "center", justifyContent: "center"}}><img
                        src={result.avatarUrl}/>{result.name + " " + result.surname}
                    </Box>
                    {
                        result.invites?.includes(auth.currentUser!.uid) || result.friends?.includes(auth.currentUser!.uid) ?
                            <Box sx={{padding: '8px'}}><CheckIcon/></Box> : <IconButton
                                sx={{color: '#222E36'}} onClick={async () => {
                                const db = getFirestore();
                                await updateDoc(doc(collection(db, `users`), result.id), {
                                    invites: arrayUnion(auth.currentUser!.uid),
                                });
                                setIsActive(false);
                            }}>
                                <EmailIcon/>
                            </IconButton>
                    }
                </div>)}
            </div>}

        </div>
    )
}

export default FriendsSection;

import React, {useEffect, useState, Component, MouseEventHandler} from 'react';
import {getAuth, User} from "firebase/auth";
import {
    Button,
    Tooltip,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Box,
    Grid,
    Stack, ToggleButtonGroup, ToggleButton, makeStyles, styled, CircularProgress, selectClasses
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "../reducers/authSlice";

import '../styles/RankingPage.scss';
import '../styles/StartingSection.scss';

import {AppDispatch} from "../store";
import {fetchTrainingData, selectTrainings} from "../reducers/trainingSlice";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {fetchRankData, Rank_Type, selectRanks} from '../reducers/rankSlice';
import Navbar from "./Navbar";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButton-root.Mui-selected': {
        color: '#64FFDAFF',
    },
}));


function RankingPage() {
    const history = useHistory();
    const auth = getAuth();
    const user = useSelector(selectUser);

    const [ranksFetched, setRanksFetched] = useState(false);
    const [trainingsFetched, setTrainingsFetched] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    let my_distance = 0;
    let my_high_velocity = 0;
    let my_avg_velocity = 0;


    const ranks = useSelector(selectRanks);
    const trainings = useSelector(selectTrainings);
    useEffect(() => {
        dispatch(fetchTrainingData(auth.currentUser!.uid, true)).then(() => {
            setTrainingsFetched(true);
        });
        dispatch(fetchRankData()).then(() => {
            setRanksFetched(true);
        });
    }, []);

    const [whichRanks, setWhichRanks] = useState<keyof Rank_Type>("highest_velocity");

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        ranking: keyof Rank_Type | null,
    ) => {
        if (ranking !== null) {
            setWhichRanks(ranking);
        }
    };
    const myRank = () => {
        const users_stats_list = ranks;

        const rank_distance = users_stats_list.sort((a, b) => b.distance - a.distance);
        for (let _i = 0; _i < rank_distance.length; _i++) {
            rank_distance[_i].id = _i + 1;
            if (rank_distance[_i].user_id === auth.currentUser!.uid) {
                my_distance = _i + 1;
            }
        }
        const rank_h_velocity = users_stats_list.sort((a, b) => b.highest_velocity - a.highest_velocity);
        for (let _i = 0; _i < rank_h_velocity.length; _i++) {
            rank_h_velocity[_i].id = _i + 1;
            if (rank_h_velocity[_i].user_id === auth.currentUser!.uid) {
                my_high_velocity = _i + 1;
            }
        }
        const rank_avg = users_stats_list.sort((a, b) => b.avg_velocity - a.avg_velocity);
        for (let _i = 0; _i < rank_avg.length; _i++) {
            rank_avg[_i].id = _i + 1;
            if (rank_avg[_i].user_id === auth.currentUser!.uid) {
                my_avg_velocity = _i + 1;
            }
        }

        return (
            <Stack
                divider={<Divider sx={{bgcolor: '#36454F'}} orientation="horizontal"
                                  flexItem/>}
                spacing={2}
            >
                <div className="stats-stackItem">
                    <div className="stats-stackItem-title">Prędkość średnia</div>
                    <div className="stats-stackItem-value">
                        <div className="stats-stackItem-value-number">
                            {
                                my_avg_velocity > 0 &&
                                <p>{my_avg_velocity} miejsce</p>

                            }
                            {
                                my_avg_velocity === 0 &&
                                <p>Brak odbytych treningów</p>
                            }
                        </div>
                    </div>
                </div>
                <div className="stats-stackItem">
                    <div className="stats-stackItem-title">Prędkość maksymalna</div>
                    <div className="stats-stackItem-value">
                        <div className="stats-stackItem-value-number">
                            {
                                my_high_velocity > 0 &&
                                <p>{my_high_velocity} miejsce</p>

                            }
                            {
                                my_high_velocity === 0 &&
                                <p>Brak odbytych treningów</p>
                            }
                        </div>

                    </div>
                </div>
                <div className="stats-stackItem">
                    <div className="stats-stackItem-title">Przejechany dystans</div>
                    <div className="stats-stackItem-value">
                        <div className="stats-stackItem-value-number">
                            {
                                my_distance > 0 &&
                                <p>{my_distance} miejsce</p>

                            }
                            {
                                my_distance === 0 &&
                                <p>Brak odbytych treningów</p>
                            }
                        </div>

                    </div>
                </div>
            </Stack>
        )

    }
    const Rank = () => {

        const users_stats_list = ranks;
        let rank = users_stats_list;

        if (whichRanks === "distance") {
            rank = users_stats_list.sort((a, b) => b.distance - a.distance)
        } else if (whichRanks === "highest_velocity") {
            rank = users_stats_list.sort((a, b) => b.highest_velocity - a.highest_velocity)
        } else if (whichRanks === "avg_velocity") {
            rank = users_stats_list.sort((a, b) => b.avg_velocity - a.avg_velocity)
        }
        for (let _i = 0; _i < rank.length; _i++) {
            rank[_i].id = _i + 1;
        }
        return (
            <div>
                <table>
                    <tbody>
                    <tr>

                        <th>Ranking</th>
                        <th>Awatar</th>
                        <th>Użytkownik</th>
                        <th>
                            {whichRanks === "distance" &&
                                <div>Dystans</div>
                            }
                            {whichRanks === "highest_velocity" &&
                                <div>Prędkość</div>
                            }
                            {whichRanks === "avg_velocity" &&
                                <div>Średnia prędkość</div>
                            }
                        </th>
                        <th/>
                    </tr>

                    {rank.filter(((item, index) => item.id <= 50)).map(({id, user_name, distance, highest_velocity, avg_velocity, avatarUrl }) => (
                        <tr key={id}>
                            <td>
                                {id === 1 &&
                                    <div style={{color: "gold", fontWeight: "bold"}}>{id}</div>
                                }
                                {id === 2 &&
                                    <div style={{color: "silver", fontWeight: "bold"}}>{id}</div>
                                }
                                {id === 3 &&
                                    <div style={{color: "#cd7f32", fontWeight: "bold"}}>{id}</div>
                                }
                                {id > 3 &&
                                    <div>{id}</div>
                                }
                            </td>
                            <td style={{width: "5%"}}>
                                {id === 1 &&
                                    <div style={{color: "gold", fontWeight: "bold"}}><img src={avatarUrl === "" ? "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c" : avatarUrl}/></div>
                                }
                                {id === 2 &&
                                    <div style={{color: "silver", fontWeight: "bold"}}><img src={avatarUrl === "" ? "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c" : avatarUrl}/></div>
                                }
                                {id === 3 &&
                                    <div style={{color: "#cd7f32", fontWeight: "bold"}}><img src={avatarUrl === "" ? "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c" : avatarUrl}/></div>
                                }
                                {id > 3 &&
                                    <div><img src={avatarUrl === "" ? "https://firebasestorage.googleapis.com/v0/b/projekt-kolarstwo.appspot.com/o/avatars%2Fdefault.png?alt=media&token=f1498949-47e5-4af3-962d-c0290685c66c" : avatarUrl}/></div>
                                }
                            </td>
                            <td>
                                {id === 1 &&
                                    <div style={{color: "gold", fontWeight: "bold"}}>{user_name !== " " ? user_name : "user"}</div>
                                }
                                {id === 2 &&
                                    <div style={{color: "silver", fontWeight: "bold"}}>{user_name !== " " ? user_name : "user"}</div>
                                }
                                {id === 3 &&
                                    <div style={{color: "#cd7f32", fontWeight: "bold"}}>{user_name !== " " ? user_name : "user"}</div>
                                }
                                {id > 3 &&
                                    <div>{user_name !== " " ? user_name : "user"}</div>
                                }
                            </td>
                            <td>
                                {whichRanks === "distance" &&
                                    <div>
                                        {id === 1 &&
                                            <div style={{color: "gold", fontWeight: "bold"}}>{distance} km</div>
                                        }
                                        {id === 2 &&
                                            <div style={{color: "silver", fontWeight: "bold"}}>{distance} km</div>
                                        }
                                        {id === 3 &&
                                            <div style={{color: "#cd7f32", fontWeight: "bold"}}>{distance} km</div>
                                        }
                                        {id > 3 &&
                                            <div>{distance} km</div>
                                        }
                                    </div>
                                }
                                {whichRanks === "highest_velocity" &&
                                    <div>
                                        {id === 1 &&
                                            <div style={{
                                                color: "gold",
                                                fontWeight: "bold"
                                            }}>{highest_velocity} km/h</div>
                                        }
                                        {id === 2 &&
                                            <div style={{
                                                color: "silver",
                                                fontWeight: "bold"
                                            }}>{highest_velocity} km/h</div>
                                        }
                                        {id === 3 &&
                                            <div style={{
                                                color: "#cd7f32",
                                                fontWeight: "bold"
                                            }}>{highest_velocity} km/h</div>
                                        }
                                        {id > 3 &&
                                            <div>{highest_velocity} km/h</div>
                                        }
                                    </div>
                                }
                                {whichRanks === "avg_velocity" &&
                                    <div>
                                        {id === 1 &&
                                            <div style={{color: "gold", fontWeight: "bold"}}>{avg_velocity} km/h</div>
                                        }
                                        {id === 2 &&
                                            <div style={{color: "silver", fontWeight: "bold"}}>{avg_velocity} km/h</div>
                                        }
                                        {id === 3 &&
                                            <div
                                                style={{color: "#cd7f32", fontWeight: "bold"}}>{avg_velocity} km/h</div>
                                        }
                                        {id > 3 &&
                                            <div>{avg_velocity} km/h</div>
                                        }
                                    </div>
                                }
                            </td>
                            <td style={{width: "10%"}}>
                                {id === 1 &&
                                    <EmojiEventsIcon sx={{color: "gold"}}/>
                                }
                                {id === 2 &&
                                    <EmojiEventsIcon sx={{color: "silver"}}/>
                                }
                                {id === 3 &&
                                    <EmojiEventsIcon sx={{color: "#cd7f32"}}/>
                                }
                            </td>
                        </tr>
                    ))
                    }
                    </tbody>
                </table>
            </div>
        );
    };

    const Training_rank = () => {
        let trening;
        trening = trainings.sort((a, b) => b.distance - a.distance)
        for (let _i = 0; _i < trening.length; _i++) {
            trening[_i].placement = _i + 1;
        }
        return (
            trening.filter(((item, index) => item.placement <= 10)).map(tre => (
                <div key={tre.placement} className="item lastTrainingContainer">
                    <Box sx={{display: 'flex', flexDirection: "column"}}>
                        <Box sx={{
                            display: "flex",
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingTop: 2,
                            fontSize: '1.25rem',
                            fontWeight: "500",
                            letterSpacing: 1
                        }}>
                            {tre.placement}
                        </Box>
                        <Divider sx={{marginTop: 2, bgcolor: '#36454F'}} orientation="horizontal"/>
                        {trainingsFetched ? <>
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingTop: 3,
                                fontSize: '1.25rem',
                                fontWeight: "500",
                                letterSpacing: 1
                            }}>
                                {tre.name}
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingTop: 4
                            }}>
                                <Stack
                                    direction="row"
                                    divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical"
                                                      flexItem/>}
                                    spacing={2}
                                >
                                    <div className="lastTraining">
                                        <TimerIcon className="lastTraining-icon"/>
                                        <div className="lastTraining-value-number">{tre.duration}</div>
                                    </div>
                                    <div className="lastTraining">
                                        <SpeedIcon className="lastTraining-icon"/>
                                        <div className="lastTraining-value">
                                            <div className="lastTraining-value-number">{tre.averageVelocity}</div>
                                            <div className="lastTraining-value-unit">km/h</div>
                                        </div>
                                    </div>
                                    <div className="lastTraining">
                                        <LocalFireDepartmentIcon className="lastTraining-icon"/>
                                        <div className="lastTraining-value">
                                            <div
                                                className="lastTraining-value-number">{trainings && tre.calories}</div>
                                            <div className="lastTraining-value-unit">kcal</div>
                                        </div>
                                    </div>
                                </Stack>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                paddingLeft: 5,
                                paddingTop: 4
                            }}>
                                <Stack
                                    direction="column"
                                    divider={<Divider sx={{bgcolor: '#36454F'}} orientation="horizontal"
                                                      flexItem/>}
                                    spacing={2}
                                >
                                    <div className="lastTraining-row">
                                        <DirectionsBikeIcon className="lastTraining-icon2"/>
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}>
                                            <Box sx={{paddingLeft: '6px', paddingRight: 9}}>Dystans</Box>
                                            <div className="lastTraining-value">
                                                <div className="lastTraining-value-number">{tre.distance}</div>
                                                <div className="lastTraining-value-unit">km</div>
                                            </div>
                                        </Box>
                                    </div>
                                    <div className="lastTraining-row">
                                        <PlayArrowIcon className="lastTraining-icon2"/>
                                        <div className="lastTraining-date">
                                            <div className="lastTraining-date-name">Początek</div>
                                            <div
                                                className="lastTraining-date-value">{tre.dateStart.format('D MMM yyyy, HH:mm')}</div>
                                        </div>
                                    </div>
                                    <div className="lastTraining-row">
                                        <StopIcon className="lastTraining-icon2"/>
                                        <div className="lastTraining-date">
                                            <div className="lastTraining-date-name">Koniec</div>
                                            <div
                                                className="lastTraining-date-value">{tre.dateEnd.format('D MMM yyyy, HH:mm')}</div>
                                        </div>
                                    </div>
                                </Stack>
                            </Box>
                        </> : <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}><CircularProgress sx={{color: "#64FFDAFF"}}
                                             size={"2rem"}/></Box>
                        }
                    </Box>
                </div>

            )))
    }
    return (
        <div className="starting-page">
            <Navbar/>
            <section className="startingSection">
                <Grid container spacing={4}>

                    {ranksFetched ?
                        <Grid item xs={12}>

                            <div className="item tracks">
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 4,
                                    paddingBottom: 3,

                                }}>
                                    <StyledToggleButtonGroup
                                        value={whichRanks}
                                        exclusive
                                        onChange={handleChange}
                                        sx={{border: '1px solid #64FFDAFF'}}
                                    >
                                        <ToggleButton sx={{color: "white"}} value="highest_velocity">TOP 50 Najwyższa
                                            osiągnięta prędkość</ToggleButton>
                                        <ToggleButton sx={{color: "white"}} value="avg_velocity">TOP 50 Najwyższa
                                            średnia prędkość</ToggleButton>
                                        <ToggleButton sx={{color: "white"}} value="distance">TOP 50 Najwięcej
                                            przejechanych kilometrów</ToggleButton>
                                    </StyledToggleButtonGroup>

                                </Box>


                            </div>
                        </Grid>
                        : <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}><CircularProgress
                            sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>}

                    {ranksFetched ?
                        <Grid item xs={9}>

                            <div className="item tracks">


                                <Box sx={{display: 'flex', flexDirection: 'column'}}>

                                    <div className="carousel">

                                        {Rank()}

                                    </div>
                                </Box>

                            </div>
                        </Grid>
                        : <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}><CircularProgress
                            sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>}

                    <Grid item xs={3}>
                        <div className="item stats">
                            <Box sx={{display: 'flex', flexDirection: 'column'}}>


                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 4
                                }}>
                                    <Box sx={{
                                        fontSize: '1.25rem',
                                        fontWeight: "500",
                                        letterSpacing: 2
                                    }}>Moje Rankingi</Box>
                                </Box>

                                <Box sx={{paddingTop: 4}}>
                                    {ranksFetched ? <>
                                            <Divider sx={{marginBottom: 2, bgcolor: '#36454F'}}
                                                     orientation="horizontal"/>
                                            {myRank()}

                                        </> :
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}><CircularProgress
                                            sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>}
                                </Box>
                            </Box>

                        </div>


                        <div className="item stats">
                            <Box sx={{display: 'flex', flexDirection: 'column'}}>


                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: 4
                                }}>
                                    <Box sx={{
                                        fontSize: '1.25rem',
                                        fontWeight: "500",
                                        letterSpacing: 2
                                    }}>Treningi Top 10-Dystans</Box>
                                </Box>

                                <Box sx={{paddingTop: 4}}>
                                    {trainingsFetched && trainings.length === 0 ? <Box sx={{
                                        display: "flex",
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingTop: 3,
                                        letterSpacing: 1
                                    }}>Brak odbytych treningów</Box> : <>
                                    {trainingsFetched ? <>

                                            <div className="carousel1">
                                                <Slider
                                                    initialSlide={0}
                                                    dots={false}
                                                    slidesToScroll={1}
                                                    autoplay={true}
                                                    speed={1000}
                                                    autoplaySpeed={10000}
                                                >
                                                    {Training_rank()}
                                                </Slider>
                                            </div>
                                        </> :
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}><CircularProgress
                                            sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>}</>}
                                </Box>
                            </Box>

                        </div>
                    </Grid>
                </Grid>
            </section>
        </div>
    );

}

export default RankingPage;

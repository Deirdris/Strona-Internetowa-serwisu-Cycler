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
    Stack, ToggleButtonGroup, ToggleButton, makeStyles, styled, CircularProgress
} from "@mui/material";
import Logout from '@mui/icons-material/Logout';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import Landscape from '@mui/icons-material/Landscape';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {deepOrange, grey} from '@mui/material/colors';
import {useHistory} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {selectUser} from "../reducers/authSlice";
import banner from '../img/baner.jpg'
import image from '../img/background.jpg'

import '../styles/StartingSection.scss';
import {VictoryAxis, VictoryBar, VictoryChart, VictoryLabel} from "victory";
import {fetchStatsData, selectStats, GlobalStatsEntry, Stats} from "../reducers/statsSlice";
import {AppDispatch} from "../store";
import {numberFormat} from "../methods/numberFormat";
import {fetchTrainingData, selectTrainings} from "../reducers/trainingSlice";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import {fetchTrackData, selectTracks} from "../reducers/tracksSlice";
import Flag from '@mui/icons-material/Flag';
import Navbar from "./Navbar";
import {fetchAchievementsData, selectAchievements} from "../reducers/achievementsSlice";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
    '& .MuiToggleButton-root.Mui-selected': {
        color: '#64FFDAFF',
    },
}));

function StartingSection() {
    const history = useHistory();
    const auth = getAuth();
    const user = useSelector(selectUser);
    const [tracksFetched, setTracksFetched]= useState(false);
    const [statsFetched, setStatsFetched] = useState(false);
    const [trainingsFetched, setTrainingsFetched] = useState(false);
    const [achievementsFetched, setAchievementsFetched] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const stats = useSelector(selectStats);
    const tracks = useSelector(selectTracks);
    const trainings = useSelector(selectTrainings);
    const achievements = useSelector(selectAchievements);
    useEffect(() => {
        dispatch(fetchStatsData(auth.currentUser!.uid)).then(() => {
            setStatsFetched(true);
        });
        dispatch(fetchTrainingData(auth.currentUser!.uid, false)).then(() => {
            setTrainingsFetched(true);
        });
        dispatch(fetchTrackData()).then(() => {
            setTracksFetched(true);
        });
        dispatch(fetchAchievementsData(auth.currentUser!.uid)).then(() => {

            setAchievementsFetched(true);
        });
    }, []);
    const [whichStats, setWhichStats] = useState<keyof Stats>('weekly');

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        stats: keyof Stats | null,
    ) => {
        if (stats !== null) {
            setWhichStats(stats);
        }
    };
    const renderSlides = () => 
    tracks.map(tra=>(
        <div key={tra.name}>
            <h3>{tra.name}</h3>
            <img src={tra.photo_url} alt="baner" />
            <div className="track-detail">
                <div className="places">
                    <div className="start">
                        <Flag className="track-icon"/><h5>START: {tra.start}</h5>
                    </div>
                    <div className="compare-arr">
                        <CompareArrowsIcon className="track-icon"/>
                    </div>
                    <div className="end">
                        <Flag className="track-icon"/><h5>META: {tra.finish}</h5>
                    </div>
                </div>
               
                <div className="parameters">
                    <div className="distance">
                        <DirectionsBikeIcon className="track-icon"/><h5>DYSTANS: {tra.distance} km</h5>
                    </div>
                    <div className="time">
                        <TimerIcon className="track-icon"/><h5>CZAS: {tra.time}</h5>
                    </div>
                    <div className="difficult">
                        <Landscape className="track-icon"/><h5>POZIOM TRUDNOŚCI: {tra.difficult}</h5>
                    </div>
                </div>
                <hr/>
            </div>
            
            <p className="track-dsc">{tra.description}</p>
            {tra.url.length>0 &&
            <div>
            <a href={tra.url}>
            <button className="trackurl">Czytaj więcej...</button>
            </a>
            </div> 
            }
        </div>
    ))
    
    return (
        <>
            <Navbar/>
            <section className="startingSection">
            <Grid container spacing={4}>
                <Grid item xs={3}>
                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <div className="item miniprofile">
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Avatar src={user.avatarUrl} sx={{
                                    width: 80,
                                    height: 80,
                                    marginTop: -5,
                                    boxShadow: 3,
                                    border: 2,
                                    borderColor: 'text.primary',
                                }}/>
                            </Box>
                            <div className="miniprofile-username">{user.name !== "" ? user.name + ' ' + user.surname : auth.currentUser!.email}</div>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingTop: 4
                            }}>
                                {statsFetched && achievementsFetched ?
                                    <Stack
                                        direction="row"
                                        divider={<Divider sx={{bgcolor: '#36454F'}} orientation="vertical"
                                                          flexItem/>}
                                        spacing={2}
                                    >
                                        <div className="miniprofile-info">
                                            <div className="miniprofile-info-row">
                                                <div className="miniprofile-info-row-name">Treningi</div>
                                                <div className="miniprofile-info-row-number">{
                                                    stats !== undefined ?
                                                    (stats!['global'] as
                                                        GlobalStatsEntry).trainingCount
                                                    : 0
                                                }</div>
                                            </div>
                                        </div>
                                        <div className="miniprofile-info">
                                            <div className="miniprofile-info-row">
                                                <div className="miniprofile-info-row-name">Osiągnięcia</div>
                                                <div className="miniprofile-info-row-number">{
                                                    achievements.progress.distance.stageId+
                                                    achievements.progress.speed.stageId+
                                                    achievements.progress.time.stageId+
                                                    achievements.progress.calories.stageId
                                                }</div>
                                            </div>
                                        </div>
                                        <div className="miniprofile-info">
                                            <div className="miniprofile-info-row">
                                                <div className="miniprofile-info-row-name">Znajomi</div>
                                                <div className="miniprofile-info-row-number">{user.friends ? user.friends.length : '0'}</div>
                                            </div>
                                        </div>
                                    </Stack>
                                    : <Box><CircularProgress sx={{color: "#64FFDAFF"}}
                                                             size={"2rem"}/></Box>
                                }
                            </Box>
                            <Divider sx={{marginTop: 4, bgcolor: '#36454F'}} orientation="horizontal"/>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingTop: 2,
                                paddingLeft: 7
                            }}>
                                <Box sx={{fontWeight: "500", letterSpacing: 1}}>
                                    Zobacz cały profil
                                </Box>
                                <Box sx={{paddingLeft: 2}}>
                                    <IconButton sx={{color: "white"}} onClick={() => {
                                        history.replace("/profil");
                                    }}>
                                        <ArrowForwardIosIcon/>
                                    </IconButton>
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
                                    <StyledToggleButtonGroup
                                        value={whichStats}
                                        exclusive
                                        onChange={handleChange}
                                        sx={{border: '1px solid #64FFDAFF'}}
                                    >
                                        <ToggleButton sx={{color: "white"}} value="weekly">Tydzień</ToggleButton>
                                        <ToggleButton sx={{color: "white"}} value="monthly">Miesiąc</ToggleButton>
                                        <ToggleButton sx={{color: "white"}} value="global">Ogólne</ToggleButton>
                                    </StyledToggleButtonGroup>
                                </Box>

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
                                    }}>Statystyki</Box>
                                </Box>

                                <Box sx={{paddingTop: 4}}>
                                    {statsFetched && stats === undefined 
                                    ? <Box sx={{
                                        display: "flex",
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingTop: 3,
                                        letterSpacing: 1
                                     }}>Brak statystyk</Box> : <>
                                    {statsFetched ? <>
                                            <Divider sx={{marginBottom: 2, bgcolor: '#36454F'}}
                                                     orientation="horizontal"/>
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
                                                                numberFormat(stats![whichStats].averageVelocity)
                                                            }
                                                        </div>
                                                        <div className="stats-stackItem-value-unit">km/h</div>
                                                    </div>
                                                </div>
                                                <div className="stats-stackItem">
                                                    <div className="stats-stackItem-title">Prędkość maksymalna</div>
                                                    <div className="stats-stackItem-value">
                                                        <div className="stats-stackItem-value-number">{
                                                            numberFormat(stats![whichStats].highestVelocity)
                                                        }</div>
                                                        <div className="stats-stackItem-value-unit">km/h</div>
                                                    </div>
                                                </div>
                                                <div className="stats-stackItem">
                                                    <div className="stats-stackItem-title">Spalone kalorie</div>
                                                    <div className="stats-stackItem-value">
                                                        <div className="stats-stackItem-value-number">{
                                                            numberFormat(stats![whichStats].allBurnedCalories)
                                                        }</div>
                                                        <div className="stats-stackItem-value-unit">kcal</div>
                                                    </div>
                                                </div>
                                                <div className="stats-stackItem">
                                                    <div className="stats-stackItem-title">Przejechany dystans</div>
                                                    <div className="stats-stackItem-value">
                                                        <div className="stats-stackItem-value-number">{
                                                            numberFormat(stats![whichStats].overallDistance)
                                                        }</div>
                                                        <div className="stats-stackItem-value-unit">km</div>
                                                    </div>
                                                </div>
                                                <div className="stats-stackItem">
                                                    <div className="stats-stackItem-title">Spędzony czas</div>
                                                    <div className="stats-stackItem-value">
                                                        <div className="stats-stackItem-value-number">{
                                                            stats![whichStats].overallDuration >= 60 ? numberFormat(stats![whichStats].overallDuration / 60) : numberFormat(stats![whichStats].overallDuration)
                                                            //numberFormat(stats![whichStats].overallDuration)
                                                        }</div>
                                                        <div
                                                            className="stats-stackItem-value-unit">{stats![whichStats].overallDuration >= 60 ? 'min' : 's'}</div>
                                                    </div>
                                                </div>
                                            </Stack>
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
                    </Box>
                </Grid>
                { tracksFetched ?
                    <Grid item xs={6}>
                        <div className="item tracks">
                        
                            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                
                                <div className="carousel">
                                    <Slider 
                                    dots={true} 
                                    autoplay={true}
                                    speed={1000}
                                    autoplaySpeed={10000}
                                    >
                                    {renderSlides()}
                                    </Slider>
                                </div>
                            </Box>
                           
                        </div>
                    </Grid>
                     : <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}><CircularProgress sx={{color: "#64FFDAFF"}} size={"2rem"}/></Box>}
                <Grid item xs={3}>
                    <div className="item lastTrainingContainer">
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
                                Ostatni trening
                            </Box>
                            <Divider sx={{marginTop: 2, bgcolor: '#36454F'}} orientation="horizontal"/>
                            {trainingsFetched && trainings.length === 0 ? <Box sx={{
                                display: "flex",
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingTop: 3,
                                letterSpacing: 1
                            }}>Brak zapisanych treningów</Box> : <>
                                {trainingsFetched && statsFetched ? <>
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingTop: 3,
                                        fontSize: '1.25rem',
                                        fontWeight: "500",
                                        letterSpacing: 1
                                    }}>
                                        {trainings[0].name}
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
                                                <div className="lastTraining-value-number">{trainings[0].duration}</div>
                                            </div>
                                            <div className="lastTraining">
                                                <SpeedIcon className="lastTraining-icon"/>
                                                <div className="lastTraining-value">
                                                    <div className="lastTraining-value-number">{trainings[0].averageVelocity}</div>
                                                    <div className="lastTraining-value-unit">km/h</div>
                                                </div>
                                            </div>
                                            <div className="lastTraining">
                                                <LocalFireDepartmentIcon className="lastTraining-icon"/>
                                                <div className="lastTraining-value">
                                                    <div
                                                        className="lastTraining-value-number">{trainings && trainings[0].calories}</div>
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
                                                        <div className="lastTraining-value-number">{trainings[0].distance}</div>
                                                        <div className="lastTraining-value-unit">km</div>
                                                    </div>
                                                </Box>
                                            </div>
                                            <div className="lastTraining-row">
                                                <PlayArrowIcon className="lastTraining-icon2"/>
                                                <div className="lastTraining-date">
                                                    <div className="lastTraining-date-name">Początek</div>
                                                    <div
                                                        className="lastTraining-date-value">{trainings[0].dateStart.format('D MMM yyyy, HH:mm')}</div>
                                                </div>
                                            </div>
                                            <div className="lastTraining-row">
                                                <StopIcon className="lastTraining-icon2"/>
                                                <div className="lastTraining-date">
                                                    <div className="lastTraining-date-name">Koniec</div>
                                                    <div className="lastTraining-date-value">{trainings[0].dateEnd.format('D MMM yyyy, HH:mm')}</div> 
                                                </div>
                                            </div>
                                        </Stack>
                                    </Box>

                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        paddingTop: 4,
                                    }}>
                                        <Box sx={{
                                            fontSize: "1.25rem",
                                            fontWeight: "500",
                                            letterSpacing: 1,
                                            paddingBottom: 2
                                        }}>Średnia prędkość</Box>
                                        <VictoryChart
                                            domainPadding={20}
                                            padding={{left: 100, right: 40}}
                                        >
                                            <VictoryAxis
                                                tickValues={[1, 2, 3, 4]}
                                                tickFormat={["Tygodniowa", "Miesięczna", "Całościowa", "Trening"]}
                                                style={{
                                                    axis: {
                                                        stroke: 'transparent'
                                                    },
                                                    tickLabels: {
                                                        fill: 'white'
                                                    },
                                                    grid: {stroke: "none"}
                                                }}
                                            />
                                            <VictoryBar
                                                horizontal
                                                barWidth={14}
                                                style={{
                                                    data: {fill: "#64FFDAFF"},
                                                    labels: {fill: "white"}
                                                }}
                                                labels={({datum}) => numberFormat(datum.value)}
                                                data={[
                                                    {velocity: 1, value: stats!['weekly'].averageVelocity},
                                                    {velocity: 2, value: stats!['monthly'].averageVelocity},
                                                    {velocity: 3, value: stats!['global'].averageVelocity},
                                                    {velocity: 4, value: trainings[0].averageVelocity}
                                                ]}
                                                x="velocity"
                                                y="value"
                                            />
                                        </VictoryChart>
                                    </Box>
                                </> : <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}><CircularProgress sx={{color: "#64FFDAFF"}}
                                                     size={"2rem"}/></Box>
                                }
                            </> }

                        </Box>
                    </div>
                </Grid>
            </Grid>
            </section>
        </>
    );

}

export default StartingSection;

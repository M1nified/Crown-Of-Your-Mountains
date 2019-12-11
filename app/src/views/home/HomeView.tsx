import '@material-ui/core';
import { Avatar, Card, CardActions, CardContent, CardHeader, FormControl, IconButton, LinearProgress, MenuItem, Select, SvgIcon, Tooltip, Typography, Collapse } from "@material-ui/core";
import { mdiBookOpen, mdiCrownOutline, mdiImageFilterHdr, mdiLogout } from '@mdi/js';
import React, { Component } from "react";
import CrownDetails from '../../components/crownDetails/CrownDetails';
import GoogleMap from "../../components/googleMap/GoogleMap";
import Login from '../../components/login/Login';
import { getCrownsAll } from "../../dao/CrownsDAO";
import Crown from "../../dao/models/Crown";
import Peak from '../../dao/models/Peak';
import { User, VisitedPeak } from '../../dao/models/User';
import { getCurrentUser, saveUser } from '../../dao/UsersDAO';
import firebase from './../../firebase';
import './HomeView.scss';


type HomeViewState = {
    crowns: Crown[],
    crownToDisplay: Crown | null,
    firebaseUser: firebase.User | null,
    user?: User,
    progress: number,
    showCrownDetailsDialog: boolean,
    detailedVisitedPeak?: VisitedPeak,
    mapVersion: number,
}

export default class HomeView extends Component<any, HomeViewState> {


    state: HomeViewState = {
        crowns: [],
        crownToDisplay: null,
        firebaseUser: null,
        progress: 0,
        showCrownDetailsDialog: false,
        mapVersion: 0,
    }

    async componentDidMount() {
        const setCrown = () => {
            try {
                const { crownToDisplayId } = this.props.match.params;
                if (crownToDisplayId) {
                    this.setCrownToDisplayById(crownToDisplayId);
                }
            } catch (err) {
                console.error(err);
            }
        }
        if (firebase.auth().currentUser) {
            await this.loadData();
            setCrown();
        } else {
            const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
                if (firebaseUser) {
                    await this.loadData();
                    setCrown();
                    unsubscribe();
                }
            })
        }
        firebase.auth().onIdTokenChanged((firebaseUser) => {
            this.setState({
                firebaseUser,
            });
        })
    }

    render() {
        const userBox = (() => {
            if (this.state.firebaseUser) {
                const { firebaseUser } = this.state;
                return (
                    <Card className="ui-elem user-box ui-card" raised>
                        <CardHeader
                            avatar={
                                <Avatar
                                    alt={firebaseUser.displayName || ""}
                                    src={firebaseUser.photoURL || ""}
                                />
                            }
                            action={
                                <Tooltip title="Logout">
                                    <IconButton aria-label="logout" onClick={this.handleLogoutClick} style={{ marginTop: "10px" }}>
                                        <SvgIcon><path d={mdiLogout} /></SvgIcon>
                                    </IconButton>
                                </Tooltip>
                            }
                            title={firebaseUser.displayName}
                        >
                        </CardHeader>
                    </Card>
                )
            } else {
                return (
                    <></>
                )
            }
        })()
        const crownDetailsBox = (() => {
            if (!this.state.crownToDisplay || !this.state.user)
                return <></>;
            return (
                <>
                    <Card className="ui-card ui-elem" raised>
                        <CardHeader
                            avatar={
                                <SvgIcon><path d={mdiCrownOutline} /></SvgIcon>
                            }
                            title={this.state.crownToDisplay.name}
                        />
                        <CardContent>
                            <LinearProgress variant="determinate" value={this.state.progress} />
                        </CardContent>
                        <CardActions>
                            <Tooltip title="Show more/Edit">
                                <IconButton onClick={this.handleCrownDetailsClick}>
                                    <SvgIcon><path d={mdiBookOpen} /></SvgIcon>
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                    </Card>
                    <CrownDetails
                        open={this.state.showCrownDetailsDialog}
                        crown={this.state.crownToDisplay}
                        user={this.state.user}
                        onClose={this.handleCrownDetailsDialogClose}
                        onPeakVisitedChanged={this.handlePeakVisitedChange}
                        onSave={this.handleCrownDetailsSave}
                    />
                </>
            )
        })()

        const peakDetailsBox = (() => {
            const { detailedVisitedPeak } = this.state;
            if (!detailedVisitedPeak)
                return <></>
            return <Card className="ui-elem ui-card" raised>
                <CardHeader
                    avatar={
                        <SvgIcon><path d={mdiImageFilterHdr} /></SvgIcon>
                    }
                    title={detailedVisitedPeak.peak.name}
                />
                <CardContent>
                    <Typography>
                        {detailedVisitedPeak.peak.position.lat}, {detailedVisitedPeak.peak.position.lng}
                    </Typography>
                </CardContent>
            </Card>
        })()

        return (
            <>
                <div className="home">
                    <GoogleMap
                        visitedPeaks={
                            this.state.crownToDisplay
                                ? this.state.crownToDisplay.peaks.map(peak => {
                                    const visitedPeak = this.state.user && this.state.user.visitedPeaks.find(vp => vp.peak.id === peak.id)
                                    const visited = !!(visitedPeak && visitedPeak.visited);
                                    return {
                                        peak,
                                        visited,
                                    }
                                })
                                : []
                        }
                        onClickVisitedPeak={this.handleDetailedVisitedPeakChange}
                        mapVersion={this.state.mapVersion}
                    />
                    <div className="ui">
                        <Collapse className="ui-card" in={!!this.state.firebaseUser}>
                            {userBox}
                        </Collapse>
                        <Collapse className="ui-card" in={this.state.crowns.length > 0}>
                            <Card className="ui-elem ui-card" raised>
                                <CardHeader
                                    avatar={
                                        <SvgIcon><path d={mdiCrownOutline} /></SvgIcon>
                                    }
                                    title="Crown selection"
                                />
                                <FormControl className="">
                                    <Select
                                        className="crown-selection"
                                        displayEmpty
                                        onChange={this.handleCrownChange}
                                        value={this.state.crownToDisplay}
                                    >
                                        <MenuItem key={-1} disabled selected>Select</MenuItem>
                                        {this.state.crowns.map((crown, idx) =>
                                            (<MenuItem key={idx} value={idx}>{crown.name}</MenuItem>)
                                        )}
                                    </Select>
                                </FormControl>
                            </Card>
                        </Collapse>
                        <Collapse className="ui-card" in={!!(this.state.crownToDisplay && this.state.user)}>
                            {crownDetailsBox}
                        </Collapse>
                        <Collapse className="ui-card" in={!!this.state.detailedVisitedPeak}>
                            {peakDetailsBox}
                        </Collapse>
                    </div>
                    <Login open={!this.state.firebaseUser} />
                </div>
            </>
        )
    }

    handleCrownChange = (e: any) => {
        const idx = e.target.value
        const crownToDisplay = idx < 0 ? null : this.state.crowns[idx];
        this.setState({
            crownToDisplay,
        }, () => {
            this.updateCrownProgress();
            this.incMapVersion();
        })
    }

    loadData = async () => {
        return new Promise(async (resolve, reject) => {
            try {
                const crowns = await getCrownsAll()
                const user = await getCurrentUser();
                this.setState({
                    crowns,
                    user,
                }, () => {
                    resolve();
                })
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    }

    setCrownToDisplayById = (crownId: string) => {
        const crownToDisplay = this.state.crowns.find(crown => crown.id === crownId);
        if (!crownToDisplay)
            return;
        this.setState({
            crownToDisplay,
        }, () => {
            this.updateCrownProgress();
            this.incMapVersion();
        })
    }

    updateCrownProgress = async () => {
        const progress = (() => {
            const { user } = this.state;
            if (!user || !this.state.crownToDisplay)
                return 0;
            const visitedCount = this.state.crownToDisplay.peaks.reduce(
                (count, peak) =>
                    user.visitedPeaks.some(vp => vp.peak.id === peak.id && vp.visited)
                        ? count + 1
                        : count,
                0)
            return visitedCount / this.state.crownToDisplay.peaks.length * 100;
        })()
        this.setState({
            progress,
        })
    }

    incMapVersion = () => {
        this.setState({
            mapVersion: (this.state.mapVersion + 1) % 10000,
        })
    }

    handleLogoutClick = () => {
        firebase.auth().signOut();
    }

    handleCrownDetailsClick = () => {
        this.setState({
            showCrownDetailsDialog: true,
        })
    }

    handleCrownDetailsDialogClose = () => {
        this.setState({
            showCrownDetailsDialog: false,
        })
    }

    handleCrownDetailsSave = async () => {
        if (!this.state.user)
            return;
        await saveUser(this.state.user);
    }

    handlePeakVisitedChange = (peak: Peak, visited: boolean, date?: Date) => {
        if (!this.state.user)
            return;
        const visitedPeaks = [...this.state.user.visitedPeaks];
        let visitedPeak = visitedPeaks.find(vp => vp.peak.id === peak.id)
        if (!visitedPeak) {
            visitedPeak = {
                peak,
                visited,
            } as VisitedPeak;
            visitedPeaks.push(visitedPeak);
        } else {
            visitedPeak.visited = visited;
        }
        if (date) {
            visitedPeak.visitDate = date;
        }
        const user = this.state.user;
        user.visitedPeaks = visitedPeaks;
        this.setState({
            user
        }, () => {
            this.updateCrownProgress();
            this.incMapVersion();
        })
    }

    handleDetailedVisitedPeakChange = (visitedPeak: VisitedPeak) => {
        this.setState({
            detailedVisitedPeak: visitedPeak,
        })
    }

}
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemIcon, ListItemText, SvgIcon, Tooltip } from "@material-ui/core";
import { mdiContentSaveOutline, mdiCrownOutline } from '@mdi/js';
import React, { Component } from "react";
import Crown from "../../dao/models/Crown";
import Peak from "../../dao/models/Peak";
import { User } from "../../dao/models/User";


type CrownDetailsState = {

}

type CrownDetailsProps = {
    open: boolean,
    crown: Crown,
    user: User,
    onClose?(): any,
    onPeakVisitedChanged?(peak: Peak, visited: boolean, date?: Date): any,
    onSave?(): any,
}

export default class CrownDetails extends Component<CrownDetailsProps, CrownDetailsState> {

    state: CrownDetailsState = {

    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                scroll="paper"
                onClose={this.props.onClose}
                fullWidth={true}
                maxWidth="lg"
            >
                <DialogTitle>
                    <SvgIcon><path d={mdiCrownOutline} /></SvgIcon>&nbsp;
                    {this.props.crown.name}
                </DialogTitle>
                <DialogContent>
                    <List className="peaks-list">
                        {this.props.crown.peaks.map((peak, idx) => {
                            const labelId = `peak-${idx}`;
                            return <ListItem key={idx}>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={this.props.user
                                            .visitedPeaks.some(x => x.peak.id === peak.id && x.visited)}
                                        inputProps={{ 'aria-labelledby': labelId }}
                                        onChange={evt => this.handlePeakVisitedChange(peak, evt.target.checked)}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={peak.name} />
                            </ListItem>
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Tooltip title="Save">
                        <Button onClick={this.handleSave}>
                            Save
                            <SvgIcon fontSize="large" color="secondary"><path d={mdiContentSaveOutline} /></SvgIcon>
                        </Button>
                    </Tooltip>
                </DialogActions>
            </Dialog>
        )
    }

    handlePeakVisitedChange = (peak: Peak, visited: boolean) => {
        if (typeof this.props.onPeakVisitedChanged !== 'function')
            return;
        this.props.onPeakVisitedChanged(peak, visited);
    }

    handleSave = () => {
        if (typeof this.props.onSave !== 'function')
            return;
        this.props.onSave();
    }

}
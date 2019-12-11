import React, { Component, SyntheticEvent } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { getCrownsAll, postCrown } from "../../dao/CrownsDAO";
import Crown from "../../dao/models/Crown";
import { PeakDbObj, postPeak } from "../../dao/PeaksDAO";
import { googleMapsClient } from "../../googlemaps";

type AdminViewState = {
    name: string,
    height: number,
    codePlus: string,
    lat: number | null,
    lng: number | null,
    crownsAll: Crown[],
    crownsSelected: Crown[],
}

export default class AdminView extends Component<any, AdminViewState> {

    state: AdminViewState = {
        name: "",
        height: 0,
        codePlus: "",
        lat: null,
        lng: null,
        crownsAll: [],
        crownsSelected: [],
    }

    async componentDidMount() {
        const crowns = await getCrownsAll();
        this.setState({
            crownsAll: crowns
        })
    }

    render() {
        return (
            <>
                <Container>
                    <h1>Admin panel</h1>
                    <div>
                        <h2>Add peak</h2>
                        <Form onSubmit={this.handleFormSubmit}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" value={this.state.name} onChange={(e: any) => this.setState({ name: e.target.value })} />
                                <Form.Text>Name of the peak.</Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Height</Form.Label>
                                <Form.Control type="number" name="height" value={this.state.height.toString()} onChange={(e: any) => this.setState({ height: e.target.value })} />
                                <Form.Text>Height of the peak.</Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <Button onClick={this.autofillByName}>Autofill by name</Button>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Code Plus</Form.Label>
                                <Form.Control type="text" name="codeplus" value={this.state.codePlus} onChange={(e: any) => this.setState({ codePlus: e.target.value })} />
                            </Form.Group>
                            <Form.Group>
                                <Button onClick={this.autofillByPlusCode}>Autofill by Code Plus</Button>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Lat</Form.Label>
                                <Form.Control type="number" name="lat" value={this.state.lat ? this.state.lat.toString() : ""} onChange={(e: any) => this.setState({ lat: e.target.value })} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Lng</Form.Label>
                                <Form.Control type="number" name="lng" value={this.state.lng ? this.state.lng.toString() : ""} onChange={(e: any) => this.setState({ lng: e.target.value })} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Crowns</Form.Label>
                                {this.state.crownsAll.map((crown, idx) => (
                                    <Form.Check
                                        custom
                                        type="checkbox"
                                        label={crown.name}
                                        value={idx}
                                        key={idx}
                                        id={`crown-selection-${idx}`}
                                        checked={this.state.crownsSelected.some(x => x.id === crown.id)}
                                        onChange={(e: any) => this.handleCrownOnChecked(crown, !!e.target.checked)}
                                    />
                                ))}
                            </Form.Group>
                            <Button type="submit">Submit</Button>
                        </Form>
                    </div>
                </Container>
            </>
        )
    }

    handleCrownOnChecked = (crown: Crown, checked: boolean) => {
        const idx = this.state.crownsSelected.findIndex((x) => x.id === crown.id);
        if (!checked && idx !== -1) {
            this.state.crownsSelected.splice(idx, 1);
            this.setState({
                crownsSelected: this.state.crownsSelected,
            })
        } else if (checked && idx === -1) {
            this.setState({
                crownsSelected: [...this.state.crownsSelected, crown],
            })
        }
    }

    handleFormSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        const { name, height, lat, lng, codePlus } = this.state;
        if (!lat || !lng)
            return;
        const peakDao: PeakDbObj = {
            name,
            height,
            lat,
            lng,
            googleCodePlus: codePlus,
        }
        const newPeak = await postPeak(peakDao);
        if (!newPeak)
            return;
        console.log(newPeak);
        const crownDaos = await Promise.all(this.state.crownsSelected.map(async (crown) => {
            crown.peaks.push(newPeak);
            const newCrown = await postCrown(crown);
            console.log(newCrown);
        }))

    }

    autofillByName = async () => {
        googleMapsClient.geocode({
            address: this.state.name
        }, (state, response) => {
            if (!response || response.status !== 200)
                return;
            console.log(response.json.results[0])
            const { plus_code: { compound_code, global_code } } = response.json.results[0];
            const { geometry: { location: { lat, lng } } } = response.json.results[0];
            this.setState({
                codePlus: compound_code || global_code || "",
                lat,
                lng,
            })
        })
    }

    autofillByPlusCode = async () => {
        googleMapsClient.geocode({
            address: this.state.codePlus
        }, (state, response) => {
            if (!response || response.status !== 200)
                return;
            console.log(response.json.results[0])
            const { geometry: { location: { lat, lng } } } = response.json.results[0];
            this.setState({
                lat,
                lng,
            })
        })
    }
}
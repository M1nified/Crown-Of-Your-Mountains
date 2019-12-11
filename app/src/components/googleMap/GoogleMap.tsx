import { mdiImageFilterHdr } from '@mdi/js';
import GoogleMapReact from 'google-map-react';
import React, { Component } from 'react';
import { VisitedPeak } from '../../dao/models/User';

type GoogleMapState = {
    map: google.maps.Map | null,
    maps: typeof google.maps | null,
    zoom: number,
};

type GoogleMapProps = {
    markers: any[],
    visitedPeaks: VisitedPeak[],
    onClickVisitedPeak?(visitedPeak: VisitedPeak): any,
    mapVersion: number,
}

export default class GoogleMap extends Component<GoogleMapProps, GoogleMapState> {

    static defaultProps: GoogleMapProps = {
        markers: [],
        visitedPeaks: [],
        mapVersion: 0,
    }

    state: GoogleMapState = {
        map: null,
        maps: null,
        zoom: 11,
    }

    markers: google.maps.Marker[] = [];

    componentDidMount() {
    }

    componentDidUpdate(prevProps: GoogleMapProps) {
        if (!this.state.maps || !this.state.map || prevProps.mapVersion === this.props.mapVersion)
            return;
        const { map, maps } = this.state;
        const image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
        const icon = {
            path: mdiImageFilterHdr,
            fillColor: '#FF0000',
            fillOpacity: 1,
            // anchor: new google.maps.Point(0, 0),
            strokeWeight: 0,
            scale: 1.2
        }
        const bounds = new google.maps.LatLngBounds();
        const markers = this.props.visitedPeaks.map(vp => {
            const marker = new maps.Marker({
                position: vp.peak.position,
                map,
                visible: true,
                icon: { ...icon, fillColor: vp.visited ? '#28a745' : '#dc3545' },
                title: vp.peak.name,
                clickable: true,
            })
            marker.addListener('click', () => {
                if (typeof this.props.onClickVisitedPeak === 'function') {
                    this.props.onClickVisitedPeak(vp);
                }
            })
            bounds.extend(vp.peak.position);
            return marker;
        })
        map.fitBounds(bounds);
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = markers;
    }

    render() {
        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'AIzaSyAb67oUw3RCIdLFlA-A1xRKLHnModQJX1U' }}
                    defaultCenter={{ lat: 50, lng: 20 }}
                    zoom={this.state.zoom}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)}
                >
                </GoogleMapReact>
            </div>
        )
    }

    handleApiLoaded = (map: any, maps: any) => {
        this.setState({
            map,
            maps,
        })
    }

}

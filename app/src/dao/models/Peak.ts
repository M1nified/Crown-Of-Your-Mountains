import { PeakDbObj } from "../PeaksDAO";

export default class Peak {
    name: string;
    height: number;
    position: { lat: number, lng: number };
    googleCodePlus?: string;
    id: string;

    constructor(id: string, name: string, height: number, lat: number, lng: number) {
        this.id = id;
        this.name = name;
        this.height = height;
        this.position = { lat, lng };
    }

    toPeakDao(): PeakDbObj {
        const { name, height, googleCodePlus, position: { lat, lng } } = this;
        return {
            name,
            height,
            googleCodePlus,
            lat,
            lng,
        }
    }
}

import Peak from "./models/Peak";
import firebase from './../firebase';

const db = firebase.firestore();
const peaksCollection = db.collection('peaks');

export type PeakDbObj = {
    name: string,
    height: number,
    googleCodePlus?: string,
    lat: number,
    lng: number,
}

export const peakFromDocumentSnapshot = (doc: firebase.firestore.DocumentSnapshot) => {
    const data = doc.data();
    if (!data) return;
    const peak = new Peak(doc.id, data.name, data.height, data.lat, data.lng);
    peak.googleCodePlus = data.googleCodePlus;
    return peak;
}

export const postPeak = async (peak: Peak | PeakDbObj) => {
    try {
        if (peak instanceof Peak) {
            await peaksCollection.doc(peak.id).set(peak.toPeakDao());
            return peak;
        } else {
            const peakToSend = { ...peak };
            const newPeakRef = await peaksCollection.add(peakToSend);
            const newPeak = peakFromDocumentSnapshot(await newPeakRef.get());
            return newPeak;
        }
    } catch (e) {
        console.error(e);
        return;
    }
}

export const getPeakRef = async (peak: Peak) => {
    return await peaksCollection.doc(peak.id);
}

export const getPeakForRef = async (ref: firebase.firestore.DocumentReference) => {
    const peakDs = await ref.get();
    if (!peakDs.exists)
        return;
    const peakDbObj = peakDs.data() as PeakDbObj;
    const { name, googleCodePlus, height, lat, lng } = peakDbObj;
    const peak = new Peak(ref.id, name, height, lat, lng);
    if (googleCodePlus) {
        peak.googleCodePlus = googleCodePlus;
    }
    return peak;
}
import * as functions from 'firebase-functions';
import { googleMapsClient } from './googlemaps';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const firebasePeakOnWriteAddCoords = functions
    .region('europe-west1')
    .firestore
    .document('peaks/{peakId}')
    .onWrite(async (change, context) => {
        console.info('write', change, context)
        console.log(change)
        console.log(context)
        if (!change.after.exists)
            return Promise.reject();
        console.info(2);
        const doc: any = change.after.data();
        console.info(3, doc);
        if (doc.googleCodePlus && doc.googleCodePlus !== '') {
            const { googleCodePlus } = doc;
            console.info(4, googleCodePlus);
            try {
                console.log(googleMapsClient.geocode({
                    address: googleCodePlus,
                }))

                const { lat, lng } = await (() => {
                    return new Promise<{ lat: number, lng: number }>((resolve, reject) => {
                        googleMapsClient.geocode({
                            address: googleCodePlus
                        }, (state, geocodingResponse) => {
                            if (state)
                                reject(state);
                            console.info('geocodingResponse', state, geocodingResponse);
                            console.log('result 0', geocodingResponse.json.results[0].geometry)
                            const { lat, lng } = geocodingResponse.json.results[0].geometry.location;
                            resolve({ lat, lng });
                        })
                    })
                })()

                return change.after.ref.set(
                    {
                        lat,
                        lng,
                    },
                    {
                        merge: true,
                    }
                )

            } catch (err) {
                console.error(err);
                return Promise.reject();
            }
        }
        console.info(3, 4);
        return Promise.reject();
    });


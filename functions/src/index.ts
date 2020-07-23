import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as express from 'express';
import * as cors from 'cors';


const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-goty-274fa.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.json("Hello from Functions of Firebase!");
});

export const getGOTY = functions.https.onRequest(async (request, response) => {
    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map( doc => doc.data());
    response.json(games);
});

//Express
const app = express();
app.use(cors({ origin:true }));

app.get('/goty', async (req, res) => {
    const gotyRef = db.collection("goty");
    const docsSnap = await gotyRef.get();
    const games = docsSnap.docs.map((doc) => doc.data());
    res.json(games);
})

app.post("/goty/:id", async (req, res) => {
  const id  = req.params.id;
  const gameRef = db.collection('goty').doc(id);
  const gameSnap = await gameRef.get();
  if (!gameSnap.exists){
      res.status(404).json({
          ok: false,
          menssage: 'Does not exists game with this ID' + id
      });
  }else{
      const before = gameSnap.data() || {votes: 0};
      // tslint:disable-next-line: no-floating-promises
      await gameRef.update({
          votes: before.votes + 1
      });
      res.json({
          ok: true,
          message: 'Thanks for your vote'
      });
  }
});

export const api = functions.https.onRequest(app);


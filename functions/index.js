const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { fetchP2PData, buildSnapshot } = require("./utils");

admin.initializeApp()

exports.snapshot = functions.https.onRequest(async (request, response) => {
  const buysKaspi = await fetchP2PData("BUY", ["KaspiBank"])
  const sellsKaspi = await fetchP2PData("SELL", ["KaspiBank"])
  const buysForte = await fetchP2PData("BUY", ["ForteBank"])
  const sellsForte = await fetchP2PData("SELL", ["ForteBank"])

  const time = new Date().getTime()

  const kaspi = buildSnapshot(buysKaspi.data, sellsKaspi.data)
  const forte = buildSnapshot(buysForte.data, sellsForte.data)

  const db = admin.database()
  await db.ref(`kaspi/${time}`).set(kaspi);
  await db.ref(`forte/${time}`).set(forte);

  response.send({ kaspi, forte });
});


exports.watchPrice = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const buysKaspi = await fetchP2PData("BUY", ["KaspiBank"])
  const sellsKaspi = await fetchP2PData("SELL", ["KaspiBank"])
  const buysForte = await fetchP2PData("BUY", ["ForteBank"])
  const sellsForte = await fetchP2PData("SELL", ["ForteBank"])

  const time = new Date().getTime()

  const kaspi = buildSnapshot(buysKaspi.data, sellsKaspi.data)
  const forte = buildSnapshot(buysForte.data, sellsForte.data)

  const db = admin.database()
  await db.ref(`kaspi/${time}`).set(kaspi);
  await db.ref(`forte/${time}`).set(forte);

  return null;
});

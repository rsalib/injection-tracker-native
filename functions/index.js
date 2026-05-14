const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.askGemini = onRequest({
    secrets: ["GEMINI_API_KEY"],
    cors: true,
    invoker: "public" // URL is public, but we enforce auth inside the function
}, async (req, res) => {
    try {
        // 1. THE BOUNCER: Check for the Authorization header
        const authHeader = req.headers.authorization || "";
        if (!authHeader.startsWith("Bearer ")) {
            console.warn("Rejected: Missing or invalid auth header");
            return res.status(401).json({ error: "Unauthorized: Missing token." });
        }

        const idToken = authHeader.split("Bearer ")[1];

        // 2. THE ID CHECK: Cryptographically verify the token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (authErr) {
            console.error("Rejected: Invalid token", authErr.message);
            return res.status(403).json({ error: "Forbidden: Invalid or expired token." });
        }

        const appCheckToken = req.headers['x-firebase-appcheck'];
        if (appCheckToken) {
            try { await admin.appCheck().verifyToken(appCheckToken); }
            catch (e) { return res.status(401).json({ error: 'Invalid App Check token' }); }
        }

        // At this point, we know the request is from a legitimate, logged-in user.
        // You could even log decodedToken.uid if you wanted to track usage per user.

        // 3. PROCEED TO GEMINI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: req.body.tools || []
        });
        
        const result = req.body.contents
            ? await model.generateContent({ contents: req.body.contents })
            : await model.generateContent(req.body.prompt);
            
        res.json(result.response);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

exports.getCalendarFeed = onRequest({
    cors: false,
    invoker: "public"
}, async (req, res) => {
    try {
        const { uid, token } = req.query;
        if (!uid || !token) return res.status(400).send("Missing uid or token");

        const db = admin.database();
        const snap = await db.ref(`users/${uid}/calendarToken`).get();
        const storedToken = snap.val();

        if (!storedToken || storedToken !== token) {
            return res.status(403).send("Invalid calendar token");
        }

        const medsSnap = await db.ref(`users/${uid}/meds`).get();
        const medsRaw = medsSnap.val() || {};
        const meds = Object.values(medsRaw);

        const DM = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
        const BD = { Monday: "MO", Tuesday: "TU", Wednesday: "WE", Thursday: "TH", Friday: "FR", Saturday: "SA", Sunday: "SU" };
        const pad = n => String(n).padStart(2, "0");
        const fmtLocal = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
        const fmtDate = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;

        let ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//InjectionTracker//EN\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:Injection Protocols\r\nREFRESH-INTERVAL;VALUE=DURATION:PT6H\r\n";

        meds.forEach(m => {
            if (!m.scheduleDays || m.isArchived) return;
            if (m.scheduleDays.length === 0) return;

            const rem = parseFloat(m.vialRemaining) || 0;
            const remMg = m.vialUnit === "mcg" ? rem / 1000 : rem;
            const doseRaw = parseFloat(m.dose) || 0;
            const doseMg = m.unit === "mcg" ? doseRaw / 1000 : doseRaw;
            const dosesLeft = doseMg > 0 ? Math.floor(remMg / doseMg) : 0;

            let totalDosesLeft = dosesLeft;
            if (m.nextVial && m.nextVial.vialTotal) {
                const nextVialMg = m.vialUnit === "mcg" ? (parseFloat(m.nextVial.vialTotal) || 0) / 1000 : (parseFloat(m.nextVial.vialTotal) || 0);
                if (doseMg > 0) totalDosesLeft += Math.floor(nextVialMg / doseMg);
            }

            m.scheduleDays.forEach(day => {
                const timeStr = m.injectionTime || "08:00";
                const [h, min] = timeStr.split(":");
                const now = new Date();
                const diff = (DM[day] - now.getDay() + 7) % 7;
                const start = new Date(now);
                start.setDate(start.getDate() + diff);
                start.setHours(parseInt(h), parseInt(min), 0);

                let rrule = `FREQ=WEEKLY;BYDAY=${BD[day]}`;
                if (totalDosesLeft > 0) {
                    const occurrencesForThisDay = Math.ceil(totalDosesLeft / m.scheduleDays.length);
                    if (occurrencesForThisDay > 0) rrule += `;COUNT=${occurrencesForThisDay}`;
                } else {
                    const cap = new Date(start);
                    cap.setFullYear(cap.getFullYear() + 1);
                    rrule += `;UNTIL=${fmtDate(cap)}T235959`;
                }

                ics += `BEGIN:VEVENT\r\nUID:${m.id}-${day}@injtrack\r\nDTSTART:${fmtLocal(start)}\r\nDURATION:PT5M\r\nRRULE:${rrule}\r\nSUMMARY:💉 ${m.name} ${m.dose}${m.unit}\r\nDESCRIPTION:Site: ${m.site || ""}${m.notes ? " | " + m.notes : ""}\r\nEND:VEVENT\r\n`;
            });
        });

        ics += "END:VCALENDAR";

        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader("Content-Disposition", "inline; filename=injection-protocols.ics");
        res.send(ics);

    } catch (error) {
        console.error("Calendar Feed Error:", error);
        res.status(500).send("Server error");
    }
});

exports.getCalendarToken = onRequest({
    cors: true,
    invoker: "public"
}, async (req, res) => {
    try {
        const authHeader = req.headers.authorization || "";
        if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

        const idToken = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (e) {
            return res.status(403).json({ error: "Invalid token" });
        }

        const appCheckToken = req.headers['x-firebase-appcheck'];
        if (appCheckToken) {
            try { await admin.appCheck().verifyToken(appCheckToken); }
            catch (e) { return res.status(401).json({ error: 'Invalid App Check token' }); }
        }

        const uid = decodedToken.uid;
        const db = admin.database();
        const snap = await db.ref(`users/${uid}/calendarToken`).get();
        let calToken = snap.val();

        if (!calToken) {
            calToken = crypto.randomBytes(24).toString("hex");
            await db.ref(`users/${uid}/calendarToken`).set(calToken);
        }

        res.json({ uid, token: calToken });

    } catch (error) {
        console.error("Token Error:", error);
        res.status(500).json({ error: error.message });
    }
});

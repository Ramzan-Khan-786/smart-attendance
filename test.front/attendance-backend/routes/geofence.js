import express from 'express';
try {
const { name, coords } = req.body; // coords as described in model
const created = await Geofence.create({ name, coords, createdBy: req.user?._id });
res.json(created);
} catch (err) {
res.status(500).json({ error: err.message });
}
});


// List presaved geofences
router.get('/list', async (req, res) => {
try {
const list = await Geofence.find().lean();
res.json(list);
} catch (err) {
res.status(500).json({ error: err.message });
}
});


// Get active geofence (if any)
router.get('/active', async (req, res) => {
try {
const active = await ActiveGeofence.findOne().populate('geofence').populate('activatedBy','name');
res.json(active || null);
} catch (err) {
res.status(500).json({ error: err.message });
}
});


// Start a geofence session (only allowed if there is no active one)
router.post('/start', async (req, res) => {
try {
// req.user expected from auth middleware
const user = req.user;
const { geofenceId, sessionName } = req.body;


const existing = await ActiveGeofence.findOne();
if (existing) return res.status(400).json({ error: 'A geofence is already active' });


const gf = await Geofence.findById(geofenceId);
if (!gf) return res.status(404).json({ error: 'Geofence not found' });


const active = await ActiveGeofence.create({
geofence: gf._id,
sessionName,
activatedBy: user._id,
activatedByName: user.name
});


res.json({ success: true, active });
} catch (err) {
res.status(500).json({ error: err.message });
}
});


// Stop the active geofence (only owner should be able to stop)
router.post('/stop', async (req, res) => {
try {
const user = req.user;
const active = await ActiveGeofence.findOne().populate('activatedBy');
if (!active) return res.status(400).json({ error: 'No active geofence' });


// Only the admin who started it (or superadmin) may stop it
if (active.activatedBy && String(active.activatedBy._id) !== String(user._id)) {
return res.status(403).json({ error: 'Only the admin who started this geofence can stop it' });
}


await ActiveGeofence.deleteOne({ _id: active._id });
res.json({ success: true });
} catch (err) {
res.status(500).json({ error: err.message });
}
});


export default router;
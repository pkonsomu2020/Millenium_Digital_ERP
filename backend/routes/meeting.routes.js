import express from 'express';
import { getAllMeetings, createMeeting, updateMeeting, deleteMeeting, sendReminder, getParticipantsList } from '../controllers/meeting.controller.js';

const router = express.Router();

router.get('/meetings/participants', getParticipantsList);
router.get('/meetings', getAllMeetings);
router.post('/meetings', createMeeting);
router.put('/meetings/:id', updateMeeting);
router.delete('/meetings/:id', deleteMeeting);
router.post('/meetings/:id/reminder', sendReminder);

export default router;

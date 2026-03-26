import { supabase } from '../config/supabase.js';
import { sendMeetingInvites, sendMeetingUpdates, sendMeetingReminders } from '../services/email.service.js';

// Helper: fetch all active participants from DB
const getParticipants = async () => {
  const { data, error } = await supabase
    .from('meeting_participants')
    .select('name, email')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data || [];
};

export const getAllMeetings = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getParticipantsList = async (req, res) => {
  try {
    const participants = await getParticipants();
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const { title, agenda, meeting_date, meeting_time, duration, location, created_by } = req.body;

    if (!title || !meeting_date || !meeting_time || !created_by) {
      return res.status(400).json({ error: 'Title, date, time and created_by are required' });
    }

    // Auto-fetch all participants from DB
    const participants = await getParticipants();
    const participantNames = participants.map(p => p.name);
    const participantEmails = participants.map(p => p.email);

    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title, agenda: agenda || null,
        meeting_date, meeting_time,
        duration: duration || null,
        location: location || null,
        participants: participantNames,
        status: 'Upcoming',
        created_by,
      })
      .select()
      .single();

    if (error) throw error;

    // Send invite emails to all participants
    let emailResult = { sent: 0, errors: [] };
    if (participantEmails.length > 0) {
      emailResult = await sendMeetingInvites(data, participantEmails).catch(err => {
        console.error('Email send error:', err);
        return { sent: 0, errors: [err.message] };
      });
    }

    res.status(201).json({ ...data, emailResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, agenda, meeting_date, meeting_time, duration, location, status } = req.body;

    // Auto-fetch all participants from DB
    const participants = await getParticipants();
    const participantNames = participants.map(p => p.name);
    const participantEmails = participants.map(p => p.email);

    const { data, error } = await supabase
      .from('meetings')
      .update({
        title, agenda, meeting_date, meeting_time,
        duration, location,
        participants: participantNames,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send update emails if meeting is still upcoming
    let emailResult = { sent: 0, errors: [] };
    if (participantEmails.length > 0 && data.status !== 'Cancelled') {
      emailResult = await sendMeetingUpdates(data, participantEmails).catch(err => {
        console.error('Email send error:', err);
        return { sent: 0, errors: [err.message] };
      });
    }

    res.json({ ...data, emailResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { custom_message } = req.body;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.status === 'Cancelled') return res.status(400).json({ error: 'Cannot send reminder for a cancelled meeting' });

    // Always send to all participants from DB
    const participants = await getParticipants();
    const emails = participants.map(p => p.email);

    if (emails.length === 0) return res.status(400).json({ error: 'No participants found in database' });

    const result = await sendMeetingReminders(meeting, emails, custom_message || null);
    res.json({ message: `Reminder sent to ${result.sent} recipient(s)`, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

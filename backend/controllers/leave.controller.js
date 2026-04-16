import { supabase } from '../config/supabase.js';
import { sendLeaveNotification } from '../services/email.service.js';

export const getAllLeaveRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('submitted_on', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const {
      employee_name, employee_email, manager, contact_while_on_leave,
      leave_type, custom_leave_type,
      start_date, end_date, days_applied, days_accrued, leave_balance, balance_bf,
      submitted_by, employee_signature
    } = req.body;

    if (!employee_name || !employee_email || !leave_type || !start_date || !end_date || days_applied == null || !submitted_by) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }
    if (leave_type === 'Others' && !custom_leave_type) {
      return res.status(400).json({ error: 'Please specify the leave type' });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_name, employee_email,
        manager: manager || 'Rose Kirwa',
        contact_while_on_leave: contact_while_on_leave || null,
        leave_type,
        custom_leave_type: leave_type === 'Others' ? custom_leave_type : null,
        start_date, end_date,
        days_applied: parseInt(days_applied),
        days_accrued: days_accrued != null && days_accrued !== '' ? parseInt(days_accrued) : null,
        leave_balance: leave_balance != null && leave_balance !== '' ? parseInt(leave_balance) : null,
        balance_bf: balance_bf != null && balance_bf !== '' ? parseInt(balance_bf) : null,
        reason: '',
        handover_reviewed: false,
        handover_notes: null,
        submitted_by,
        employee_signature: employee_signature || null,
        status: 'Pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Send email notification to HR team (non-blocking)
    sendLeaveNotification(data).catch(err =>
      console.error('Leave notification email failed:', err.message)
    );

    res.status(201).json(data);
  } catch (error) {
    console.error('createLeaveRequest error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewed_by, hr_remarks, hr_signature, deferred_date } = req.body;

    if (!status || !reviewed_by) {
      return res.status(400).json({ error: 'Status and reviewer are required' });
    }
    if (!['Approved', 'Rejected', 'Deferred'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    if (status === 'Rejected' && !hr_remarks) {
      return res.status(400).json({ error: 'Remarks are required for rejection' });
    }
    if (status === 'Deferred' && !deferred_date) {
      return res.status(400).json({ error: 'Deferred date is required' });
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status,
        reviewed_by,
        reviewed_on: new Date().toISOString(),
        hr_remarks: hr_remarks || null,
        hr_signature: hr_signature || null,
        deferred_date: deferred_date || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('leave_requests').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Leave request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_name, employee_email, manager, contact_while_on_leave,
      leave_type, custom_leave_type,
      start_date, end_date, days_applied, days_accrued, leave_balance, balance_bf,
      submitted_by, employee_signature
    } = req.body;

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        employee_name, employee_email,
        manager: manager || 'Rose Kirwa',
        contact_while_on_leave: contact_while_on_leave || null,
        leave_type,
        custom_leave_type: leave_type === 'Others' ? custom_leave_type : null,
        start_date, end_date,
        days_applied: parseInt(days_applied),
        days_accrued: days_accrued != null && days_accrued !== '' ? parseInt(days_accrued) : null,
        leave_balance: leave_balance != null && leave_balance !== '' ? parseInt(leave_balance) : null,
        balance_bf: balance_bf != null && balance_bf !== '' ? parseInt(balance_bf) : null,
        reason: '',
        handover_reviewed: false,
        handover_notes: null,
        submitted_by,
        employee_signature: employee_signature || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import { supabase } from '../config/supabase.js';
import { sendLeaveNotification, sendLeaveDecisionNotification, sendStageHandoffNotification } from '../services/email.service.js';

// Two-stage leave approval chain: stage 1 must review before stage 2 can act.
// Stage 2's decision is what finalizes the request's overall status.
const LEAVE_APPROVAL_CHAIN = [
  { stage: 1, label: 'Esther', email: 'ekiilu@afosi.org' },
  { stage: 2, label: 'Rose', email: 'rosekirwa@millenium.co.ke' },
];

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
        days_accrued: days_accrued != null && days_accrued !== '' ? parseFloat(days_accrued) : null,
        leave_balance: leave_balance != null && leave_balance !== '' ? parseFloat(leave_balance) : null,
        balance_bf: balance_bf != null && balance_bf !== '' ? parseFloat(balance_bf) : null,
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
    const { status, reviewer_email, reviewer_name, hr_remarks, deferred_date } = req.body;

    if (!status || !reviewer_email || !reviewer_name) {
      return res.status(400).json({ error: 'Status, reviewer_email and reviewer_name are required' });
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

    const approver = LEAVE_APPROVAL_CHAIN.find(
      (a) => a.email.toLowerCase() === String(reviewer_email).toLowerCase()
    );
    if (!approver) {
      return res.status(403).json({ error: 'You are not authorized to review leave requests.' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'This request has already been finalized.' });
    }

    const now = new Date().toISOString();
    let updates;

    if (approver.stage === 1) {
      if (existing.stage1_status && existing.stage1_status !== 'Pending') {
        return res.status(400).json({ error: `This request has already been reviewed by ${approver.label}.` });
      }
      updates = {
        stage1_status: status,
        stage1_reviewed_by: reviewer_name,
        stage1_reviewed_on: now,
        stage1_remarks: hr_remarks || null,
        stage1_signature: reviewer_name,
      };
    } else {
      if (!existing.stage1_status || existing.stage1_status === 'Pending') {
        return res.status(400).json({ error: 'Esther must review this request before Rose can give final approval.' });
      }
      if (existing.stage2_status && existing.stage2_status !== 'Pending') {
        return res.status(400).json({ error: `This request has already been finalized by ${approver.label}.` });
      }
      updates = {
        stage2_status: status,
        stage2_reviewed_by: reviewer_name,
        stage2_reviewed_on: now,
        stage2_remarks: hr_remarks || null,
        stage2_signature: reviewer_name,
        // Stage 2 is the final decision — mirror it onto the overall/legacy columns.
        status,
        reviewed_by: reviewer_name,
        reviewed_on: now,
        hr_remarks: hr_remarks || null,
        hr_signature: reviewer_name,
        deferred_date: deferred_date || null,
        updated_at: now,
      };
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (approver.stage === 2) {
      // Final decision — notify the employee (non-blocking)
      sendLeaveDecisionNotification(data).catch(err =>
        console.error('Leave decision email failed:', err.message)
      );
    } else {
      // Stage 1 done — notify Rose it's her turn (non-blocking)
      sendStageHandoffNotification(data).catch(err =>
        console.error('Stage handoff email failed:', err.message)
      );
    }

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
        days_accrued: days_accrued != null && days_accrued !== '' ? parseFloat(days_accrued) : null,
        leave_balance: leave_balance != null && leave_balance !== '' ? parseFloat(leave_balance) : null,
        balance_bf: balance_bf != null && balance_bf !== '' ? parseFloat(balance_bf) : null,
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

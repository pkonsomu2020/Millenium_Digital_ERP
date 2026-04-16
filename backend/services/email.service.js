import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || 'onboarding@resend.dev';

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
};

const formatTime = (timeStr) => {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
};

const meetingInviteHtml = (meeting) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#D1131B;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Millenium Solutions</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Meeting Invitation</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;">You have been invited to a meeting. Please find the details below.</p>

            <!-- Meeting Card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Meeting Title</p>
                  <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${meeting.title}</p>
                </td>
              </tr>
              ${meeting.agenda ? `
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Agenda</p>
                  <p style="margin:0;color:#374151;font-size:14px;">${meeting.agenda}</p>
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">📅 Date</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatDate(meeting.meeting_date)}</p>
                      </td>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">🕐 Time</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatTime(meeting.meeting_time)}${meeting.duration ? ` &nbsp;·&nbsp; ${meeting.duration}` : ''}</p>
                      </td>
                    </tr>
                    ${meeting.location ? `
                    <tr>
                      <td colspan="2" style="padding:16px 24px;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">📍 Location</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${meeting.location}</p>
                      </td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 8px;color:#374151;font-size:14px;">This meeting was scheduled by <strong>${meeting.created_by}</strong>.</p>
            <p style="margin:0;color:#6b7280;font-size:13px;">Please ensure you are available at the scheduled time. If you have any questions, contact the meeting organiser.</p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Millenium Solutions &nbsp;·&nbsp; This is an automated notification</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const meetingUpdateHtml = (meeting) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#f59e0b;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Millenium Solutions</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Meeting Updated</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;">A meeting you are part of has been updated. Here are the latest details:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Meeting Title</p>
                  <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${meeting.title}</p>
                </td>
              </tr>
              ${meeting.agenda ? `<tr><td style="padding:16px 24px;border-bottom:1px solid #e5e7eb;"><p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Agenda</p><p style="margin:0;color:#374151;font-size:14px;">${meeting.agenda}</p></td></tr>` : ''}
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📅 Date &amp; Time</p>
                  <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatDate(meeting.meeting_date)} at ${formatTime(meeting.meeting_time)}${meeting.duration ? ` (${meeting.duration})` : ''}</p>
                </td>
              </tr>
              ${meeting.location ? `<tr><td style="padding:16px 24px;"><p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📍 Location</p><p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${meeting.location}</p></td></tr>` : ''}
            </table>
            <p style="margin:0;color:#6b7280;font-size:13px;">Updated by <strong>${meeting.created_by}</strong>. Please update your calendar accordingly.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Millenium Solutions &nbsp;·&nbsp; This is an automated notification</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

/**
 * Send meeting invite emails to all participants
 */
export const sendMeetingInvites = async (meeting, participantEmails) => {
  if (!participantEmails || participantEmails.length === 0) return { sent: 0, errors: [] };

  const errors = [];
  let sent = 0;

  for (const email of participantEmails) {
    try {
      await resend.emails.send({
        from: `Millenium Solutions <${FROM}>`,
        to: email,
        subject: `Meeting Invitation: ${meeting.title} — ${formatDate(meeting.meeting_date)}`,
        html: meetingInviteHtml(meeting),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send invite to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  return { sent, errors };
};

/**
 * Send meeting update emails to all participants
 */
export const sendMeetingUpdates = async (meeting, participantEmails) => {
  if (!participantEmails || participantEmails.length === 0) return { sent: 0, errors: [] };

  const errors = [];
  let sent = 0;

  for (const email of participantEmails) {
    try {
      await resend.emails.send({
        from: `Millenium Solutions <${FROM}>`,
        to: email,
        subject: `Meeting Updated: ${meeting.title} — ${formatDate(meeting.meeting_date)}`,
        html: meetingUpdateHtml(meeting),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send update to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  return { sent, errors };
};

const meetingReminderHtml = (meeting, customMessage) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#7c3aed;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Millenium Solutions</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">⏰ Meeting Reminder</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;">This is a reminder about an upcoming meeting you are expected to attend.</p>
            ${customMessage ? `<div style="background:#f3f0ff;border-left:4px solid #7c3aed;padding:12px 16px;border-radius:4px;margin-bottom:20px;"><p style="margin:0;color:#374151;font-size:14px;font-style:italic;">"${customMessage}"</p></div>` : ''}
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Meeting Title</p>
                  <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${meeting.title}</p>
                </td>
              </tr>
              ${meeting.agenda ? `<tr><td style="padding:16px 24px;border-bottom:1px solid #e5e7eb;"><p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Agenda</p><p style="margin:0;color:#374151;font-size:14px;">${meeting.agenda}</p></td></tr>` : ''}
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📅 Date</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatDate(meeting.meeting_date)}</p>
                      </td>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">🕐 Time</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatTime(meeting.meeting_time)}${meeting.duration ? ` · ${meeting.duration}` : ''}</p>
                      </td>
                    </tr>
                    ${meeting.location ? `<tr><td colspan="2" style="padding:16px 24px;"><p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📍 Location</p><p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${meeting.location}</p></td></tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>
            <p style="margin:0;color:#6b7280;font-size:13px;">Please ensure you are prepared and available. Contact <strong>${meeting.created_by}</strong> for any queries.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Millenium Solutions &nbsp;·&nbsp; This is an automated reminder</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

/**
 * Send meeting reminder emails
 */
export const sendMeetingReminders = async (meeting, participantEmails, customMessage) => {
  if (!participantEmails || participantEmails.length === 0) return { sent: 0, errors: [] };

  const errors = [];
  let sent = 0;

  for (const email of participantEmails) {
    try {
      await resend.emails.send({
        from: `Millenium Solutions <${FROM}>`,
        to: email,
        subject: `Reminder: ${meeting.title} — ${formatDate(meeting.meeting_date)}`,
        html: meetingReminderHtml(meeting, customMessage),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  return { sent, errors };
};

const leaveNotificationHtml = (leave) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#D1131B;padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Millenium Solutions</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">New Leave Request — Action Required</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;color:#374151;font-size:15px;">A new leave application has been submitted and requires your review.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Employee</p>
                  <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${leave.employee_name}</p>
                  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">${leave.employee_email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Leave Type</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${leave.leave_type === 'Others' && leave.custom_leave_type ? leave.custom_leave_type : leave.leave_type}</p>
                      </td>
                      <td width="50%" style="padding:16px 24px;border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">Days Applied</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${leave.days_applied} day(s)</p>
                      </td>
                    </tr>
                    <tr>
                      <td width="50%" style="padding:16px 24px;border-right:1px solid #e5e7eb;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📅 Start Date</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatDate(leave.start_date)}</p>
                      </td>
                      <td width="50%" style="padding:16px 24px;">
                        <p style="margin:0 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;">📅 End Date</p>
                        <p style="margin:0;color:#374151;font-size:14px;font-weight:600;">${formatDate(leave.end_date)}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:14px 18px;margin-bottom:20px;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">⚠️ This request is currently <span style="color:#D1131B;">Pending</span> and awaiting your approval.</p>
            </div>
            <p style="margin:0;color:#6b7280;font-size:13px;">Please log in to the HR Dashboard to review and take action on this leave request.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Millenium Solutions &nbsp;·&nbsp; This is an automated notification</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const HR_EMAILS = ['rosekirwa@millenium.co.ke', 'ekiilu@afosi.org'];

/**
 * Send leave request notification to HR team
 */
export const sendLeaveNotification = async (leave) => {
  const errors = [];
  let sent = 0;

  for (const email of HR_EMAILS) {
    try {
      await resend.emails.send({
        from: `Millenium Solutions <${FROM}>`,
        to: email,
        subject: `New Leave Request: ${leave.employee_name} — ${leave.leave_type === 'Others' && leave.custom_leave_type ? leave.custom_leave_type : leave.leave_type}`,
        html: leaveNotificationHtml(leave),
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send leave notification to ${email}:`, err.message);
      errors.push({ email, error: err.message });
    }
  }

  return { sent, errors };
};

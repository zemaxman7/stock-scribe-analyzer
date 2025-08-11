# EmailJS "Recipients Address is Empty" Error Fix

## Error Description
```
EmailJS test failed: EmailJSResponseStatus {status: 422, text: 'The recipients address is empty'}
```

## Root Cause
The error occurs because EmailJS is expecting a recipient email address but receiving an empty value. This happens when:

1. **Missing `to_email` parameter**: EmailJS templates often require a `to_email` parameter to specify the recipient
2. **Empty form fields**: The approver email field is not filled before testing
3. **Template parameter mismatch**: The EmailJS template expects different parameter names than what's being sent

## What Was Fixed

### 1. Added `to_email` Parameter
The EmailJS template now receives a `to_email` parameter for compatibility:
```typescript
const templateParams = {
  to_email: approverEmail, // Added for EmailJS compatibility
  approver_email: approverEmail,
  // ... other parameters
};
```

### 2. Enhanced Test Function
The `testEmailJSConnection` function now:
- Validates that approver email is provided before testing
- Sends complete template parameters including `to_email`
- Uses actual form data instead of generic test data

### 3. Improved Validation
- Added client-side validation for required email fields
- Test button is disabled until required fields are filled
- Clear error messages guide users on what to fill

### 4. Better Error Handling
- Added validation for empty recipient emails
- Enhanced logging to track email parameters
- More descriptive error messages

## How to Test

1. **Fill Required Fields First**:
   - Enter approver name
   - Enter approver email address
   - Fill other form fields as needed

2. **Test EmailJS Connection**:
   - Click "ทดสอบการเชื่อมต่อ EmailJS" button
   - The button will be disabled until required fields are filled

3. **Check Console Logs**:
   - Look for "EmailJS Test Parameters" log
   - Verify `to_email` and `approver_email` are populated

## Template Parameters Required

Your EmailJS template should expect these parameters:
```typescript
{
  to_email: "recipient@example.com",        // Required by EmailJS
  approver_email: "recipient@example.com",  // Your custom field
  requester: "John Doe",
  approver_name: "Manager Name",
  account_name: "Account Name",
  amount: "1,000",
  items_table: "<table>...</table>",
  note: "Request note",
  approve_url: "https://...",
  reject_url: "https://..."
}
```

## Common Issues and Solutions

### Issue: Still getting "recipients address is empty"
**Solution**: Check your EmailJS template configuration:
1. Ensure the template has a "To Email" field
2. Map the `to_email` parameter to the "To Email" field
3. Verify the template is published and active

### Issue: Test button remains disabled
**Solution**: Fill in the required fields:
1. Approver Name (ชื่อผู้อนุมัติ)
2. Approver Email (อีเมลผู้อนุมัติ)

### Issue: EmailJS initialization fails
**Solution**: Check environment variables:
1. Verify `.env` file exists
2. Check `VITE_EMAILJS_PUBLIC_KEY` is set
3. Restart the development server

## Debugging Steps

1. **Check Console Logs**:
   ```
   EmailJS Config: { SERVICE_ID: "...", TEMPLATE_ID: "...", PUBLIC_KEY: "***..." }
   EmailJS Test Parameters: { to_email: "...", approver_email: "...", ... }
   ```

2. **Verify Form Data**:
   - Ensure `emailPreviewData.approverEmail` is not empty
   - Check that `emailPreviewData.approverName` is filled

3. **Test with Valid Email**:
   - Use a real email address (not empty string)
   - Avoid test emails like "test@test.com" if your EmailJS service has restrictions

## Environment Variables

Ensure your `.env` file contains:
```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

## Next Steps

After fixing this error:
1. Test the EmailJS connection successfully
2. Verify budget requests can be saved to Supabase
3. Test the complete email sending workflow
4. Monitor for any new errors in the console

## Support

If you continue to experience issues:
1. Check the browser console for detailed error logs
2. Verify EmailJS template configuration
3. Test with a simple EmailJS template first
4. Contact EmailJS support if the issue persists

# Connect Sofinora registrations to Google Sheets

1. Import `outputs/registration-tracking/FinPlanner-Registration-Tracker.xlsx` into Google Drive and open it as a Google Sheet.
2. In the Sheet, choose **Extensions → Apps Script**.
3. Replace the editor contents with `integrations/google-sheets/Code.gs`, then save.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**, then deploy.
6. Copy the `/exec` web-app URL into `.env.local`:

   `VITE_REGISTRATION_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

7. Restart the website. New unique registrations will appear in the `Registrations` sheet and the summary will update automatically.

Never publish or share the registration workbook. It contains personal data.

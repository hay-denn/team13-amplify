import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({});

const sendEmail = async (recipientEmail, htmlBody, textBody) => {
  const params = {
    Source: "cognito@cpsc4911.com",
    Destination: {
      ToAddresses: [recipientEmail]
    },
    Message: {
      Subject: {
        Data: "Daily Point Email"
      },
      Body: {
        // Provide both HTML and plain text versions
        Html: {
          Data: htmlBody
        },
        Text: {
          Data: textBody
        }
      }
    }
  };

  try {
    await sesClient.send(new SendEmailCommand(params));
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipientEmail}:`, error);
  }
};

const handler = async (event) => {
  const userEmail = event.request.userAttributes.email;

  try {
    // --- STEP 1: GET User Details ---
    // Replace with your actual user details API endpoint.
    const userDetailsApiUrl = `https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver?DriverEmail=${encodeURIComponent(userEmail)}`;
    const userDetailsResponse = await fetch(userDetailsApiUrl);
    if (!userDetailsResponse.ok) {
      console.log(`Failed to fetch user details: ${userDetailsResponse.statusText}`);
    }
    const userData = await userDetailsResponse.json();

    // Check if DriverPointChangeNotification is enabled
    if (userData.DriverPointChangeNotification === 1) {
      // --- STEP 2: GET Point Changes Data ---
      // Replace with your actual point changes API endpoint.
      const pointChangesApiUrl = 'https://kco45spzej.execute-api.us-east-1.amazonaws.com/dev1/pointchanges';
      const pointChangesResponse = await fetch(pointChangesApiUrl);
      if (!pointChangesResponse.ok) {
        console.log(`Failed to fetch point changes: ${pointChangesResponse.statusText}`);
      }
      const pointChangesList = await pointChangesResponse.json(); // Expected to be an array of JSON objects

      // --- STEP 3: Filtering and formatting the data ---
      // Format today's date in the expected ISO format with time set to midnight UTC.
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      // Filter records to include only those that:
      // a) Have PointChangeDriver matching userEmail.
      // b) Have PointChangeDate exactly matching today's ISO string.
      const matchingPointChanges = pointChangesList.filter(record => {
        return record.PointChangeDriver === userEmail &&
               record.PointChangeDate === todayISOString;
      });

      // If there are matching point changes, create the points summary in HTML and a fallback plain text version.
      if (matchingPointChanges.length > 0) {
        // Create table rows for HTML table
        const tableRows = matchingPointChanges.map(record => `
          <tr>
            <td>${record.PointChangeDate}</td>
            <td>${record.PointChangeSponsor}</td>
            <td>${record.PointChangeNumber}</td>
            <td>${record.PointChangeAction}</td>
          </tr>
        `).join('');

        // Build the complete HTML email body
        const htmlPointsSummary = `
          <html>
            <body>
              <p>Below are your point changes from the last day:</p>
              <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sponsor</th>
                    <th>Change Amount</th>
                    <th>Change Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </body>
          </html>
        `;

        // Also build a simple plain text version as fallback (optional).
        const textPointsSummary = matchingPointChanges
          .map(record => 
            `Date: ${record.PointChangeDate} | Sponsor: ${record.PointChangeSponsor} | Change Amount: ${record.PointChangeNumber} | Change Action: ${record.PointChangeAction}`)
          .join('\n');

        // Log or store the summary as needed.
        await sendEmail(userEmail, htmlPointsSummary, "Below are your point changes from the last day:\n" + textPointsSummary);
      }
    }

    return event;
  } catch (error) {
    console.log("Error in Cognito post auth lambda function:", error);
  }
};

export { handler };

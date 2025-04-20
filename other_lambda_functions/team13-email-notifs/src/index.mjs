import { 
  CognitoIdentityProviderClient, 
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const sesClient = new SESClient({});


const sendEmail = async (recipientEmail, emailSubject, emailBody) => {
    const params = {
        Source: "cognito@cpsc4911.com",
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Subject: {
                Data: emailSubject
            },
            Body: {
                Text: {
                    Data: emailBody
                }
            }
        }
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      console.log(`Email sent to ${recipientEmail}`);
    } catch (error) {
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        throw new Error("Email sending failed.");
    }
};

export const handler = async (event) => {
  try {
    const { username, emailBody, emailSubject } = JSON.parse(event.body);

    await sendEmail(username, emailSubject, emailBody);
    return {message: `User ${username} email sent successfully`};

  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
};

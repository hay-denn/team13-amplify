import { 
  CognitoIdentityProviderClient, 
  GetUserCommand, 
  AdminCreateUserCommand, 
  AdminUpdateUserAttributesCommand, 
  AdminDeleteUserCommand, 
  AdminAddUserToGroupCommand,
  AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const sesClient = new SESClient({});


const sendEmail = async (recipientEmail, temporaryPassword) => {
    const params = {
        Source: "cognito@cpsc4911.com",
        Destination: {
            ToAddresses: [recipientEmail]
        },
        Message: {
            Subject: {
                Data: "Your Temporary Password"
            },
            Body: {
                Text: {
                    Data: `Hello,\n\nYour temporary password is: ${temporaryPassword}\n\nPlease log in and reset your password immediately.`
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
    const { action, userPoolId, username, accessToken, attributes, password, userGroup } = JSON.parse(event.body);
    // Validate the provided access token
    const user = await cognitoClient.send(new GetUserCommand({ AccessToken: accessToken }));

    if (!user) {
      throw new Error("Invalid access token. User not authenticated.");
    }

    switch (action) {
      case "createUser":
        if (!attributes || !password) {
          throw new Error("Missing attributes or password for creating a user.");
        }
        await cognitoClient.send(new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: username,
          TemporaryPassword: password,
          UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({
            Name,
            Value,
          })),
        }));
        await cognitoClient.send(new AdminAddUserToGroupCommand({
          GroupName: userGroup,
          UserPoolId: userPoolId,
          Username: username,
        }));
        return { message: `User ${username} created successfully.` };

      case "updateUser":
        if (!attributes) {
          throw new Error("Missing attributes for updating a user.");
        }
        await cognitoClient.send(new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: username,
          UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({
            Name,
            Value,
          })),
        }));
        return { message: `User ${username} updated successfully.` };

      case "deleteUser":
        await cognitoClient.send(new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        }));
        return { message: `User ${username} deleted successfully.` };
      
      case "resetPassword":
        await cognitoClient.send(new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: username,
          Password: "TempPass123@",
          Permanent: false,
        }));
        await sendEmail(username, "TempPass123@");
        return {message: `User ${username} password reset email sent successfully`};

      default:
        throw new Error("Invalid action.");
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
};

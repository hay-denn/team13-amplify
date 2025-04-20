import pkg from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } = pkg;

const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
const sesClient = new SESClient({ region: "us-east-1" });

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  const userPoolId = event.userPoolId;
  const username = event.userName;
  const userEmail = event.request.userAttributes.email;
  const UserFName = event.request.userAttributes.given_name;
  const UserLName = event.request.userAttributes.family_name;

  const groupparams = {
    Username: username,
    UserPoolId: userPoolId,
  };

  try {
    const groupCommand = new AdminListGroupsForUserCommand(groupparams);
    const groups = await cognitoClient.send(groupCommand);

    // Assign user to Driver group if not in any group
    if (groups.Groups.length === 0) {
      console.log("User is not in a group and is therefore a driver.");

      const addToGroupCommand = new AdminAddUserToGroupCommand({
        GroupName: "Driver",
        UserPoolId: userPoolId,
        Username: username,
      });

      await cognitoClient.send(addToGroupCommand);
      console.log(`✅ User ${username} added to Driver group.`);

      // Send user data to backend API
      console.log("📡 Sending user data to database...");
      const apiResponse = await fetch("https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DriverEmail: userEmail,
          DriverFName: UserFName,
          DriverLName: UserLName,
        }),
      });

      console.log("✅ User data successfully sent to database:", apiResponse.status);
    }

    // 📧 Send welcome email upon sign-up
    if (event.triggerSource === "PostConfirmation_ConfirmSignUp") {
      console.log(`📧 Sending welcome email to ${userEmail}...`);

      const emailCommand = new SendEmailCommand({
        Destination: {
          ToAddresses: [userEmail],
        },
        Message: {
          Body: {
            Text: {
              Data: `Welcome, ${UserFName}!\n\nThank you for signing up!\n\nVisit your dashboard: https://main.d1zgxgaa1s4k42.amplifyapp.com`,
            },
          },
          Subject: { Data: "🎉 Thank You For Signing Up!" },
        },
        Source: "cognito@cpsc4911.com",
      });

      try {
        const response = await sesClient.send(emailCommand);
        console.log(`✅ Welcome email sent to ${userEmail}`, response);
      } catch (emailError) {
        console.error("❌ Error sending welcome email:", emailError);
      }
    }

    // 🔐 Log password reset via "Forgot Password" flow
    else if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") {
      console.log(`🔐 Logging password reset for ${userEmail}...`);

      try {
        const logResponse = await fetch("https://8y9n1ik5pc.execute-api.us-east-1.amazonaws.com/dev1/passwordChanges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userEmail,
            changeType: "forgot password",
          }),
        });

        if (!logResponse.ok) {
          const errorText = await logResponse.text();
          console.error("❌ Failed to log password change:", errorText);
        } else {
          console.log("✅ Password reset logged successfully.");
        }
      } catch (err) {
        console.error("❌ Error logging password reset:", err);
      }
    }

  } catch (error) {
    console.error("❌ Error processing post-confirmation logic:", error);
  } finally {
    console.log("Returning event:", JSON.stringify(event, null, 2));
  }

  return event;
};
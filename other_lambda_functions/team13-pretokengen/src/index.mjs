import https from "https";

export async function handler(event) {
  const userAttributes = event.request.userAttributes;

  const user = userAttributes.email || event.userName;
  const loginDate = new Date().toISOString();
  const success = true;

  const postData = JSON.stringify({
    user,
    loginDate,
    success
  });

  const options = {
    hostname: "8y9n1ik5pc.execute-api.us-east-1.amazonaws.com",
    path: "/dev1/loginAttempts",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      res.setEncoding("utf8");
      res.on("data", () => {});
      res.on("end", resolve);
    });

    req.on("error", (e) => {
      console.error("Error sending login attempt log:", e);
      resolve();
    });

    req.write(postData);
    req.end();
  });

  event.response = {
    claimsAndScopeOverrideDetails: {
      idTokenGeneration: {
        claimsToAddOrOverride: {
          name: userAttributes.name || "",
          family_name: userAttributes.family_name || ""
        }
      }
    }
  };

  return event;
}
import React, { useState, useEffect } from 'react';
import './EmailNotificationSliders.css';

interface EmailNotificationSlidersProps {
  email: string;
  firstName: string;
  lastName: string;
}

const EmailNotificationSliders: React.FC<EmailNotificationSlidersProps> = ({ email, firstName, lastName }) => {
  const [pointChangeEmail, setPointChangeEmail] = useState<number>(0);
  const [orderPlaceEmail, setOrderPlaceEmail] = useState<number>(0);
  const [orderIssueEmail, setOrderIssueEmail] = useState<number>(0);

  // Fetch the notification settings from the API
  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(
        `https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver?DriverEmail=${encodeURIComponent(email)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPointChangeEmail(data.DriverPointChangeNotification);
      setOrderPlaceEmail(data.DriverOrderPlacedNotification);
      setOrderIssueEmail(data.DriverOrderIssueNotification);
    } catch (error) {
      console.error("Error fetching driver data:", error);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Handlers for checkbox changes convert the boolean to 1 or 0.
  const handlePointChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointChangeEmail(e.target.checked ? 1 : 0);
  };

  const handleOrderPlaceEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderPlaceEmail(e.target.checked ? 1 : 0);
  };

  const handleOrderIssueEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderIssueEmail(e.target.checked ? 1 : 0);
  };

  // Handler for the Save Changes button that makes a PUT request
  const handleSave = async () => {
    const payload = {
      "DriverEmail": email,
      "DriverFName": firstName,
      "DriverLName": lastName,
      "DriverPointChangeNotification": pointChangeEmail,
      "DriverOrderPlacedNotification": orderPlaceEmail,
      "DriverOrderIssueNotification": orderIssueEmail
    };
    console.log(payload);

    try {
      const response = await fetch(
        "https://o201qmtncd.execute-api.us-east-1.amazonaws.com/dev1/driver",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      } else {
        alert("Notification settings updated!");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to change notification settings.");
    }
  };

  return (
    <div className="email-notification-sliders">
      <div className="checkbox-container">
        <label htmlFor="pointChangeEmail">
          Point Change Email: {pointChangeEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="pointChangeEmail"
          type="checkbox"
          checked={pointChangeEmail === 1}
          onChange={handlePointChangeEmail}
        />
      </div>

      <div className="checkbox-container">
        <label htmlFor="orderPlaceEmail">
          Order Place Email: {orderPlaceEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="orderPlaceEmail"
          type="checkbox"
          checked={orderPlaceEmail === 1}
          onChange={handleOrderPlaceEmail}
        />
      </div>

      <div className="checkbox-container">
        <label htmlFor="orderIssueEmail">
          Order Issue Email: {orderIssueEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="orderIssueEmail"
          type="checkbox"
          checked={orderIssueEmail === 1}
          onChange={handleOrderIssueEmail}
        />
      </div>

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EmailNotificationSliders;

import React, { useState, useEffect } from 'react';
import './EmailNotificationSliders.css';

interface EmailNotificationSlidersProps {
  email: string;
  firstName: string,
  lastName: string
}

const EmailNotificationSliders: React.FC<EmailNotificationSlidersProps> = ({ email, firstName, lastName }) => {
  const [pointChangeEmail, setPointChangeEmail] = useState<number>(0);
  const [orderPlaceEmail, setOrderPlaceEmail] = useState<number>(0);
  const [orderIssueEmail, setOrderIssueEmail] = useState<number>(0);

  // Placeholder function to simulate fetching current settings from an API.
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
        setOrderIssueEmail(data.DriverOrderIssueNotificaiton);
      } catch (error) {
        console.error("Error fetching driver data:", error);
      }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Handler functions for slider changes
  const handlePointChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointChangeEmail(e.target.valueAsNumber);
  };

  const handleOrderPlaceEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderPlaceEmail(e.target.valueAsNumber);
  };

  const handleOrderIssueEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderIssueEmail(e.target.valueAsNumber);
  };

  // Handler for the Save Changes button
  const handleSave = async () => {
    const payload = {
      "DriverEmail": email,
      "DriverFName": firstName,
      "DriverLName": lastName,
      "DriverPointChangeNotification": pointChangeEmail,
      "DriverOrderPlacedNotification": orderPlaceEmail,
      "DriverOrderIssueNotificaiton": orderIssueEmail
    };
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
      <div className="slider-container">
        <label htmlFor="pointChangeEmail">
          Point Change Email: {pointChangeEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="pointChangeEmail"
          type="range"
          min="0"
          max="1"
          step="1"
          value={pointChangeEmail}
          onChange={handlePointChangeEmail}
        />
      </div>

      <div className="slider-container">
        <label htmlFor="orderPlaceEmail">
          Order Place Email: {orderPlaceEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="orderPlaceEmail"
          type="range"
          min="0"
          max="1"
          step="1"
          value={orderPlaceEmail}
          onChange={handleOrderPlaceEmail}
        />
      </div>

      <div className="slider-container">
        <label htmlFor="orderIssueEmail">
          Order Issue Email: {orderIssueEmail === 1 ? 'On' : 'Off'}
        </label>
        <input
          id="orderIssueEmail"
          type="range"
          min="0"
          max="1"
          step="1"
          value={orderIssueEmail}
          onChange={handleOrderIssueEmail}
        />
      </div>

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EmailNotificationSliders;

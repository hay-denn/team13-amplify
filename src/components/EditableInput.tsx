import React, { useState } from 'react';
import AWS from 'aws-sdk';
import { useAuth } from 'react-oidc-context';


interface EditableInputProps {
  attributeValue: string;
  attributeName: string;
}

const EditableInput: React.FC<EditableInputProps> = ({ attributeValue, attributeName }) => {
    const { user } = useAuth();
    // Configure AWS Cognito Identity Service Provider
    const cognitoISP = new AWS.CognitoIdentityServiceProvider({
        region: 'your-region', // Replace with your region
    });
  
    const updateUserAttributes = async (name: string, value: string) => {
        if (!user) {
          console.error('User is not authenticated');
          return;
        }
      
        // Prepare the user attributes dynamically based on input variables
        const userAttributes = [
          {
            "Name": name,
            "Value": value,
          }
        ];
      
        const params = {
          UserPoolId: 'us-east-1_jnOjoFtl2',  // Your User Pool ID
          Username: user.profile.email || "",  // Use the logged-in user's username
          UserAttributes: userAttributes,  // Pass in the dynamically created user attributes
        };
      
        try {
          // Update user attributes in the User Pool
          const response = await cognitoISP.adminUpdateUserAttributes(params).promise();
          console.log('User attributes updated successfully', response);
        } catch (error) {
          console.error('Error updating user attributes', error);
        }
      };

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(attributeValue);
  const [tempValue, setTempValue] = useState(attributeValue);

  const handleEditClick = () => {
    setTempValue(inputValue);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setInputValue(tempValue);
    updateUserAttributes(attributeName, tempValue)
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
          />
          <button onClick={handleSaveClick}>Save</button>
          <button onClick={handleCancelClick}>Cancel</button>
        </div>
      ) : (
        <div>
          <input type="text" value={inputValue} readOnly />
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default EditableInput;



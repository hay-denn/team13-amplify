import React, { useState } from 'react';


interface EditableInputProps {
  attributeValue: string;
  attributeName: string;
}

const EditableInput: React.FC<EditableInputProps> = ({ attributeValue, attributeName }) => {

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(attributeValue);
  const [tempValue, setTempValue] = useState(attributeValue);

  const handleEditClick = () => {
    setTempValue(inputValue);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setInputValue(tempValue);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div>
      {isEditing ? (
        <div>
            <label>{attributeName}</label>
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
            <label>{attributeName}</label>
          <input type="text" value={inputValue} readOnly />
          <button onClick={handleEditClick}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default EditableInput;



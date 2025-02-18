import React, { useState } from "react";

interface EditableInputProps {
  attributeName: string;
  attributeValue: string;
  onChange: (value: string) => void;
}

const EditableInput: React.FC<EditableInputProps> = ({ attributeName, attributeValue, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(attributeValue);

  const handleEditClick = () => {
    setTempValue(attributeValue);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setTempValue(attributeValue);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold">{attributeName}</label>
      {isEditing ? (
        <div className="flex space-x-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button onClick={handleSaveClick} className="bg-green-500 text-white px-2 py-1 rounded">
            Save
          </button>
          <button onClick={handleCancelClick} className="bg-gray-500 text-white px-2 py-1 rounded">
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <input type="text" value={attributeValue} readOnly className="border px-2 py-1 rounded bg-gray-100" />
          <button onClick={handleEditClick} className="bg-blue-500 text-white px-2 py-1 rounded">
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default EditableInput;

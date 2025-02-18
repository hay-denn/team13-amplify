import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import EditableInput from "../components/EditableInput";

export const AccountSettings = () => {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");

  useEffect(() => {
    if (auth.user) {
      setEmail(auth.user.profile.email || "");
      setFirstName(auth.user.profile.name || "");
      setFamilyName(auth.user.profile.family_name || "");
    }
  }, [auth.user]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Account Settings</h2>
      <EditableInput attributeValue= {email} attributeName="email" />
      <EditableInput attributeValue= {firstName} attributeName="name" />
      <EditableInput attributeValue= {familyName} attributeName="family_name" />
    </div>
  );
}
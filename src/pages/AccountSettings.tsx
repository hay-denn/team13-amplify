import { useAuth } from "react-oidc-context";
import EditableInput from "../components/EditableInput";

//add a link to password reset page
//make it look better
//fix the navbar so it's applied in App and not individual pages
export const AccountSettings = () => {
  const auth = useAuth();
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Account Settings</h2>
      <EditableInput attributeName="Email: " attributeValue={auth.user?.profile.email || ""} />
      <EditableInput attributeName="First Name: " attributeValue={auth.user?.profile.name || ""} />
      <EditableInput attributeName="Family Name: " attributeValue={auth.user?.profile.family_name || ""} />
      <h3>Password: For security reasons, passwords can only be reset. Please sign out and click "Forgot password" on sign in screen.</h3>
    </div>
  );
}
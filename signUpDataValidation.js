const handler = async (event) => {
    if (event.request.userAttributes.name.length > 30)
    {
        throw new Error("First Name must be 30 characters or less");
    }
    else if (event.request.userAttributes.family_name.length > 30)
    {
        throw new Error("Last Name must be 30 characters or less")
    }
  
    return event;
  };
  
export { handler };
const handler = async (event) => {

    const givenCount = event.request.userAttributes.given_name ? event.request.userAttributes.given_name.length : 0;
    const familyCount = event.request.userAttributes.family_name ? event.request.userAttributes.family_name.length : 0;

    if (givenCount > 30)
    {
        throw new Error("First Name must be 30 characters or less");
    }
    else if (familyCount > 30)
    {
        throw new Error("Last Name must be 30 characters or less")
    }
  
    return event;
  };
  
export { handler };
// Function to filter on showing id, name & email
export function filterUser(user) {
    const { id, name, email } = user;
    return { id, name, email };
  }
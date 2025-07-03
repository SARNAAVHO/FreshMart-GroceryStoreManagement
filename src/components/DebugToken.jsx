import { useAuth } from "@clerk/clerk-react";

function DebugToken() {
  const { getToken } = useAuth();

  const handleClick = async () => {
    const token = await getToken();
    console.log("JWT Token:", token);
    console.log("Decoded Header:", JSON.parse(atob(token.split('.')[0])));
  };

  return <button onClick={handleClick}>Print JWT Token</button>;
}

export default DebugToken;

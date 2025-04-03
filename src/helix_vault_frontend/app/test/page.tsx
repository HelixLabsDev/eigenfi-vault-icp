export default async function Page() {
  try {
    // Fetch data and await the response
    const response = await fetch(
      "https://helix-vault-mainnet-0817d5e490c7.herokuapp.com/movement/0x24bdaf9fb97d9c12fdf1e2723c84458ede48d6ac11b85e1ab1c3b5b399e73d28"
    );

    // Parse the JSON response
    const data = await response.json();

    // Return the component with the data
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Movement Data</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  } catch (error) {
    // Handle any errors
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Error</h1>
        <p className="text-red-500">
          Failed to fetch data:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

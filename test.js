import { handler } from "./index.mjs";

// Mock event and context
const mockEvent = {}; // Populate with any test data you need
const mockContext = {};

// Call the handler
handler(mockEvent, mockContext)
  .then((result) => console.log("Handler output:", result))
  .catch((error) => console.error("Error:", error));

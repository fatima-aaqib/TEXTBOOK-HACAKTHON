// Chatbot loader script
// This script dynamically loads the chatbot component after the page has loaded

document.addEventListener('DOMContentLoaded', function() {
  // Create a container for the chatbot
  const chatbotContainer = document.createElement('div');
  chatbotContainer.id = 'chatbot-root';
  document.body.appendChild(chatbotContainer);

  // Dynamically import and render the chatbot
  // Since we can't use React directly in a plain JS file,
  // we'll create a simple DOM element that will be replaced by React
  console.log('Chatbot loader initialized');
  
  // Initialize the chatbot after a short delay to ensure page is fully loaded
  setTimeout(() => {
    initializeChatbot();
  }, 1000);
});

function initializeChatbot() {
  // Check if React and ReactDOM are available
  if (window.React && window.ReactDOM) {
    // Create the chatbot element
    const chatbotDiv = document.createElement('div');
    chatbotDiv.id = 'physical-ai-chatbot';
    document.body.appendChild(chatbotDiv);
    
    // The React component will be loaded via the Docusaurus build process
    console.log('Physical AI Chatbot initialized');
  } else {
    console.warn('React not available, chatbot will not load');
  }
}